export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  programStudiId: number;
  programStudi?: {
    name: string;
    code: string;
  };
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
  programStudi?: {
    name: string;
    code: string;
  };
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
  code: string;
  name: string;
  programStudiId: number;
  tahun: number;
  isActive: boolean;
  programStudi?: {
    name: string;
    code: string;
    faculty: string;
  };
}

export interface Curriculum {
  id: number;
  code: string;
  name: string;
  programStudiId: number;
  tahun: number;
  isActive: boolean;
  programStudi?: {
    name: string;
    code: string;
    faculty: string;
  };
}

export interface Mahasiswa {
  id: number;
  nama: string;
  nim: string;
  email: string;
  programStudiId: number;
  angkatan: number;
  programStudi?: {
    name: string;
    code: string;
    faculty: string;
  };
}

export interface Kelas {
  id: number;
  name: string;
  code: string;
  programStudiId: number;
  tahunAjaran: string;
  semester: number;
  programStudi?: {
    name: string;
    code: string;
  };
}

export interface AcademicProgram {
  id: number;
  name: string;
  code: string;
  faculty: string;
}

export interface MataKuliah {
  id: number;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  programStudiId: number;
  programStudi?: {
    name: string;
    code: string;
  };
}

export interface PenugasanDosen {
  id: number;
  dosenId: number;
  kelasId: number;
  mataKuliahId: number;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  status: string;
  dosen?: {
    nama: string;
    nip: string;
  };
  kelas?: {
    name: string;
    code: string;
  };
  mataKuliah?: {
    nama: string;
    kode: string;
  };
}

export interface Nilai {
  id: number;
  mahasiswaId: number;
  mataKuliahId: number;
  nilai: number;
  grade: string;
  semester: string;
  tahunAjaran: string;
  mahasiswa?: {
    nama: string;
    nim: string;
  };
  mataKuliah?: {
    nama: string;
    kode: string;
  };
}

export interface KRS {
  id: number;
  mahasiswaId: number;
  mataKuliahId: number;
  semester: string;
  tahunAjaran: string;
  status: 'pending' | 'approved' | 'rejected';
  mahasiswa?: {
    nama: string;
    nim: string;
  };
  mataKuliah?: {
    nama: string;
    kode: string;
    sks: number;
  };
}

export interface SkalaNilai {
  id: number;
  kurikulumId: number;
  nilaiMin: number;
  nilaiMax: number;
  grade: string;
  bobot: number;
  kurikulum?: {
    name: string;
    code: string;
  };
}

export interface Pembayaran {
  id: number;
  mahasiswaId: number;
  jumlah: number;
  tanggal: Date;
  status: 'pending' | 'paid' | 'failed';
  keterangan?: string;
  mahasiswa?: {
    nama: string;
    nim: string;
  };
}

export interface ForumThread {
  id: number;
  title: string;
  content: string;
  authorId: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    nama: string;
    role: string;
  };
  category?: {
    name: string;
  };
  replies?: number;
}

export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  threadCount: number;
}
