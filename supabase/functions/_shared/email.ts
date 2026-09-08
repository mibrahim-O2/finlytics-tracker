// Resend email delivery + HTML/text rendering for Finlytics notifications.

const BG = '#011613';
const GREEN = '#72FF85';
const TEAL = '#27968F';

export function pkr(n: number): string {
  return `Rs. ${Math.round(n || 0).toLocaleString('en-US')}`;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM') ?? 'Finlytics <onboarding@resend.dev>';
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text }),
  });

  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  }
}

function catRows(rows: { name: string; amount: number; pct: number }[]): string {
  if (!rows.length) return '<tr><td style="padding:6px 0;color:#94a3b8">Nothing recorded.</td></tr>';
  return rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 0">${r.name}</td>` +
        `<td style="padding:6px 0;text-align:right">${pkr(r.amount)} · ${r.pct}%</td></tr>`,
    )
    .join('');
}

// deno-lint-ignore no-explicit-any
export function renderReportEmail(report: any): { subject: string; html: string; text: string } {
  const isMonthly = report.period.type === 'monthly';
  const title = isMonthly
    ? `Finlytics statement — ${report.period.label}`
    : `Finlytics annual summary — ${report.period.label}`;

  const t = report.totals;
  const monthTable =
    !isMonthly
      ? `<h3 style="margin:20px 0 6px">Month by month</h3><table style="width:100%;border-collapse:collapse;font-size:14px">
         <tr style="color:#94a3b8;text-align:right"><th style="text-align:left">Month</th><th>Income</th><th>Expense</th><th>Net</th></tr>
         ${report.byMonth
           .map(
             // deno-lint-ignore no-explicit-any
             (m: any) =>
               `<tr style="text-align:right"><td style="text-align:left;padding:4px 0">${m.label}</td><td>${pkr(
                 m.income,
               )}</td><td>${pkr(m.expense)}</td><td>${pkr(m.net)}</td></tr>`,
           )
           .join('')}
         </table>`
      : '';

  const goalLine =
    isMonthly && report.goal
      ? `<p style="margin:8px 0;font-size:14px">Goal range ${pkr(report.goal.min)} – ${pkr(
          report.goal.max,
        )} · ${report.goalStatus?.pct ?? 0}% of maximum used</p>`
      : '';

  const html = `<div style="background:${BG};color:#fff;font-family:Segoe UI,Arial,sans-serif;padding:28px">
    <div style="max-width:560px;margin:0 auto">
      <h1 style="font-size:20px;margin:0 0 4px">Fin<span style="color:${GREEN}">lytics</span></h1>
      <p style="color:#94a3b8;margin:0 0 20px">${title}</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        <tr><td style="padding:6px 0">Total income</td><td style="text-align:right;color:${GREEN}">${pkr(t.income)}</td></tr>
        <tr><td style="padding:6px 0">Total expense</td><td style="text-align:right">${pkr(t.expense)}</td></tr>
        <tr><td style="padding:6px 0;border-top:1px solid ${TEAL}55">Net</td><td style="text-align:right;border-top:1px solid ${TEAL}55">${pkr(t.net)}</td></tr>
      </table>
      ${goalLine}
      <p style="color:#94a3b8;font-size:13px;margin:6px 0 0">${t.transactionCount} transaction(s)${
        !isMonthly ? ` across ${t.monthsWithData} month(s) with data` : ''
      }</p>
      ${monthTable}
      <h3 style="margin:20px 0 6px">Expense by category</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${catRows(report.expenseByCategory)}</table>
      <h3 style="margin:20px 0 6px">Income by category</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${catRows(report.incomeByCategory)}</table>
      <p style="color:#64748b;font-size:12px;margin-top:24px">Sent by Finlytics.</p>
    </div>
  </div>`;

  const text = [
    title,
    '',
    `Total income:  ${pkr(t.income)}`,
    `Total expense: ${pkr(t.expense)}`,
    `Net:           ${pkr(t.net)}`,
    `Transactions:  ${t.transactionCount}`,
    '',
    'Expense by category:',
    ...report.expenseByCategory.map((r: { name: string; amount: number; pct: number }) =>
      `  ${r.name}: ${pkr(r.amount)} (${r.pct}%)`,
    ),
    '',
    'Income by category:',
    ...report.incomeByCategory.map((r: { name: string; amount: number; pct: number }) =>
      `  ${r.name}: ${pkr(r.amount)} (${r.pct}%)`,
    ),
  ].join('\n');

  return { subject: title, html, text };
}

export function renderReminderEmail(message: string): { subject: string; html: string; text: string } {
  const subject = 'Finlytics — log today’s spending';
  const html = `<div style="background:${BG};color:#fff;font-family:Segoe UI,Arial,sans-serif;padding:28px">
    <div style="max-width:520px;margin:0 auto">
      <h1 style="font-size:20px;margin:0 0 12px">Fin<span style="color:${GREEN}">lytics</span></h1>
      <p style="font-size:16px;margin:0 0 8px">Good morning!</p>
      <p style="color:#cbd5e1;margin:0 0 16px">${message}</p>
      <p style="color:#94a3b8;font-size:13px">Open Finlytics and add today’s transactions so nothing slips through.</p>
    </div>
  </div>`;
  const text = `Good morning!\n\n${message}\n\nOpen Finlytics and add today's transactions.`;
  return { subject, html, text };
}
