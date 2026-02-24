import { z } from "zod";
import { FacilityKind } from "@prisma/client";

export const CreateFacilityUnitSchema = z.object({
  facilityTypeId: z.string().min(1, "Facility type is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  capacity: z.number().int().positive("Capacity must be positive"),
  photos: z.array(z.string().url()).optional(),
  amenities: z.array(z.string()).optional(),
});

export const UpdateFacilityUnitSchema = CreateFacilityUnitSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const CreateRatePlanSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  priceType: z.enum(["PER_NIGHT", "PER_SLOT"]),
  basePrice: z.number().positive("Price must be positive"),
  currency: z.string().default("PHP"),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  facilityTypeId: z.string().optional(),
  facilityUnitId: z.string().optional(),
});

export const UpdateRatePlanSchema = CreateRatePlanSchema.partial().extend({
  isActive: z.boolean().optional(),
});


export const FacilityQuerySchema = z.object({
  type: z.nativeEnum(FacilityKind).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
});

export type CreateFacilityUnitInput = z.infer<typeof CreateFacilityUnitSchema>;
export type UpdateFacilityUnitInput = z.infer<typeof UpdateFacilityUnitSchema>;
export type CreateRatePlanInput = z.infer<typeof CreateRatePlanSchema>;
export type UpdateRatePlanInput = z.infer<typeof UpdateRatePlanSchema>;
export type FacilityQueryInput = z.infer<typeof FacilityQuerySchema>;
