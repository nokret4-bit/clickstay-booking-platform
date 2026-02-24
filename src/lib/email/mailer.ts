import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// Email configuration - lazy loaded to ensure env vars are available
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// Generate QR code as base64 data URL
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

interface BookingEmailData {
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  facilityName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  guests: number;
  status: string;
  qrCodeUrl?: string;
}

// Email template for booking confirmation
function getBookingConfirmationHTML(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
    }
    .booking-details {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      font-weight: bold;
      color: #666;
    }
    .detail-value {
      color: #333;
    }
    .qr-code {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
    .qr-code img {
      max-width: 250px;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 10px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-confirmed {
      background: #10b981;
      color: white;
    }
    .status-pending {
      background: #f59e0b;
      color: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Booking Confirmed!</h1>
    <p>Thank you for your reservation</p>
  </div>
  
  <div class="content">
    <h2>Hello ${data.customerName}!</h2>
    <p>Your booking has been successfully confirmed. Please find your booking details below:</p>
    
    <div class="booking-details">
      <div class="detail-row">
        <span class="detail-label">Booking Code:</span>
        <span class="detail-value"><strong>${data.bookingCode}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Facility:</span>
        <span class="detail-value">${data.facilityName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-in:</span>
        <span class="detail-value">${data.checkInDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-out:</span>
        <span class="detail-value">${data.checkOutDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Guests:</span>
        <span class="detail-value">${data.guests} ${data.guests === 1 ? 'guest' : 'guests'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Amount:</span>
        <span class="detail-value"><strong>${data.totalAmount}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
          <span class="status-badge status-${data.status.toLowerCase()}">${data.status}</span>
        </span>
      </div>
    </div>
    
    ${data.qrCodeUrl ? `
    <div class="qr-code">
      <h3>Your Booking QR Code</h3>
      <p>Show this QR code during check-in:</p>
      <img src="${data.qrCodeUrl}" alt="Booking QR Code" />
      <p style="color: #666; font-size: 12px; margin-top: 10px;">
        Booking Code: ${data.bookingCode}
      </p>
    </div>
    ` : ''}
    
    <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
      <strong>📋 Important Notes:</strong>
      <ul style="margin: 10px 0;">
        <li>Please arrive on time for check-in</li>
        <li>Bring a valid ID for verification</li>
        <li>Keep this email for your records</li>
        <li>Contact us if you need to make changes</li>
      </ul>
    </div>
    
    <p style="margin-top: 30px;">
      If you have any questions or need assistance, please don't hesitate to contact us.
    </p>
    
    <p>
      Best regards,<br>
      <strong>Manuel Resort Team</strong>
    </p>
  </div>
  
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Manuel Resort. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}

// Send booking confirmation email with QR code
export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  try {
    // Generate QR code with booking information
    const qrData = JSON.stringify({
      code: data.bookingCode,
      name: data.customerName,
      facility: data.facilityName,
      checkIn: data.checkInDate,
    });
    
    // Generate QR code as buffer instead of data URL
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2,
    });
    
    // Use CID (Content-ID) for embedding image in email
    const emailData = {
      ...data,
      qrCodeUrl: 'cid:qrcode@booking',
    };
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.customerEmail,
      subject: `Booking Confirmation - ${data.bookingCode}`,
      html: getBookingConfirmationHTML(emailData),
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode@booking', // Same CID as referenced in HTML
        },
      ],
    };
    
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw new Error('Failed to send booking confirmation email');
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  bookingCode: string,
  amount: string,
  paymentMethod: string
): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .payment-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Payment Received!</h1>
  </div>
  <div class="content">
    <h2>Payment Confirmation</h2>
    <p>We have successfully received your payment for booking <strong>${bookingCode}</strong>.</p>
    <div class="payment-box">
      <p>Amount Paid</p>
      <div class="amount">${amount}</div>
      <p style="color: #666;">via ${paymentMethod}</p>
    </div>
    <p>Your booking is now confirmed. You will receive a separate email with your booking details and QR code.</p>
    <p>Thank you for choosing Manuel Resort!</p>
  </div>
</body>
</html>
    `;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: `Payment Received - ${bookingCode}`,
      html,
    };
    
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw new Error('Failed to send payment confirmation email');
  }
}

// Send check-in notification email
export async function sendCheckInEmail(data: {
  customerName: string;
  customerEmail: string;
  bookingCode: string;
  facilityName: string;
  checkInDate: string;
  checkOutDate: string;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .welcome { font-size: 24px; font-weight: bold; color: #10b981; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Welcome to Manuel Resort!</h1>
  </div>
  <div class="content">
    <div class="welcome">You've Successfully Checked In!</div>
    <p>Hello ${data.customerName},</p>
    <p>We're delighted to confirm that you have checked in to your accommodation.</p>
    
    <div class="info-box">
      <h3>Check-In Details</h3>
      <p><strong>Booking Code:</strong> ${data.bookingCode}</p>
      <p><strong>Facility:</strong> ${data.facilityName}</p>
      <p><strong>Check-In Date:</strong> ${data.checkInDate}</p>
      <p><strong>Check-Out Date:</strong> ${data.checkOutDate}</p>
    </div>
    
    <p><strong>Important Reminders:</strong></p>
    <ul>
      <li>Check-out time is at 12:00 PM</li>
      <li>Please keep your room key safe</li>
      <li>Contact the front desk for any assistance</li>
      <li>Enjoy our facilities and amenities</li>
    </ul>
    
    <p>We hope you have a wonderful stay!</p>
    <p>Best regards,<br><strong>Manuel Resort Team</strong></p>
  </div>
</body>
</html>
    `;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.customerEmail,
      subject: `Welcome! You've Checked In - ${data.bookingCode}`,
      html,
    };
    
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Check-in email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error('Error sending check-in email:', error);
    throw new Error('Failed to send check-in email');
  }
}

// Send check-out notification email
export async function sendCheckOutEmail(data: {
  customerName: string;
  customerEmail: string;
  bookingCode: string;
  facilityName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
}): Promise<void> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .thank-you { font-size: 24px; font-weight: bold; color: #3b82f6; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>👋 Thank You for Staying With Us!</h1>
  </div>
  <div class="content">
    <div class="thank-you">You've Successfully Checked Out</div>
    <p>Hello ${data.customerName},</p>
    <p>Thank you for choosing Manuel Resort. We hope you had a wonderful stay!</p>
    
    <div class="info-box">
      <h3>Stay Summary</h3>
      <p><strong>Booking Code:</strong> ${data.bookingCode}</p>
      <p><strong>Facility:</strong> ${data.facilityName}</p>
      <p><strong>Check-In:</strong> ${data.checkInDate}</p>
      <p><strong>Check-Out:</strong> ${data.checkOutDate}</p>
      <p><strong>Total Amount:</strong> ₱${data.totalAmount.toLocaleString()}</p>
    </div>
    
    <p>We would love to hear about your experience! Your feedback helps us improve our services.</p>
    <p>We look forward to welcoming you back soon!</p>
    
    <p>Best regards,<br><strong>Manuel Resort Team</strong></p>
  </div>
</body>
</html>
    `;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.customerEmail,
      subject: `Thank You for Your Stay - ${data.bookingCode}`,
      html,
    };
    
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`✅ Check-out email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error('Error sending check-out email:', error);
    throw new Error('Failed to send check-out email');
  }
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email server connection successful');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
}
