import nodemailer from 'nodemailer';

const FE_URL = process.env.FE_URL || 'http://localhost:3000';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

/**
 * Gửi email OTP xác thực tài khoản.
 * @returns {boolean} true nếu email được gửi, false nếu ở demo mode (chưa cấu hình SMTP)
 */
export const sendOtpEmail = async (toEmail, recipientName, otpCode) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
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

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã OTP - PAW Home</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(85,55,34,0.15);max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#553722;padding:40px 32px;text-align:center;">
              <div style="font-size:48px;line-height:1;margin-bottom:12px;">🐾</div>
              <h1 style="color:#ffffff;margin:0;font-size:30px;font-weight:900;letter-spacing:-1px;">PAW Home</h1>
              <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">
                Nền tảng kết nối cứu hộ thú cưng tại Đà Nẵng
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px 32px;">
              <p style="font-size:16px;color:#333333;margin:0 0 6px;">
                Xin chào <strong style="color:#553722;">${recipientName}</strong>,
              </p>
              <p style="font-size:14px;color:#666666;margin:0 0 28px;line-height:1.7;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>PAW Home</strong>.
                Vui lòng sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng ký:
              </p>

              <!-- OTP Box -->
              <div style="background:#fdf6f0;border:2px dashed #553722;border-radius:20px;padding:32px 24px;text-align:center;margin-bottom:24px;">
                <div style="font-size:56px;font-weight:900;color:#553722;letter-spacing:14px;font-family:'Courier New',monospace;line-height:1;">
                  ${otpCode}
                </div>
                <div style="font-size:11px;color:#999999;margin-top:12px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">
                  Mã xác thực OTP
                </div>
              </div>

              <!-- Warning -->
              <div style="background:#fff8e7;border-radius:14px;padding:16px 20px;margin-bottom:20px;">
                <p style="margin:0;font-size:13px;color:#7a5c00;line-height:1.7;">
                  ⏰ Mã này có hiệu lực trong <strong>10 phút</strong> kể từ khi nhận được email.<br>
                  🔒 Không chia sẻ mã này với bất kỳ ai — PAW Home sẽ <strong>không bao giờ</strong> hỏi bạn về mã OTP.
                </p>
              </div>

              <p style="font-size:12px;color:#bbbbbb;margin:0;line-height:1.6;">
                Nếu bạn không thực hiện đăng ký này, hãy bỏ qua email này một cách an toàn.
                Tài khoản sẽ không được kích hoạt nếu không hoàn tất xác thực.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f6f3;padding:20px 32px;text-align:center;border-top:1px solid #f0e8df;">
              <p style="margin:0;font-size:12px;color:#cccccc;">
                © 2025 PAW Home · Đà Nẵng, Việt Nam
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"PAW Home 🐾" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `[PAW Home] Mã xác thực OTP: ${otpCode}`,
    html
  });

  return true;
};

/**
 * Gửi email đặt lại mật khẩu.
 * @returns {boolean} true nếu gửi được, false nếu demo mode
 */
export const sendResetPasswordEmail = async (toEmail, recipientName, token) => {
  const resetUrl = `${FE_URL}/reset-password?token=${token}`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const border = '═'.repeat(38);
    console.log(`\n╔${border}╗`);
    console.log(`║      PAW Home — Reset Password Demo      ║`);
    console.log(`╠${border}╣`);
    console.log(`║  📧 To  : ${toEmail.padEnd(28)}║`);
    console.log(`║  🔗 URL : ${resetUrl.substring(0, 28).padEnd(28)}║`);
    console.log(`╚${border}╝\n`);
    console.log('Full reset URL:', resetUrl);
    return false;
  }

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0" role="presentation"
        style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(85,55,34,0.15);max-width:100%;">

        <tr>
          <td style="background:#553722;padding:40px 32px;text-align:center;">
            <div style="font-size:48px;line-height:1;margin-bottom:12px;">🔐</div>
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-1px;">Đặt lại mật khẩu</h1>
            <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">PAW Home Security</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 32px 32px;">
            <p style="font-size:16px;color:#333;margin:0 0 6px;">Xin chào <strong style="color:#553722;">${recipientName}</strong>,</p>
            <p style="font-size:14px;color:#666;margin:0 0 28px;line-height:1.7;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
              Nhấn vào nút bên dưới để tạo mật khẩu mới:
            </p>

            <div style="text-align:center;margin:0 0 24px;">
              <a href="${resetUrl}"
                style="display:inline-block;background:#553722;color:#fff;text-decoration:none;font-weight:900;font-size:16px;padding:16px 40px;border-radius:16px;letter-spacing:-0.5px;box-shadow:0 4px 16px rgba(85,55,34,0.3);">
                🔑 Đặt lại mật khẩu
              </a>
            </div>

            <p style="font-size:12px;color:#aaa;text-align:center;margin:0 0 20px;word-break:break-all;">
              Hoặc copy URL: <a href="${resetUrl}" style="color:#553722;">${resetUrl}</a>
            </p>

            <div style="background:#fff8e7;border-radius:14px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#7a5c00;line-height:1.7;">
                ⏰ Liên kết có hiệu lực trong <strong>1 giờ</strong>.<br>
                🔒 Nếu bạn không yêu cầu việc này, hãy bỏ qua email — mật khẩu sẽ không thay đổi.
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

  await transporter.sendMail({
    from: `"PAW Home 🐾" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '[PAW Home] Yêu cầu đặt lại mật khẩu',
    html
  });

  return true;
};
