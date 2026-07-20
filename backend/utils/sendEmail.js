const nodemailer = require('nodemailer');

// Uses standard SMTP env vars. Works with Gmail (with an App Password), Mailtrap,
// SendGrid SMTP, etc. If SMTP_HOST is not configured, emails are skipped silently
// (logged to console) so local dev doesn't crash without email set up.
function getTransporter() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendOrderConfirmationEmail({ to, name, orderId, total, items }) {
  const transporter = getTransporter();

  const itemsHtml = items.map(
    item => `<tr>
      <td style="padding:6px 10px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;">₹${Number(item.price).toFixed(2)}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <h2>Thanks for your order, ${name}!</h2>
      <p>Your order <strong>#${orderId}</strong> has been placed successfully and will be paid via Cash on Delivery.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:6px 10px;text-align:left;">Item</th>
            <th style="padding:6px 10px;">Qty</th>
            <th style="padding:6px 10px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="margin-top:16px;font-size:16px;"><strong>Total: ₹${Number(total).toFixed(2)}</strong></p>
      <p style="color:#777;font-size:13px;margin-top:24px;">You can track your order status anytime from your account's order history.</p>
    </div>
  `;

  if (!transporter) {
    console.log(`[email skipped - SMTP not configured] Would send order confirmation for order #${orderId} to ${to}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Store" <no-reply@store.com>',
      to,
      subject: `Order Confirmation - #${orderId}`,
      html
    });
  } catch (err) {
    // Never let email failures break the order flow
    console.error('Failed to send order confirmation email:', err.message);
  }
}

module.exports = { sendOrderConfirmationEmail };
