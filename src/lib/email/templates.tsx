import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationProps {
  bookingCode: string;
  customerName: string;
  facilityName: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  manageUrl: string;
}

export function BookingConfirmationEmail({
  bookingCode,
  customerName,
  facilityName,
  startDate,
  endDate,
  totalAmount,
  manageUrl,
}: BookingConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking at ClickStay is confirmed - {bookingCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! 🎉</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your booking at Manuel Resort has been confirmed. Here are your booking details:
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Booking Code:</Text>
            <Text style={detailValue}>{bookingCode}</Text>
            <Text style={detailLabel}>Facility:</Text>
            <Text style={detailValue}>{facilityName}</Text>
            <Text style={detailLabel}>Check-in:</Text>
            <Text style={detailValue}>{startDate}</Text>
            <Text style={detailLabel}>Check-out:</Text>
            <Text style={detailValue}>{endDate}</Text>
            <Text style={detailLabel}>Total Amount:</Text>
            <Text style={detailValue}>{totalAmount}</Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={manageUrl}>
              Manage Booking
            </Button>
          </Section>
          <Text style={footer}>
            If you have any questions, please contact us at support@clickstay.local
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

interface OTPEmailProps {
  otp: string;
  email: string;
}

export function OTPEmail({ otp, email }: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your ClickStay login code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Login Code</Heading>
          <Text style={text}>Hi,</Text>
          <Text style={text}>
            You requested to sign in to ClickStay. Use the code below to complete your login:
          </Text>
          <Section style={otpBox}>
            <Text style={otpCode}>{otp}</Text>
          </Section>
          <Text style={text}>This code will expire in 10 minutes.</Text>
          <Text style={footer}>
            If you didn&apos;t request this code, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

interface PaymentReceivedProps {
  bookingCode: string;
  customerName: string;
  amount: string;
  paymentMethod: string;
}

export function PaymentReceivedEmail({
  bookingCode,
  customerName,
  amount,
  paymentMethod,
}: PaymentReceivedProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment received for booking {bookingCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Received ✅</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            We have successfully received your payment for booking {bookingCode}.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Amount Paid:</Text>
            <Text style={detailValue}>{amount}</Text>
            <Text style={detailLabel}>Payment Method:</Text>
            <Text style={detailValue}>{paymentMethod}</Text>
          </Section>
          <Text style={text}>Your booking is now confirmed. We look forward to hosting you!</Text>
          <Text style={footer}>Thank you for choosing Manuel Resort.</Text>
        </Container>
      </Body>
    </Html>
  );
}

interface BookingCancelledProps {
  bookingCode: string;
  customerName: string;
  facilityName: string;
}

export function BookingCancelledEmail({
  bookingCode,
  customerName,
  facilityName,
}: BookingCancelledProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking {bookingCode} has been cancelled</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Cancelled</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your booking {bookingCode} for {facilityName} has been cancelled as requested.
          </Text>
          <Text style={text}>
            If you have any questions about refunds, please contact our support team.
          </Text>
          <Text style={footer}>We hope to see you again soon at Manuel Resort.</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const detailsBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "24px",
};

const detailLabel = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "600",
  margin: "8px 0 4px",
};

const detailValue = {
  color: "#333",
  fontSize: "16px",
  margin: "0 0 16px",
};

const otpBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  margin: "24px 40px",
  padding: "32px",
  textAlign: "center" as const,
};

const otpCode = {
  color: "#333",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
};

const buttonContainer = {
  padding: "24px 40px",
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 40px",
  marginTop: "32px",
};
