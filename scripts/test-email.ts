import { config } from 'dotenv';
import { testEmailConnection, sendBookingConfirmationEmail } from '../src/lib/email/mailer';

// Load environment variables
config();

async function main() {
  console.log('🧪 Testing email configuration...\n');

  // Debug environment variables
  console.log('📋 Environment Check:');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? `✅ SET (length: ${process.env.SMTP_PASSWORD.length})` : '❌ NOT SET');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('');

  // Test connection
  console.log('1️⃣ Testing SMTP connection...');
  const isConnected = await testEmailConnection();
  
  if (!isConnected) {
    console.error('❌ Email connection failed. Please check your SMTP settings in .env file.');
    process.exit(1);
  }

  console.log('✅ SMTP connection successful!\n');

  // Test sending email
  console.log('2️⃣ Sending test booking confirmation email...');
  
  const testEmail = process.env.SMTP_USER || 'test@example.com';
  
  try {
    await sendBookingConfirmationEmail({
      bookingCode: 'TEST-' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: testEmail,
      facilityName: 'Test Deluxe Room',
      checkInDate: 'December 25, 2025',
      checkOutDate: 'December 27, 2025',
      totalAmount: '₱5,000.00',
      guests: 2,
      status: 'CONFIRMED',
    });

    console.log(`✅ Test email sent successfully to ${testEmail}!`);
    console.log('\n📧 Check your inbox for the booking confirmation email with QR code.\n');
    console.log('🎉 Email integration is working correctly!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
