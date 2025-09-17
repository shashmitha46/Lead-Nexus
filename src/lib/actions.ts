
"use server"

import { revalidatePath } from "next/cache"
import { buyerSchema, type BuyerFormValues } from "./schemas"
import {
  createBuyer,
  getBuyerById,
  updateBuyer as updateBuyerData,
  getBuyers,
} from "./data"
import { suggestLeadTags } from "@/ai/flows/suggest-lead-tags"
import type { Buyer, Status } from "./types"
import { z } from "zod"
import Papa from "papaparse"
import { enforceRateLimit, getClientKey } from "./rate-limit"
import { headers } from "next/headers"
import { getServerSupabase } from "./supabase-server"

export async function createBuyerAction(data: BuyerFormValues) {
  try {
    const hdrs = await headers()
    const key = getClientKey(hdrs)
    enforceRateLimit('createBuyer', key)
  } catch (e:any) {
    return { success: false, error: e.message || 'Rate limited' }
  }

  // Proceed even if not authenticated (temporary fallback to unblock flow)
  const validation = buyerSchema.safeParse(data)

  if (!validation.success) {
    return {
      success: false,
      error: "Invalid data",
      issues: validation.error.issues,
    }
  }

  try {
    const newBuyer = await createBuyer(validation.data)
    revalidatePath("/buyers")
    return { success: true, data: newBuyer }
  } catch (error) {
    console.error("Failed to create buyer:", error)
    return {
      success: false,
      error: "Failed to create buyer.",
    }
  }
}

export async function updateBuyerAction(id: string, data: BuyerFormValues) {
  try {
    const hdrs = await headers()
    const key = getClientKey(hdrs)
    enforceRateLimit('updateBuyer', key)
  } catch (e:any) {
    return { success: false, error: e.message || 'Rate limited' }
  }

  const supabase = await getServerSupabase()
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes?.user) {
    return { success: false, error: "You must be logged in to update a buyer." }
  }
  const validation = buyerSchema.safeParse(data)

  if (!validation.success) {
    return {
      success: false,
      error: "Invalid data",
      issues: validation.error.issues,
    }
  }

  const existingBuyer = await getBuyerById(id)
  if (!existingBuyer) {
    return { success: false, error: "Buyer not found." }
  }

  // This is a simplified concurrency check for the mock data version
  if (data.updatedAt && existingBuyer.updatedAt !== data.updatedAt) {
      return {
      success: false,
      error:
        "This record has been updated by someone else. Please refresh and try again.",
    }
  }
  
  const { updatedAt, ...updateData } = validation.data;

  try {
    const updatedBuyer = await updateBuyerData(id, updateData)
    revalidatePath("/buyers")
    revalidatePath(`/buyers/${id}`)
    return { success: true, data: updatedBuyer }
  } catch (error) {
    console.error("Failed to update buyer:", error)
    return {
      success: false,
      error: "Failed to update buyer.",
    }
  }
}

export async function updateBuyerStatus(
  id: string,
  currentUpdatedAt: string,
  status: Status
) {
  const existingBuyer = await getBuyerById(id)
  if (!existingBuyer) {
    return { success: false, error: "Buyer not found." }
  }
  
  if (existingBuyer.updatedAt !== currentUpdatedAt) {
    return {
      success: false,
      error:
        "This record has been updated by someone else. Please refresh and try again.",
    }
  }

  try {
    await updateBuyerData(id, { status })
    revalidatePath("/buyers")
    revalidatePath(`/buyers/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update status:", error);
    return {
      success: false,
      error: "Failed to update status.",
    }
  }
}

export async function getSuggestedTags(notes: string) {
  if (!notes.trim()) {
    return { success: true, tags: [] }
  }
  try {
    const tags = await suggestLeadTags({ notes })
    return { success: true, tags }
  } catch (error) {
    console.error("AI tag suggestion failed:", error)
    return {
      success: false,
      error: "Failed to get AI suggestions.",
    }
  }
}

// Very basic CSV import logic
export async function importBuyers(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { success: false, errors: [{ row: 0, message: "No file found" }] }
  }

  const text = await file.text()
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
  
  if(parsed.data.length > 200) {
      return { success: false, errors: [{ row: 0, message: "CSV file cannot have more than 200 rows." }] }
  }

  const errors: { row: number; message: string }[] = []
  const validRows: BuyerFormValues[] = []

  for (const row of parsed.data as any[]) {
    const result = buyerSchema.safeParse({
        ...row,
        budgetMin: row.budgetMin ? Number(row.budgetMin) : null,
        budgetMax: row.budgetMax ? Number(row.budgetMax) : null,
        tags: row.tags ? row.tags.split(',').map((t:string) => t.trim()) : [],
    })
    
    if (result.success) {
      const { updatedAt, ...validData } = result.data;
      validRows.push(validData)
    } else {
       errors.push({
        row: (parsed.data.indexOf(row) as number) + 2,
        message: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
      })
    }
  }


  if (errors.length > 0) {
    return { success: false, errors }
  }

  try {
    const promises = validRows.map(row => createBuyer(row));
    await Promise.all(promises);

    revalidatePath("/buyers")
    return { success: true, importedCount: validRows.length }
  } catch (error) {
    console.error("Database error during import:", error);
    return { success: false, errors: [{ row: 0, message: "Database error during import." }] }
  }
}

const exportSchema = z.object({
  fields: z.array(z.string()),
});

export async function exportBuyersAction(params: z.infer<typeof exportSchema>) {
  const validation = exportSchema.safeParse(params);
  if (!validation.success) {
    return { success: false, error: "Invalid fields provided." };
  }

  try {
    // Fetch all buyers, no pagination
    const { buyers } = await getBuyers({ limit: 1000 });

    const dataToExport = buyers.map((buyer: Buyer) => {
      const row: Record<string, any> = {};
      for (const field of validation.data.fields) {
        if (field === 'tags' && Array.isArray(buyer.tags)) {
          row[field] = buyer.tags.join(', ');
        } else {
          row[field] = (buyer as any)[field];
        }
      }
      return row;
    });

    const csv = Papa.unparse(dataToExport, {
      columns: validation.data.fields,
    });

    return { success: true, csv };
  } catch (error) {
    console.error("Failed to export buyers:", error);
    return { success: false, error: "An error occurred during the export process." };
  }
}
