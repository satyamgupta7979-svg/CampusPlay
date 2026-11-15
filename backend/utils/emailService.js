import nodemailer from 'nodemailer';

/**
 * Email Service for CampusPlay MFA
 *
 * In production: uses Gmail SMTP (requires GMAIL_USER + GMAIL_APP_PASSWORD).
 * In development: if Gmail fails, automatically falls back to Ethereal
 *   (test email service) and prints a preview URL to the console.
 */

let cachedTransporter = null;
let transporterMode = null; // 'gmail' | 'ethereal'

/** Create Gmail SMTP transporter */
function createGmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });
}

/** Create Ethereal test transporter (dev fallback) */
async function createEtherealTransporter() {
  const testAccount = await nodemailer.createTestAccount();
  console.log('[Email Service]: Using Ethereal test account for development');
  console.log(`[Email Service]: Ethereal user: ${testAccount.user}`);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/** Get a working transporter (Gmail first, Ethereal fallback in dev) */
async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const hasGmailConfig = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;

  if (hasGmailConfig) {
    try {
      const gmail = createGmailTransporter();
      await gmail.verify();
      cachedTransporter = gmail;
      transporterMode = 'gmail';
      console.log('[Email Service]: Gmail SMTP verified successfully');
      return cachedTransporter;
    } catch (err) {
      console.warn('[Email Service]: Gmail SMTP failed:', err.message);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Gmail SMTP authentication failed. Check GMAIL_USER and GMAIL_APP_PASSWORD.');
      }
      console.log('[Email Service]: Falling back to Ethereal for development...');
    }
  }

  // Development fallback: Ethereal
  if (process.env.NODE_ENV !== 'production') {
    try {
      cachedTransporter = await createEtherealTransporter();
      transporterMode = 'ethereal';
      return cachedTransporter;
    } catch (err) {
      throw new Error('Could not create any email transporter: ' + err.message);
    }
  }

  throw new Error('Email service not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
}

/**
 * Builds the HTML email body for OTP verification.
 */
function buildOtpEmailHtml(otp, expiryMinutes = 5) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CampusPlay Verification</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#d5f28d;letter-spacing:-0.04em;">Campus</span><span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.04em;">Play</span>
              <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Secure Login Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hello,</p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                We received a login request for your CampusPlay account. Use the verification code below to complete your sign-in. This code is valid for <strong style="color:#1a1a1a;">${expiryMinutes} minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center;margin:0 0 32px;">
                <div style="display:inline-block;background:#f9fafb;border:2px dashed #d5f28d;border-radius:12px;padding:20px 36px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.12em;">Your Verification Code</p>
                  <p style="margin:0;font-size:40px;font-weight:800;color:#1a1a1a;letter-spacing:0.25em;font-family:'Courier New',monospace;">${otp}</p>
                </div>
              </div>

              <!-- Warning -->
              <div style="background:#fefce8;border-left:4px solid #eab308;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;font-size:13px;color:#854d0e;font-weight:600;">&#x26A0; Never share this code</p>
                <p style="margin:4px 0 0;font-size:13px;color:#92400e;">CampusPlay staff will never ask for your verification code. Do not share it with anyone.</p>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                If you did not attempt to log in to CampusPlay, please ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} CampusPlay &mdash; College Sports &amp; Tournament Management
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">This is an automated message. Please do not reply.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send the OTP email to the user.
 * In dev mode with Ethereal, prints a preview URL to the console.
 */
export async function sendOtpEmail(toEmail, otp) {
  const transporter = await getTransporter();
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);

  const mailOptions = {
    from: transporterMode === 'gmail'
      ? `"CampusPlay Security" <${process.env.GMAIL_USER}>`
      : '"CampusPlay Security" <noreply@campusplay.dev>',
    to: toEmail,
    subject: 'CampusPlay - Your Login Verification Code',
    html: buildOtpEmailHtml(otp, expiryMinutes),
    text: `Your CampusPlay verification code is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes.\n\nIf you did not request this, please ignore this email.`,
  };

  const info = await transporter.sendMail(mailOptions);

  // In Ethereal mode, print the preview URL so the developer can see the email
  if (transporterMode === 'ethereal') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│  📧 OTP EMAIL SENT (Development Mode - Ethereal)            │');
    console.log('│                                                              │');
    console.log(`│  To: ${toEmail.padEnd(52)}│`);
    console.log('│                                                              │');
    console.log(`│  👉 View email: ${String(previewUrl).padEnd(42)}│`);
    console.log('│                                                              │');
    console.log('│  Open the link above in your browser to see the OTP code.   │');
    console.log('└──────────────────────────────────────────────────────────────┘');
  }

  return true;
}

/**
 * Verify that the email transporter can connect.
 * Used during server startup.
 */
export async function verifyEmailTransporter() {
  try {
    await getTransporter();
    return true;
  } catch (err) {
    console.warn('[Email Service]:', err.message);
    return false;
  }
}
