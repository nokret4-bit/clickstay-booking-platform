import crypto from "crypto";

export type PaymongoProvider = "PAYMONGO";
export type PaymongoStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface CreateIntentInput {
  amount: number;
  currency: "PHP";
  bookingId: string;
  returnUrl: string;
}

export interface CreateIntentResult {
  checkoutUrl?: string;
  clientSecret?: string;
  provider: PaymongoProvider;
  intentId: string;
}

export interface WebhookEvent<T = unknown> {
  id: string;
  type: string;
  data: T;
}

interface PaymongoPaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    status: string;
    client_key: string;
    [key: string]: unknown;
  };
}

interface PaymongoSource {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    status: string;
    redirect: {
      checkout_url: string;
      success: string;
      failed: string;
    };
    [key: string]: unknown;
  };
}

const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

function getAuthHeader(): string {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYMONGO_SECRET_KEY is not configured");
  }
  return `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;
}

export async function createPaymentIntent(
  input: CreateIntentInput
): Promise<CreateIntentResult> {
  const amountInCentavos = Math.round(input.amount * 100);

  // Create a GCash source for PayMongo
  const sourceResponse = await fetch(`${PAYMONGO_API_URL}/sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          type: "gcash",
          amount: amountInCentavos,
          currency: input.currency,
          redirect: {
            success: input.returnUrl,
            failed: input.returnUrl,
          },
          metadata: {
            bookingId: input.bookingId,
          },
        },
      },
    }),
  });

  if (!sourceResponse.ok) {
    const errorText = await sourceResponse.text();
    console.error("PayMongo source creation failed:");
    console.error("Status:", sourceResponse.status, sourceResponse.statusText);
    console.error("Response:", errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      const errorMessage = errorJson.errors?.[0]?.detail || errorJson.errors?.[0]?.code || sourceResponse.statusText;
      throw new Error(`PayMongo API error: ${errorMessage}`);
    } catch (parseError) {
      throw new Error(`PayMongo API error: ${sourceResponse.statusText} - ${errorText}`);
    }
  }

  const sourceData = (await sourceResponse.json()) as { data: PaymongoSource };
  const source = sourceData.data;

  return {
    checkoutUrl: source.attributes.redirect.checkout_url,
    provider: "PAYMONGO",
    intentId: source.id,
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("PAYMONGO_WEBHOOK_SECRET not configured, skipping signature verification");
    return true; // Allow in dev if not configured
  }

  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

export function parseEvent<T = unknown>(payload: unknown): WebhookEvent<T> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload)
  ) {
    throw new Error("Invalid webhook payload structure");
  }

  const data = payload as { data: { id: string; type: string; attributes: T } };

  return {
    id: data.data.id,
    type: data.data.type,
    data: data.data.attributes as T,
  };
}

export async function getPaymentStatus(intentId: string): Promise<PaymongoStatus> {
  const response = await fetch(`${PAYMONGO_API_URL}/sources/${intentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment status: ${response.statusText}`);
  }

  const data = (await response.json()) as { data: PaymongoSource };
  const status = data.data.attributes.status;

  // Map PayMongo status to our internal status
  switch (status) {
    case "chargeable":
    case "paid":
      return "succeeded";
    case "failed":
    case "expired":
      return "failed";
    case "pending":
    default:
      return "pending";
  }
}
