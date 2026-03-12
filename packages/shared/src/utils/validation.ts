import { z } from 'zod'

// ---- Shared schemas ----

const SyncStatusSchema = z.enum(['local', 'synced', 'pending'])

// ---- WeightRecord schema ----

const WeightRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  date: z.date(),
  weight: z.number().positive(),
  bodyFat: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
  localPhotoUri: z.string().optional(),
  syncStatus: SyncStatusSchema,
  version: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// ---- FoodRecord schema ----

const FoodRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  date: z.date(),
  name: z.string().min(1),
  calories: z.number().min(0),
  photoUrl: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  syncStatus: SyncStatusSchema,
  version: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// ---- Validation result type ----

export interface ValidationResult {
  success: boolean
  error?: string
}

// ---- Validation functions ----

export function validateWeightRecord(record: unknown): ValidationResult {
  const result = WeightRecordSchema.safeParse(record)
  if (result.success) {
    return { success: true }
  }
  return { success: false, error: result.error.issues[0]?.message ?? result.error.message }
}

export function validateFoodRecord(record: unknown): ValidationResult {
  const result = FoodRecordSchema.safeParse(record)
  if (result.success) {
    return { success: true }
  }
  return { success: false, error: result.error.issues[0]?.message ?? result.error.message }
}

// ---- UUID generation ----

export function generateUUID(): string {
  // Use crypto.randomUUID if available (Node 14.17+ / modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback: RFC 4122 v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
