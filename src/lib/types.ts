import type { CITIES, PROPERTY_TYPES, BHK_OPTIONS, PURPOSES, TIMELINES, SOURCES, STATUSES } from './constants';

export type City = typeof CITIES[number];
export type PropertyType = typeof PROPERTY_TYPES[number];
export type Bhk = typeof BHK_OPTIONS[number];
export type Purpose = typeof PURPOSES[number];
export type Timeline = typeof TIMELINES[number];
export type Source = typeof SOURCES[number];
export type Status = typeof STATUSES[number];

export type Buyer = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: City;
  propertyType: PropertyType;
  bhk: Bhk | null;
  purpose: Purpose;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: Timeline;
  source: Source;
  status: Status;
  notes: string | null;
  tags: string[];
  ownerId: string;
  updatedAt: string; // ISO string
};

export type BuyerHistory = {
  id: string;
  buyerId: string;
  changedBy: string; // User name
  changedAt: string; // ISO string
  diff: Record<string, { old: any; new: any }>;
};
