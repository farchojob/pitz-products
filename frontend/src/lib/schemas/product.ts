import { z } from 'zod'

/**
 * Byte-identical to the Rails model regex (Ruby /\A(?=.*[A-Z0-9])[A-Z0-9-]+\z/):
 * uppercase letters, digits and hyphens, requiring at least one alphanumeric so a
 * pure-punctuation SKU like "-" is rejected. Keeping these in sync is the invariant
 * that makes client and server validation agree.
 */
export const SKU_REGEX = /^(?=.*[A-Z0-9])[A-Z0-9-]+$/

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  // Inputs are strings; coerce for validation. Kept > 0 and under the DB ceiling.
  price: z.coerce
    .number()
    .refine((n) => !Number.isNaN(n), 'Price must be a number')
    .positive('Price must be greater than 0')
    .lt(100_000_000, 'Price is too large'),
  stock: z.coerce
    .number()
    .refine((n) => !Number.isNaN(n), 'Stock must be a whole number')
    .int('Stock must be a whole number')
    .nonnegative('Stock cannot be negative'),
  // trim + uppercase mirrors the backend normalize_sku, so lowercase input is accepted.
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(SKU_REGEX, 'SKU allows uppercase letters, numbers and hyphens only'),
  active: z.boolean(),
  // Set by the image upload field (an /uploads path); null means no image.
  image_url: z.string().max(512).nullable().optional(),
})

/** Output (post-coercion): price/stock are numbers. Used for submit handling. */
export type ProductFormValues = z.infer<typeof productFormSchema>
/** Input (pre-coercion): the shape react-hook-form actually holds. */
export type ProductFormInput = z.input<typeof productFormSchema>
