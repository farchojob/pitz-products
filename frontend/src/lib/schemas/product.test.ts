import { describe, expect, it } from 'vitest'
import { productFormSchema } from './product'

const VALID = { name: 'Widget', description: '', price: 10, stock: 5, sku: 'ABC-123', active: true }

describe('productFormSchema', () => {
  it('accepts a valid product', () => {
    expect(productFormSchema.safeParse(VALID).success).toBe(true)
  })

  describe('name', () => {
    it('requires at least 3 characters', () => {
      expect(productFormSchema.safeParse({ ...VALID, name: 'ab' }).success).toBe(false)
      expect(productFormSchema.safeParse({ ...VALID, name: 'abc' }).success).toBe(true)
    })
    it('allows at most 100 characters', () => {
      expect(productFormSchema.safeParse({ ...VALID, name: 'a'.repeat(100) }).success).toBe(true)
      expect(productFormSchema.safeParse({ ...VALID, name: 'a'.repeat(101) }).success).toBe(false)
    })
  })

  describe('description', () => {
    it('allows at most 1000 characters', () => {
      expect(productFormSchema.safeParse({ ...VALID, description: 'a'.repeat(1000) }).success).toBe(true)
      expect(productFormSchema.safeParse({ ...VALID, description: 'a'.repeat(1001) }).success).toBe(false)
    })
  })

  describe('price', () => {
    it('must be greater than 0', () => {
      expect(productFormSchema.safeParse({ ...VALID, price: 0 }).success).toBe(false)
      expect(productFormSchema.safeParse({ ...VALID, price: -1 }).success).toBe(false)
      expect(productFormSchema.safeParse({ ...VALID, price: 0.01 }).success).toBe(true)
    })
    it('rejects values that overflow the decimal(10,2) column', () => {
      expect(productFormSchema.safeParse({ ...VALID, price: 100_000_000 }).success).toBe(false)
    })
  })

  describe('stock', () => {
    it('must be a non-negative integer', () => {
      expect(productFormSchema.safeParse({ ...VALID, stock: -1 }).success).toBe(false)
      expect(productFormSchema.safeParse({ ...VALID, stock: 1.5 }).success).toBe(false)
      expect(productFormSchema.safeParse({ ...VALID, stock: 0 }).success).toBe(true)
    })
  })

  describe('sku', () => {
    it('trims and uppercases (mirrors the backend normalize)', () => {
      const result = productFormSchema.safeParse({ ...VALID, sku: '  abc-123 ' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.sku).toBe('ABC-123')
    })
    it('rejects spaces, underscores, symbols and hyphen-only values', () => {
      for (const bad of ['AB C', 'ABC_1', 'ABC!', '-', '---']) {
        expect(productFormSchema.safeParse({ ...VALID, sku: bad }).success).toBe(false)
      }
    })
  })

  describe('active', () => {
    it('accepts both true and false', () => {
      expect(productFormSchema.safeParse({ ...VALID, active: true }).success).toBe(true)
      expect(productFormSchema.safeParse({ ...VALID, active: false }).success).toBe(true)
    })
  })
})
