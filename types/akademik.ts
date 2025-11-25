$fullTypesContent = @"
export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  programStudiId: number;
}

export interface AcademicPeriod {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface Dosen {
  id: number;
  nama: string;
  nip: string;
  email: string;
  phone?: string;
  programStudiId?: number;
}

export interface StudyProgram {
  id: number;
  name: string;
  code: string;
  description?: string;
  faculty: string;
}

export interface Kurikulum {
  id: number;
  name: string;
  programStudiId: number;
  tahun: number;
  isActive: boolean;
}

export interface Mahasiswa {
  id: number;
  nama: string;
  nim: string;
  email: string;
  programStudiId: number;
  angkatan: number;
}

export interface Kelas {
  id: number;
  name: string;
  programStudiId: number;
  tahunAjaran: string;
  semester: number;
}

export interface Curriculum {
  id: number;
  name: string;
  programStudiId: number;
  tahun: number;
  isActive: boolean;
}

export interface AcademicProgram {
  id: number;
  name: string;
  code: string;
}

export interface MataKuliah {
  id: number;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  programStudiId: number;
}

export interface PenugasanDosen {
  id: number;
  dosenId: number;
  kelasId: number;
  mataKuliahId: number;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  status: string;
}

export interface Nilai {
  id: number;
  mahasiswaId: number;
  mataKuliahId: number;
  nilai: number;
  grade: string;
  semester: string;
  tahunAjaran: string;
}

export interface KRS {
  id: number;
  mahasiswaId: number;
  mataKuliahId: number;
  semester: string;
  tahunAjaran: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SkalaNilai {
  id: number;
  kurikulumId: number;
  nilaiMin: number;
  nilaiMax: number;
  grade: string;
  bobot: number;
}
"@

$fullTypesContent | Set-Content -LiteralPath "types/akademik.ts"
Write-Host "✅ Updated types/akademik.ts with complete academic types"