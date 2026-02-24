import { z } from "zod";

export const CreatePaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  returnUrl: z.string().url("Invalid return URL"),
});

export const PaymongoWebhookSchema = z.object({
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.unknown()),
  }),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type PaymongoWebhookPayload = z.infer<typeof PaymongoWebhookSchema>;
