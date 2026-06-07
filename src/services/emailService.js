import nodemailer from 'nodemailer';

const FE_URL = process.env.FE_URL || 'https://pwa-home.vercel.app';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const isConfigured = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS);

/**
 * Gửi email OTP xác thực tài khoản.
 * @returns {boolean} true nếu gửi được, false nếu demo mode
 */
export const sendOtpEmail = async (toEmail, recipientName, otpCode) => {
  if (!isConfigured()) {
    const border = '═'.repeat(38);
    console.log(`\n╔${border}╗`);
    console.log(`║        PAW Home — Demo Email Mode        ║`);
    console.log(`╠${border}╣`);
    console.log(`║  📧 To : ${toEmail.padEnd(29)}║`);
    console.log(`║  👤 Name: ${recipientName.padEnd(28)}║`);
    console.log(`║  🔑 OTP : ${otpCode.padEnd(28)}║`);
    console.log(`╚${border}╝\n`);
    return false;
  }

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(85,55,34,0.15);max-width:100%;">

        <tr>
          <td style="background:#553722;padding:40px 32px;text-align:center;">
            <div style="font-size:48px;line-height:1;margin-bottom:12px;">🐾</div>
            <h1 style="color:#fff;margin:0;font-size:30px;font-weight:900;letter-spacing:-1px;">PAW Home</h1>
            <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">Nền tảng kết nối cứu hộ thú cưng tại Đà Nẵng</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 32px 32px;">
            <p style="font-size:16px;color:#333;margin:0 0 6px;">
              Xin chào <strong style="color:#553722;">${recipientName}</strong>,
            </p>
            <p style="font-size:14px;color:#666;margin:0 0 28px;line-height:1.7;">
              Cảm ơn bạn đã đăng ký tại <strong>PAW Home</strong>.
              Dùng mã bên dưới để hoàn tất đăng ký:
            </p>

            <div style="background:#fdf6f0;border:2px dashed #553722;border-radius:20px;padding:32px 24px;text-align:center;margin-bottom:24px;">
              <div style="font-size:56px;font-weight:900;color:#553722;letter-spacing:14px;font-family:'Courier New',monospace;line-height:1;">
                ${otpCode}
              </div>
              <div style="font-size:11px;color:#999;margin-top:12px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">
                Mã xác thực OTP
              </div>
            </div>

            <div style="background:#fff8e7;border-radius:14px;padding:16px 20px;margin-bottom:20px;">
              <p style="margin:0;font-size:13px;color:#7a5c00;line-height:1.7;">
                ⏰ Mã có hiệu lực trong <strong>10 phút</strong>.<br>
                🔒 Không chia sẻ mã này với bất kỳ ai.
              </p>
            </div>

            <p style="font-size:12px;color:#bbb;margin:0;line-height:1.6;">
              Nếu bạn không thực hiện đăng ký này, hãy bỏ qua email này.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9f6f3;padding:20px 32px;text-align:center;border-top:1px solid #f0e8df;">
            <p style="margin:0;font-size:12px;color:#ccc;">© 2025 PAW Home · Đà Nẵng, Việt Nam</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const transporter = createTransporter();
  try {
    const info = await transporter.sendMail({
      from: `"PAW Home 🐾" <${process.env.SMTP_USER}>`,
      to:      toEmail,
      subject: `[PAW Home] Mã xác thực OTP: ${otpCode}`,
      html,
    });
    console.log(`[Email] OTP sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[Email] SMTP error sending OTP to ${toEmail}:`, err.message);
    throw err;
  }

  return true;
};

/**
 * Gửi email đặt lại mật khẩu.
 * @returns {boolean} true nếu gửi được, false nếu demo mode
 */
export const sendResetPasswordEmail = async (toEmail, recipientName, token) => {
  const resetUrl = `${FE_URL}/reset-password?token=${token}`;

  if (!isConfigured()) {
    console.log('Reset URL (demo):', resetUrl);
    return false;
  }

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(85,55,34,0.15);max-width:100%;">

        <tr>
          <td style="background:#553722;padding:40px 32px;text-align:center;">
            <div style="font-size:48px;line-height:1;margin-bottom:12px;">🔐</div>
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;">Đặt lại mật khẩu</h1>
            <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">PAW Home Security</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 32px 32px;">
            <p style="font-size:16px;color:#333;margin:0 0 6px;">Xin chào <strong style="color:#553722;">${recipientName}</strong>,</p>
            <p style="font-size:14px;color:#666;margin:0 0 28px;line-height:1.7;">
              Nhấn vào nút bên dưới để tạo mật khẩu mới:
            </p>

            <div style="text-align:center;margin:0 0 24px;">
              <a href="${resetUrl}"
                style="display:inline-block;background:#553722;color:#fff;text-decoration:none;font-weight:900;font-size:16px;padding:16px 40px;border-radius:16px;box-shadow:0 4px 16px rgba(85,55,34,0.3);">
                🔑 Đặt lại mật khẩu
              </a>
            </div>

            <p style="font-size:12px;color:#aaa;text-align:center;margin:0 0 20px;word-break:break-all;">
              Hoặc copy: <a href="${resetUrl}" style="color:#553722;">${resetUrl}</a>
            </p>

            <div style="background:#fff8e7;border-radius:14px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#7a5c00;line-height:1.7;">
                ⏰ Liên kết có hiệu lực trong <strong>1 giờ</strong>.<br>
                🔒 Nếu bạn không yêu cầu, hãy bỏ qua email này.
              </p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#f9f6f3;padding:20px 32px;text-align:center;border-top:1px solid #f0e8df;">
            <p style="margin:0;font-size:12px;color:#ccc;">© 2025 PAW Home · Đà Nẵng, Việt Nam</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const transporter = createTransporter();
  try {
    const info = await transporter.sendMail({
      from:    `"PAW Home 🐾" <${process.env.SMTP_USER}>`,
      to:      toEmail,
      subject: '[PAW Home] Yêu cầu đặt lại mật khẩu',
      html,
    });
    console.log(`[Email] Reset password sent to ${toEmail} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[Email] SMTP error sending reset password to ${toEmail}:`, err.message);
    throw err;
  }

  return true;
};
