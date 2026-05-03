// lib/email.ts
import nodemailer from 'nodemailer';
import { sql } from '@/lib/db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Kirim email via SMTP (kalau dikonfigurasi) atau simpan ke database.
 * Semua email selalu di-log ke tabel email_logs.
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ sent: boolean; id?: number }> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"ALIFA Institute" <noreply@alifa.ac.id>`;

  // Always create email_logs table
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body_html TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
  } catch {}

  // Save to database
  let logId: number | undefined;
  try {
    const [log] = await sql`
      INSERT INTO email_logs (recipient, subject, body_html, status)
      VALUES (${to}, ${subject}, ${html}, 'pending')
      RETURNING id
    `;
    logId = log?.id;
  } catch {}

  // Try sending via SMTP
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({ from, to, subject, html });

      // Update status
      if (logId) await sql`UPDATE email_logs SET status = 'sent' WHERE id = ${logId}`;
      return { sent: true, id: logId };
    } catch (error: any) {
      if (logId) {
        await sql`UPDATE email_logs SET status = 'failed', error = ${error.message?.slice(0, 500)} WHERE id = ${logId}`;
      }
      return { sent: false, id: logId };
    }
  }

  // No SMTP configured — mark as pending (dummy mode)
  if (logId) await sql`UPDATE email_logs SET status = 'pending' WHERE id = ${logId}`;
  return { sent: false, id: logId };
}

export function resetPasswordEmail(resetUrl: string, userName?: string): string {
  return `
<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:20px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
<div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">ALIFA Institute</h1></div>
<div style="padding:32px">
<h2>Reset Password</h2>
<p style="color:#64748b;line-height:1.6">${userName ? `Halo <strong>${userName}</strong>,<br>` : ''}Klik tombol di bawah untuk reset password Anda:</p>
<div style="text-align:center;margin:24px 0">
<a href="${resetUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:bold">Reset Password</a></div>
<p style="color:#94a3b8;font-size:12px">Link berlaku <strong>1 jam</strong>.</p>
</div></div></body></html>`;
}

export function invitationEmail(loginUrl: string, email: string, password: string, userName?: string): string {
  return `
<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:20px">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
<div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:24px">🎓 Selamat Datang!</h1></div>
<div style="padding:32px">
<h2>${userName || 'Halo'}!</h2>
<p style="color:#64748b;line-height:1.6">Akun ALIFA LMS Anda sudah siap:</p>
<div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:16px 0">
<p><strong>Email:</strong> ${email}</p>
<p><strong>Password:</strong> <code style="background:#e2e8f0;padding:2px 8px;border-radius:4px">${password}</code></p></div>
<div style="text-align:center;margin:24px 0">
<a href="${loginUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:bold">Login Sekarang</a></div>
<p style="color:#94a3b8;font-size:12px">Segera ganti password setelah login pertama.</p>
</div></div></body></html>`;
}
