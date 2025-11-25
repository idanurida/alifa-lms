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
