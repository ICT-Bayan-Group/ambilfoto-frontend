/**
 * Format angka ke format Rupiah Indonesia
 * Contoh: 50000 → "Rp 50.000"
 *         0 → "Gratis"
 *         null/undefined → "Gratis"
 */
export function formatRupiah(value: number | null | undefined, showFree = true): string {
  if (!value || value === 0) return showFree ? "Gratis" : "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format singkat untuk badge kecil
 * Contoh: 50000 → "50rb"  |  1500000 → "1,5jt"  |  0 → "Gratis"
 */
export function formatRupiahShort(value: number | null | undefined): string {
  if (!value || value === 0) return "Gratis";
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  if (value >= 1_000) return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })}rb`;
  return `Rp ${value}`;
}

/**
 * Parse string Rupiah kembali ke angka
 * Contoh: "Rp 50.000" → 50000
 */
export function parseRupiah(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
}