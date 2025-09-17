import type { Buyer, BuyerHistory } from "./types";
import { STATUSES, BHK_OPTIONS } from "./constants";
import type { BuyerFormValues } from "./schemas";
import { getServerSupabase } from "./supabase-server";

function isBhkLiteral(value: string): value is NonNullable<Buyer["bhk"]> {
  return (BHK_OPTIONS as readonly string[]).includes(value);
}

function mapBuyer(db: any): Buyer {
  return {
    id: db.id,
    fullName: db.fullName ?? db.fullname,
    email: (db.email ?? null),
    phone: db.phone,
    city: db.city,
    propertyType: db.propertyType ?? db.propertytype,
    bhk: (db.bhk ?? db.BHK) == null
      ? null
      : (isBhkLiteral(String(db.bhk ?? db.BHK)) ? (String(db.bhk ?? db.BHK) as Buyer["bhk"]) : null),
    purpose: db.purpose,
    budgetMin: db.budgetMin ?? db.budgetmin ?? null,
    budgetMax: db.budgetMax ?? db.budgetmax ?? null,
    timeline: db.timeline,
    source: db.source,
    status: db.status,
    notes: db.notes ?? null,
    tags: Array.isArray(db.tags) ? (db.tags as string[]) : [],
    ownerId: db.ownerId ?? db.ownerid,
    updatedAt: ((db.updatedAt ?? db.updatedat) ? new Date(db.updatedAt ?? db.updatedat).toISOString() : new Date().toISOString()) as string,
  };
}

export const getBuyers = async ({
  page = 1,
  limit = 10,
  query: searchQuery = "",
  city,
  propertyType,
  status,
  timeline,
  sort = "updatedAt:desc",
}: {
  page?: number;
  limit?: number;
  query?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  sort?: string;
}) => {
  const [sortKeyRaw, sortOrder] = sort.split(":") as [string, "asc" | "desc"];
  const sortKey = sortKeyRaw === 'updatedAt' ? 'updatedat' : sortKeyRaw === 'propertyType' ? 'propertytype' : sortKeyRaw;

  const supabase = await getServerSupabase()
  let queryBuilder = supabase
    .from('buyers')
    .select('*', { count: 'exact' })
    .order(sortKey || 'updatedat', { ascending: (sortOrder || 'desc') === 'asc' })
    .range((page - 1) * limit, page * limit - 1)

  if (city) queryBuilder = queryBuilder.eq('city', city)
  if (propertyType) queryBuilder = queryBuilder.eq('propertytype', propertyType)
  if (status) queryBuilder = queryBuilder.eq('status', status)
  if (timeline) queryBuilder = queryBuilder.eq('timeline', timeline)
  if (searchQuery) {
    queryBuilder = queryBuilder.or(
      `fullName.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`
    )
  }

  const { data, error, count } = await queryBuilder
  if (error) throw error
  return { buyers: (data || []).map(mapBuyer), total: count || 0 };
};


export const getBuyerById = async (id: string): Promise<Buyer | null> => {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase.from('buyers').select('*').eq('id', id).single()
  if (error) return null
  return mapBuyer(data)
};

export const getBuyerHistory = async (buyerId: string): Promise<BuyerHistory[]> => {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('buyer_history')
    .select('*')
    .eq('buyerid', buyerId)
    .order('changedat', { ascending: false })
    .limit(5)
  if (error) return []
  return (data || []).map((h: any) => ({
    id: h.id,
    buyerId: h.buyerId ?? h.buyerid,
    changedBy: h.changedBy ?? h.changedby,
    changedAt: new Date(h.changedAt ?? h.changedat).toISOString(),
    diff: h.diff as Record<string, { old: any; new: any }>,
  }))
};

export const createBuyer = async (data: BuyerFormValues): Promise<Buyer> => {
  // TODO: replace with real current user when auth is added
  const supabase = await getServerSupabase()
  const { data: buyer, error } = await supabase
    .from('buyers')
    .insert({
      fullname: data.fullName,
      email: data.email || null,
      phone: data.phone,
      city: data.city,
      propertytype: data.propertyType,
      bhk: data.bhk || null,
      purpose: data.purpose,
      budgetmin: data.budgetMin ?? null,
      budgetmax: data.budgetMax ?? null,
      timeline: data.timeline,
      source: data.source,
      status: data.status || 'New',
      notes: data.notes || null,
      tags: data.tags ?? [],
      ownerid: 'anonymous',
    })
    .select('*')
    .single()
  if (error) throw error

  await supabase.from('buyer_history').insert({
    buyerid: buyer.id,
    changedby: 'Demo User',
    diff: { _initial: { old: null, new: 'Created' } },
  })

  return mapBuyer(buyer)
};


export const updateBuyer = async (id: string, data: Partial<BuyerFormValues>): Promise<Buyer | null> => {
  const supabase = await getServerSupabase()
  const { data: existing } = await supabase.from('buyers').select('*').eq('id', id).single()
  if (!existing) return null

  const diff: BuyerHistory["diff"] = {};
  const fields: (keyof BuyerFormValues)[] = [
    "fullName",
    "email",
    "phone",
    "city",
    "propertyType",
    "bhk",
    "purpose",
    "budgetMin",
    "budgetMax",
    "timeline",
    "source",
    "status",
    "notes",
    "tags",
  ];
  for (const key of fields) {
    if (key in data) {
      const oldVal = (existing as any)[key];
      const newVal = (data as any)[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        (diff as any)[key] = { old: oldVal, new: newVal };
      }
    }
  }

  const updatePayload: any = {}
  const mapKey = (key: keyof BuyerFormValues): string => {
    switch (key) {
      case 'fullName': return 'fullname'
      case 'propertyType': return 'propertytype'
      case 'budgetMin': return 'budgetmin'
      case 'budgetMax': return 'budgetmax'
      default: return key as string
    }
  }
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) updatePayload[mapKey(k as keyof BuyerFormValues)] = v
  }
  const { data: updatedRow, error } = await supabase
    .from('buyers')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error

  if (Object.keys(diff).length > 0) {
    await supabase.from('buyer_history').insert({ buyerId: id, changedBy: 'Demo User', diff })
  }

  return mapBuyer(updatedRow)
};

export const getStatusCounts = async () => {
  const supabase = await getServerSupabase()
  const { data, error } = await supabase
    .from('buyers')
    .select('status')
  if (error) return STATUSES.map(status => ({ status, count: 0 }))
  const byStatus: Record<string, number> = {}
  for (const s of STATUSES) byStatus[s] = 0
  for (const row of (data || []) as any[]) {
    byStatus[row.status] = (byStatus[row.status] || 0) + 1
  }
  return STATUSES.map(status => ({ status, count: byStatus[status] || 0 }))
};
