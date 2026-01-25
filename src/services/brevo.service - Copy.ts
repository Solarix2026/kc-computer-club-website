/**
 * Brevo Email Service
 * Handles email sending via Brevo.com (SendinBlue)
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface BrevoEmailProps {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
}

/**
 * Send email via Brevo
 */
export async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
  replyTo = 'noreply@kccomputerclub.com',
}: BrevoEmailProps): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY not configured');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const payload = {
      sender: {
        name: 'KC Computer Club',
        email: 'noreply@kccomputerclub.com',
      },
      to: [
        {
          email: to,
          name: to.split('@')[0],
        },
      ],
      subject,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      replyTo: {
        email: replyTo,
      },
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #13ec80 0%, #0fd673 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8faf9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #13ec80; color: black; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { color: #618975; font-size: 12px; margin-top: 20px; }
          .warning { color: #ef4444; font-size: 14px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>密码重置请求</h1>
          </div>
          <div class="content">
            <p>您好,</p>
            <p>我们收到了您的密码重置请求。请点击下方按钮来重置您的密码:</p>
            <a href="${resetLink}" class="button">重置密码</a>
            <p>或复制此链接到浏览器:</p>
            <p style="word-break: break-all; font-size: 12px; color: #618975;">${resetLink}</p>
            <div class="warning">
              ⚠️ 此链接将在 1 小时后过期
            </div>
            <p>如果您没有请求此操作,请忽略此邮件。您的账户是安全的。</p>
            <div class="footer">
              <p>来自: KC Computer Club</p>
              <p>© 2026 KC Computer Club. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendBrevoEmail({
    to: email,
    subject: '密码重置请求 - KC Computer Club',
    htmlContent,
  });
}

/**
 * Send account notification email
 */
export async function sendAccountNotificationEmail(
  email: string,
  accountCreated: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const subject = accountCreated
    ? '欢迎加入 KC Computer Club'
    : '您的账户已更新';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #13ec80 0%, #0fd673 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f8faf9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { color: #618975; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${accountCreated ? '欢迎！' : '账户更新通知'}</h1>
          </div>
          <div class="content">
            <p>您好,</p>
            ${
              accountCreated
                ? `<p>欢迎加入 KC Computer Club！您的账户已成功创建。</p>
                   <p>您可以使用以下邮箱登录:</p>
                   <p><strong>${email}</strong></p>`
                : '<p>您的账户信息已成功更新。</p>'
            }
            <p>如有任何问题，请联系我们的支持团队。</p>
            <div class="footer">
              <p>来自: KC Computer Club</p>
              <p>© 2026 KC Computer Club. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendBrevoEmail({
    to: email,
    subject,
    htmlContent,
  });
}
