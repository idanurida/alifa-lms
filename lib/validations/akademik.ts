// lib/validations/akademik.ts
import { z } from 'zod';

// Validasi untuk membuat/ubah kurikulum
export const kurikulumSchema = z.object({
  name: z.string().min(1, { message: 'Nama kurikulum wajib diisi' }),
  code: z.string().min(1, { message: 'Kode kurikulum wajib diisi' }),
  study_program_id: z.number().int().positive({ message: 'Program studi wajib dipilih' }),
  total_credits: z.number().int().min(0, { message: 'Total SKS tidak boleh negatif' }),
  is_active: z.boolean().optional(),
});

// Validasi untuk membuat/ubah mata kuliah
export const mataKuliahSchema = z.object({
  code: z.string().min(1, { message: 'Kode mata kuliah wajib diisi' }),
  name: z.string().min(1, { message: 'Nama mata kuliah wajib diisi' }),
  credits: z.number().int().positive({ message: 'Jumlah SKS harus lebih dari 0' }),
  theory_credits: z.number().int().min(0).optional(),
  practical_credits: z.number().int().min(0).optional(),
  curriculum_id: z.number().int().positive({ message: 'Kurikulum wajib dipilih' }),
  semester: z.number().int().min(1).max(8, { message: 'Semester harus antara 1-8' }),
  prerequisites: z.string().optional().nullable(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

// Validasi untuk membuat/ubah kelas
export const kelasSchema = z.object({
  course_id: z.number().int().positive({ message: 'Mata kuliah wajib dipilih' }),
  academic_period_id: z.number().int().positive({ message: 'Periode akademik wajib dipilih' }),
  class_code: z.string().min(1, { message: 'Kode kelas wajib diisi' }),
  lecturer_id: z.number().int().positive({ message: 'Dosen wajib dipilih' }),
  schedule: z.object({
    day: z.string().min(1),
    time: z.string().min(1),
    room: z.string().min(1),
  }).refine((data) => data.day && data.time && data.room, {
    message: 'Jadwal (hari, waktu, ruang) wajib diisi'
  }),
  max_students: z.number().int().min(1, { message: 'Kapasitas kelas minimal 1' }),
  is_active: z.boolean().optional(),
});

// Validasi untuk membuat/ubah penugasan dosen
export const penugasanDosenSchema = z.object({
  lecturer_id: z.number().int().positive({ message: 'Dosen wajib dipilih' }),
  class_id: z.number().int().positive({ message: 'Kelas wajib dipilih' }),
  assignment_type: z.enum(['main', 'assistant', 'guest'], {
    errorMap: () => ({ message: 'Tipe penugasan wajib dipilih' })
  }),
  teaching_load: z.number().int().min(0, { message: 'Beban mengajar tidak boleh negatif' }),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().optional(),
});

// Validasi untuk komponen penilaian
export const komponenPenilaianSchema = z.object({
  class_id: z.number().int().positive({ message: 'Kelas wajib dipilih' }),
  component_type: z.string().min(1, { message: 'Tipe komponen wajib diisi' }),
  component_name: z.string().min(1, { message: 'Nama komponen wajib diisi' }),
  weight: z.number().min(0).max(100, { message: 'Bobot harus antara 0-100%' }),
  max_score: z.number().positive().optional(),
  deadline: z.string().optional(),
  description: z.string().optional(),
  is_published: z.boolean().optional(),
});

// Validasi untuk aktivitas nilai
export const nilaiAktivitasSchema = z.object({
  enrollment_id: z.number().int().positive({ message: 'Enrollment wajib dipilih' }),
  activity_type: z.string().min(1, { message: 'Tipe aktivitas wajib diisi' }),
  activity_date: z.string().optional(),
  score: z.number().min(0).max(100, { message: 'Skor harus antara 0-100' }),
  max_score: z.number().positive().optional(),
  notes: z.string().optional(),
});

// Validasi untuk upload materi pembelajaran
export const materiPembelajaranSchema = z.object({
  class_id: z.number().int().positive({ message: 'Kelas wajib dipilih' }),
  title: z.string().min(1, { message: 'Judul materi wajib diisi' }),
  material_type: z.enum(['slide', 'reading', 'video', 'assignment', 'solution'], {
    errorMap: () => ({ message: 'Tipe materi wajib dipilih' })
  }),
  file_path: z.string().optional(),
  content: z.string().optional(),
  week_number: z.number().int().min(1).max(16, { message: 'Minggu ke harus antara 1-16' }),
  is_published: z.boolean().optional(),
});

export type KurikulumSchema = z.infer<typeof kurikulumSchema>;
export type MataKuliahSchema = z.infer<typeof mataKuliahSchema>;
export type KelasSchema = z.infer<typeof kelasSchema>;
export type PenugasanDosenSchema = z.infer<typeof penugasanDosenSchema>;
export type KomponenPenilaianSchema = z.infer<typeof komponenPenilaianSchema>;
export type NilaiAktivitasSchema = z.infer<typeof nilaiAktivitasSchema>;
export type MateriPembelajaranSchema = z.infer<typeof materiPembelajaranSchema>;