// lib/validations/user.ts
import { z } from 'zod';

// Validasi untuk login
export const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter' }),
});

// Validasi untuk membuat/ubah user (admin/staff)
export const userSchema = z.object({
  username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  role: z.enum(['super_admin', 'staff_akademik', 'staff_keuangan', 'dosen', 'mahasiswa'], {
    errorMap: () => ({ message: 'Role tidak valid' })
  }),
  is_active: z.boolean().optional(),
});

// Validasi untuk membuat mahasiswa (dari form)
export const mahasiswaSchema = z.object({
  nim: z.string().regex(/^\d{8,10}$/, { message: 'NIM harus berupa angka 8-10 digit' }),
  name: z.string().min(2, { message: 'Nama wajib diisi' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  phone: z.string().optional(),
  curriculum_id: z.number().int().positive({ message: 'Kurikulum wajib dipilih' }),
  year_entry: z.number().int().min(2000).max(new Date().getFullYear(), { message: 'Tahun masuk tidak valid' }),
  status: z.enum(['active', 'inactive', 'graduated', 'expelled']).optional(),
});

// Validasi untuk membuat dosen (dari form)
export const dosenSchema = z.object({
  nidn: z.string().regex(/^\d{10}$/, { message: 'NIDN harus berupa angka 10 digit' }),
  name: z.string().min(2, { message: 'Nama wajib diisi' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  phone: z.string().optional(),
  expertise: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type UserSchema = z.infer<typeof userSchema>;
export type MahasiswaSchema = z.infer<typeof mahasiswaSchema>;
export type DosenSchema = z.infer<typeof dosenSchema>;