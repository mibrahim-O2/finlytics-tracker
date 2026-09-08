// WhatsApp delivery — inert until WHATSAPP_ENABLED === 'true'.
// Kept wired into send-report / send-reminder so enabling it later is a
// config change only (set the secret + template names), no code change.

export function whatsappEnabled(): boolean {
  return (Deno.env.get('WHATSAPP_ENABLED') ?? 'false').toLowerCase() === 'true';
}

export async function sendWhatsAppText(body: string): Promise<{ skipped: boolean }> {
  if (!whatsappEnabled()) return { skipped: true };

  const token = Deno.env.get('WHATSAPP_TOKEN');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const to = Deno.env.get('WHATSAPP_RECIPIENT');
  if (!token || !phoneId || !to) {
    throw new Error('WHATSAPP_ENABLED is true but WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_RECIPIENT are missing');
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp error ${res.status}: ${await res.text()}`);
  return { skipped: false };
}
