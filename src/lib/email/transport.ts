import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  icsAttachment?: Buffer;
}

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const useEthereal = process.env.USE_ETHEREAL_DEV === "true";

  if (smtpHost && smtpUser && smtpPass) {
    // Use configured SMTP
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log("📧 Email transport: SMTP configured");
  } else if (useEthereal) {
    // Use Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("📧 Email transport: Ethereal test account created");
    console.log("   User:", testAccount.user);
    console.log("   Pass:", testAccount.pass);
  } else {
    throw new Error("No email transport configured. Set SMTP_* env vars or USE_ETHEREAL_DEV=true");
  }

  return transporter;
}

export async function sendMail(options: EmailOptions): Promise<void> {
  const transport = await getTransporter();
  const from = process.env.SMTP_FROM || "noreply@clickstay.local";

  const mailOptions: nodemailer.SendMailOptions = {
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  if (options.icsAttachment) {
    mailOptions.attachments = [
      {
        filename: "booking.ics",
        content: options.icsAttachment,
        contentType: "text/calendar",
      },
    ];
  }

  const info = await transport.sendMail(mailOptions);

  // Log preview URL for Ethereal
  if (process.env.USE_ETHEREAL_DEV === "true") {
    console.log("📧 Email sent!");
    console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("📧 Email sent:", info.messageId);
  }
}
