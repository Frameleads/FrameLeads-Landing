import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ACTION 1: SILENT MAILCHIMP DATABASE INJECTION
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const DATACENTER = process.env.MAILCHIMP_API_SERVER;

    if (API_KEY && AUDIENCE_ID && DATACENTER) {
      const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;
      const data = {
        email_address: email,
        status: 'subscribed',
      };
      
      // We catch errors silently so returning users still get the email payload
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `apikey ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(console.error);
    }

    // ACTION 2: DIRECT GMAIL SMTP DELIVERY
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"FrameLeads" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '[ACCESS] The AI SDR Prompt Framework',
      text: `System access granted.\n\nYou can access the 9-page Prompt Architecture here:\nhttps://app.notion.com/p/The-AI-SDR-Prompt-Framework-3aad3b04e2088036a4d7f7a727009a5b?source=copy_link\n\nA quick reminder before you deploy these into your workflow: volume and brand safety are not a trade-off. Do not remove the human-in-the-loop constraint. The machine drafts, but you must remain the review layer.\n\nThese 5 prompts will immediately put your reply quality in the top 1% of your industry. But if you find yourself hitting a ceiling with the manual copy-pasting, it means you've outgrown prompts and you need infrastructure.\n\nWhen that happens, you know where to find the automated architecture.\n\nBest,\n\nFounder, FrameLeads`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
