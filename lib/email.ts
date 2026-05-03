// lib/email.ts
// SMTP Email utility — support Gmail, Resend, SendGrid, Brevo, dll
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Kirim email via SMTP.
 * 
 * Environment variables yang diperlukan:
 *   SMTP_HOST     (default: smtp.gmail.com)
 *   SMTP_PORT     (default: 587)
 *   SMTP_USER     (email pengirim)
 *   SMTP_PASS     (app password / API key)
 *   SMTP_FROM     (nama pengirim, default: ALIFA Institute)
 * 
 * Kalau tidak di-set, email akan di-log ke console (development mode).
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"ALIFA Institute" <${user || 'noreply@alifa.ac.id'}>`;

  if (!user || !pass) {
    // Development: log email ke console
    console.log('\n📧 === EMAIL (not sent - SMTP not configured) ===');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   HTML:    ${html.slice(0, 200)}...`);
    console.log('📧 =============================================\n');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({ from, to, subject, html });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error);
    return false;
  }
}

/**
 * Template: Reset password
 */
export function resetPasswordEmail(resetUrl: string, userName?: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">ALIFA Institute</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Learning Management System</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 8px; color: #1e293b;">Reset Password</h2>
      <p style="color: #64748b; line-height: 1.6;">
        ${userName ? `Halo <strong>${userName}</strong>,<br>` : ''}
        Anda menerima email ini karena ada permintaan reset password untuk akun Anda.
        Klik tombol di bawah untuk membuat password baru:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
        Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="color: #94a3b8; font-size: 11px;">
        &copy; ${new Date().getFullYear()} ALIFA Institute. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Template: Undangan aktivasi akun
 */
export function invitationEmail(loginUrl: string, email: string, password: string, userName?: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 24px;">🎓 Selamat Datang!</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Akun ALIFA LMS Anda sudah siap</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 8px; color: #1e293b;">${userName || 'Halo'}!</h2>
      <p style="color: #64748b; line-height: 1.6;">
        Akun Learning Management System Anda telah dibuat. Gunakan kredensial berikut untuk login:
      </p>
      <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px; font-size: 14px;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 0; font-size: 14px;"><strong>Password:</strong> <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${password}</code></p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: #10b981; color: #fff; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Login Sekarang
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
        Demi keamanan, segera ganti password Anda setelah login pertama.<br>
        Login di: <a href="${loginUrl}" style="color: #0ea5e9;">${loginUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
