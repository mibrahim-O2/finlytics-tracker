import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, authorize, getAppUser } from '../_shared/supabase.ts';
import { buildMonthlyReport, buildAnnualReport } from '../_shared/report.ts';
import { renderReportEmail, sendEmail } from '../_shared/email.ts';
import { sendWhatsAppText } from '../_shared/whatsapp.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = adminClient();
    const caller = await authorize(req, admin);
    const isCron = caller === 'cron';

    const body = await req.json().catch(() => ({}));
    const user = await getAppUser(admin);
    // Recipient: explicit override, else the single account's own email.
    const recipient = Deno.env.get('REPORT_RECIPIENT_EMAIL') || user.email;

    // Build the list of (type, year, month) reports to send.
    type Job = { type: 'monthly' | 'annual'; year: number; month?: number };
    let jobs: Job[] = [];

    if (body.auto) {
      const now = new Date();
      // Previous calendar month (cron is expected to run on the 1st).
      const py = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
      const pm = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth();
      jobs.push({ type: 'monthly', year: py, month: pm });
      // Year just ended -> also send the annual (covers a partial first year too).
      if (pm === 12) jobs.push({ type: 'annual', year: py });
    } else if (body.type === 'monthly') {
      jobs = [{ type: 'monthly', year: Number(body.year), month: Number(body.month) }];
    } else if (body.type === 'annual') {
      jobs = [{ type: 'annual', year: Number(body.year) }];
    } else {
      return json({ error: 'Provide { type: "monthly"|"annual", ... } or { auto: true }' }, 400);
    }

    // Respect the email toggle for scheduled sends; manual sends are explicit.
    if (isCron) {
      const { data: ns } = await admin
        .from('notification_settings')
        .select('email_enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      if (ns && ns.email_enabled === false) {
        return json({ message: 'Email notifications are disabled — nothing sent.' });
      }
    }

    const results: string[] = [];

    for (const job of jobs) {
      const periodKey =
        job.type === 'monthly'
          ? `${job.year}-${String(job.month).padStart(2, '0')}`
          : `${job.year}`;
      const kind = job.type === 'monthly' ? 'monthly_report' : 'annual_report';

      if (isCron) {
        const { data: already } = await admin
          .from('notification_log')
          .select('id')
          .eq('user_id', user.id)
          .eq('kind', kind)
          .eq('period_key', periodKey)
          .eq('channel', 'email')
          .maybeSingle();
        if (already) {
          results.push(`${kind} ${periodKey}: already sent`);
          continue;
        }
      }

      const report =
        job.type === 'monthly'
          ? await buildMonthlyReport(admin, user.id, job.year, job.month!)
          : await buildAnnualReport(admin, user.id, job.year);

      const mail = renderReportEmail(report);
      await sendEmail({ to: recipient, ...mail });
      const wa = await sendWhatsAppText(mail.text).catch(() => ({ skipped: true }));

      await admin.from('notification_log').insert({
        user_id: user.id,
        kind,
        period_key: periodKey,
        channel: 'email',
        status: 'sent',
        detail: wa.skipped ? 'email only' : 'email + whatsapp',
      });

      results.push(`${kind} ${periodKey}: sent to ${recipient}`);
    }

    return json({ message: results.join('; ') });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, msg === 'Unauthorized' ? 401 : 500);
  }
});
