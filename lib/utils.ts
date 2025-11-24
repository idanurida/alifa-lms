// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility untuk menggabungkan class Tailwind dengan kondisional
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility untuk format tanggal ke Indonesia
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Utility untuk format angka ke Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Utility untuk truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Utility untuk generate slug dari string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Hapus karakter non-alphanumeric
    .replace(/[\s_-]+/g, '-') // Ganti spasi dengan -
    .replace(/^-+|-+$/g, ''); // Hapus - di awal/akhir
}

// Utility untuk cek apakah string adalah email valid
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility untuk cek apakah string adalah NIM valid (misal: 8 digit)
export function isValidNim(nim: string): boolean {
  const nimRegex = /^\d{8,10}$/; // Sesuaikan panjang NIM
  return nimRegex.test(nim);
}

// Utility untuk cek apakah string adalah NIDN valid (misal: 10 digit)
export function isValidNidn(nidn: string): boolean {
  const nidnRegex = /^\d{10}$/; // Sesuaikan format NIDN
  return nidnRegex.test(nidn);
}