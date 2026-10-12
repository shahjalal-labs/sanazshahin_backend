export const verificationHtml = (fullName: string, otp: string) => {
  return `<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width"/>
  </head>
  <body style="margin:0;padding:0;background: #f5f7fb;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:30px 16px;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(2,6,23,0.08);">
            <tr>
              <td style="background:linear-gradient(90deg, #7b61ff, #00d4ff);padding:28px 30px;color: #fff;text-align:left;">
                <h1 style="margin:0;font-size:22px;letter-spacing:0.2px;">Account verification</h1>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.95; color: #fff;">Hi <strong>${fullName}</strong>,</p>
              </td>
            </tr>

            <tr>
              <td style="background: #ffffff;padding:30px 30px 20px;color: #0f172a;">
                <p style="margin:0 0 14px;font-size:15px;">Use the one-time password (OTP) below to complete your action. This code is valid for <strong>5 minutes</strong>.</p>

                <div style="display:flex;align-items:center;justify-content:center;margin:18px 0;">
                  <div style="font-size:34px;font-weight:700;padding:18px 28px;border-radius:10px;background:linear-gradient(180deg, #fff, #f8fbff);box-shadow:0 6px 18px rgba(11,22,80,0.06);border:1px dashed rgba(0,0,0,0.05);">
                    <span style="letter-spacing:3px;color: #12263f;">${otp}</span>
                  </div>
                </div>

                <p style="margin:0 0 20px;font-size:13px;color: #475569;">If you didn't request this, you can safely ignore this email. For help, reply to this message or contact support.</p>
              </td>
            </tr>

            <tr>
              <td style="background:#0f172a;padding:18px 30px;color:#cbd5e1;font-size:13px;text-align:center;">
                <div>Thanks — Elites Live Stream Support Team</div>
                <div style="opacity:0.7;margin-top:6px;font-size:12px;">If this wasn't you, secure your account immediately.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const forgotPasswordHtml = (fullName: string, otp: string) => `
<!doctype html>
<html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
  <body style="margin:0;padding:0;background:#f1f6ff;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(90deg,#ff8a65,#ffb86b);padding:24px 28px;color:#fff;">
                <h2 style="margin:0;font-size:20px;">Password Reset Request</h2>
                <p style="margin:6px 0 0;font-size:13px;opacity:0.95; color: #fff;">Hello <strong>${fullName}</strong>,</p>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff;padding:24px 28px;color:#0b1220;">
                <p style="font-size:14px;margin:0 0 12px;">We received a request to reset your password. Enter the OTP below to continue. It will expire in <strong>5 minutes</strong>.</p>

                <div style="text-align:center;margin:18px 0;">
                  <div style="display:inline-block;padding:16px 26px;border-radius:12px;border:1px solid #eef2ff;font-size:32px;font-weight:700;">
                    ${otp}
                  </div>
                </div>

                <p style="font-size:13px;color:#55607a;margin-bottom:18px;">If you didn't request a password reset, ignore this email or secure your account.</p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:14px 18px;text-align:center;color:#9aa4b2;font-size:12px;">
                © ${new Date().getFullYear()} Elites-Live Stream — Need help? Reply this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const emailBody = (username: string, otp: string) => {
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
      
      <!-- Header -->
     <div style="background-color: #27c074ff; padding: 20px; text-align: center;">
        <img src="https://nyc3.digitaloceanspaces.com/smtech-space/uploads/messages/files/1762406748731-7yj8hrmorob.png" alt="Company Logo" style="height: 80px; margin-bottom: 10px;" />
        <h2 style="color: #fff; margin: 0;">Sign Up Verification</h2>
      </div>

      <!-- Body -->
      <div style="padding: 30px; text-align: center;">
        <p style="font-size: 16px; color: #00c2d1; margin-bottom: 20px;">
          Hi <b>${username}</b>,
        </p>
        <p style="font-size: 16px; color: #555;">
          Your verification code is:
        </p>

        <h1 style="color: #00c2d1; font-size: 36px; margin: 15px 0;">${otp}</h1>

        <p style="font-size: 14px; color: #777;">
          This OTP is valid for <b>5 minutes</b>. If you did not request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
        &copy; ${new Date().getFullYear()} Home Health. All rights reserved.
      </div>
    </div>
  </div>
  `;
  return html;
};
