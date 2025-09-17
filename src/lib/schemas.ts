import { z } from 'zod';
import {
  CITIES,
  PROPERTY_TYPES,
  BHK_OPTIONS,
  PURPOSES,
  TIMELINES,
  SOURCES,
  STATUSES,
  RESIDENTIAL_PROPERTY_TYPES,
} from './constants';

const requiredString = (name: string) => z.string().min(1, `${name} is required`);

export const baseBuyerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name cannot exceed 80 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number cannot exceed 15 digits').regex(/^[0-9]+$/, 'Phone number must contain only digits'),
    city: z.enum(CITIES, { required_error: 'City is required' }),
    propertyType: z.enum(PROPERTY_TYPES, { required_error: 'Property type is required' }),
    bhk: z.enum(BHK_OPTIONS).optional().nullable(),
    purpose: z.enum(PURPOSES, { required_error: 'Purpose is required' }),
    budgetMin: z.coerce.number().int().positive().optional().nullable(),
    budgetMax: z.coerce.number().int().positive().optional().nullable(),
    timeline: z.enum(TIMELINES, { required_error: 'Timeline is required' }),
    source: z.enum(SOURCES, { required_error: 'Source is required' }),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
    tags: z.array(z.string()).optional(),
    status: z.enum(STATUSES).optional(),
    updatedAt: z.string().optional(), // For concurrency check
  });

export const buyerSchema = baseBuyerSchema
  .refine(
    (data) => {
      if (data.budgetMin && data.budgetMax) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    {
      message: 'Max budget must be greater than or equal to min budget',
      path: ['budgetMax'],
    }
  )
  .refine(
    (data) => {
      if (RESIDENTIAL_PROPERTY_TYPES.includes(data.propertyType)) {
        return !!data.bhk;
      }
      return true;
    },
    {
      message: 'BHK is required for Apartments and Villas',
      path: ['bhk'],
    }
  );

export type BuyerFormValues = z.infer<typeof buyerSchema>;
