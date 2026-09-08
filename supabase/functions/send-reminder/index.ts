import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, authorize, getAppUser } from '../_shared/supabase.ts';
import { renderReminderEmail, sendEmail } from '../_shared/email.ts';
import { sendWhatsAppText } from '../_shared/whatsapp.ts';

const MESSAGES = [
  'A minute today keeps the month on track.',
  'Small entries add up to a clear picture.',
  'Log what you spent — future you will thank you.',
  'Every transaction you record is one less surprise later.',
  'Quick check-in: what did today cost?',
  'Consistency beats perfection. Log today and move on.',
  'A tidy log makes month-end easy.',
];

function dailyMessage(): string {
  return MESSAGES[Math.floor(Date.now() / 86_400_000) % MESSAGES.length];
}

/** Current date (YYYY-MM-DD) and hour in Pakistan time. */
function karachiNow(): { date: string; hour: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24 };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = adminClient();
    const caller = await authorize(req, admin);
    const manual = caller !== 'cron';

    const user = await getAppUser(admin);
    const recipient = Deno.env.get('REPORT_RECIPIENT_EMAIL') || user.email;
    const { data: ns } = await admin
      .from('notification_settings')
      .select('reminder_time,email_enabled,snooze_until')
      .eq('user_id', user.id)
      .maybeSingle();

    if (ns && ns.email_enabled === false && !manual) {
      return json({ message: 'Email notifications are disabled — nothing sent.' });
    }

    const { date: todayPKT, hour: hourPKT } = karachiNow();
    const reminderHour = Number((ns?.reminder_time ?? '08:00').slice(0, 2));
    const dueMorning = hourPKT === reminderHour;
    const snoozeUntil = ns?.snooze_until ? new Date(ns.snooze_until) : null;
    const dueSnooze = snoozeUntil ? new Date() >= snoozeUntil : false;

    if (!manual && !dueMorning && !dueSnooze) {
      return json({ message: `Not reminder time (PKT hour ${hourPKT}, set ${reminderHour}).` });
    }

    const kind = 'reminder';
    const periodKey = manual
      ? `manual:${Date.now()}`
      : dueSnooze
        ? `snooze:${ns!.snooze_until}`
        : todayPKT;

    if (!manual) {
      const { data: already } = await admin
        .from('notification_log')
        .select('id')
        .eq('user_id', user.id)
        .eq('kind', kind)
        .eq('period_key', periodKey)
        .eq('channel', 'email')
        .maybeSingle();
      if (already) {
        if (dueSnooze) await admin.from('notification_settings').update({ snooze_until: null }).eq('user_id', user.id);
        return json({ message: 'Reminder already sent for this period.' });
      }
    }

    // If something is already logged today, no nudge is needed.
    const { count } = await admin
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('date', todayPKT);

    let status = 'sent';
    if ((count ?? 0) > 0 && !manual) {
      status = 'skipped_logged';
    } else {
      const mail = renderReminderEmail(dailyMessage());
      await sendEmail({ to: recipient, ...mail });
      await sendWhatsAppText(mail.text).catch(() => ({ skipped: true }));
    }

    await admin.from('notification_log').insert({
      user_id: user.id,
      kind,
      period_key: periodKey,
      channel: 'email',
      status,
      detail: dueSnooze ? 'snooze reminder' : manual ? 'manual test' : 'morning reminder',
    });

    if (dueSnooze) {
      await admin.from('notification_settings').update({ snooze_until: null }).eq('user_id', user.id);
    }

    return json({
      message:
        status === 'skipped_logged'
          ? 'Already logged today — reminder skipped.'
          : `Reminder emailed to ${recipient}.`,
    });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, msg === 'Unauthorized' ? 401 : 500);
  }
});
