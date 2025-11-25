export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
}

export interface AcademicPeriod {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface Dosen {
  id: number;
  nama: string;
  nip: string;
  email: string;
  phone?: string;
}
