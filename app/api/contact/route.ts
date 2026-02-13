import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein'),
  company: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, message, company } = parsed.data;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'E-Mail-Service nicht konfiguriert' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // Use verified domain sender, or fall back to Resend onboarding address
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Pixyo <onboarding@resend.dev>';

    // Sanitize inputs for HTML email
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // Send notification to tom@actualize.de
    await resend.emails.send({
      from: fromAddress,
      to: ['tom@actualize.de'],
      replyTo: email,
      subject: `Neue Anfrage von ${esc(name)}${company ? ` (${esc(company)})` : ''}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="border-bottom: 2px solid #E8710A; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Neue Kontaktanfrage</h1>
            <p style="color: #666; margin: 8px 0 0;">via pixyo.de</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #1a1a1a;">${esc(name)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; vertical-align: top;">E-Mail</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="mailto:${esc(email)}" style="color: #E8710A;">${esc(email)}</a></td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; vertical-align: top;">Unternehmen</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #1a1a1a;">${esc(company)}</td>
            </tr>
            ` : ''}
          </table>

          <div style="background: #f8f8f8; border-left: 3px solid #E8710A; padding: 20px; margin-bottom: 30px;">
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Nachricht</p>
            <p style="color: #1a1a1a; line-height: 1.6; margin: 0; white-space: pre-wrap;">${esc(message)}</p>
          </div>

          <p style="color: #aaa; font-size: 12px;">
            Direkt antworten — Reply-To ist auf ${esc(email)} gesetzt.
          </p>
        </div>
      `,
    });

    // Send confirmation to the sender
    await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: 'Danke für deine Anfrage — Pixyo',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="border-bottom: 2px solid #E8710A; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Danke, ${esc(name)}.</h1>
          </div>

          <p style="color: #444; line-height: 1.6; font-size: 16px;">
            Wir haben deine Anfrage erhalten und melden uns innerhalb von 24 Stunden bei dir.
          </p>

          <p style="color: #444; line-height: 1.6; font-size: 16px;">
            Falls du in der Zwischenzeit Fragen hast, erreichst du uns jederzeit unter
            <a href="mailto:hallo@pixyo.de" style="color: #E8710A;">hallo@pixyo.de</a>.
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #aaa; font-size: 13px; margin: 0;">
              Pixyo — KI-Tools & digitale Werkzeuge für Marken
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Nachricht konnte nicht gesendet werden' },
      { status: 500 }
    );
  }
}
