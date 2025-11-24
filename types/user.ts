// types/user.ts

// Enum untuk role pengguna
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  STAFF_AKADEMIK = 'staff_akademik',
  STAFF_KEUANGAN = 'staff_keuangan',
  DOSEN = 'dosen',
  MAHASISWA = 'mahasiswa',
}

// Interface dasar untuk pengguna
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

// Interface untuk profil (digabungkan ke user karena tidak ada tabel profiles terpisah)
export interface UserProfile extends User {
  name: string;
  phone?: string;
  photo_url?: string;
}

// Interface khusus untuk Mahasiswa
export interface Mahasiswa extends UserProfile {
  nim: string;
  year_entry: number;
  status: 'active' | 'inactive' | 'graduated' | 'expelled';
  study_program_id: string; // UUID
}

// Interface khusus untuk Dosen
export interface Dosen extends UserProfile {
  nidn: string;
  expertise?: string;
  status: 'active' | 'inactive' | 'on_leave';
}

// Interface untuk data login
export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

// Interface untuk data session NextAuth
export interface SessionUser extends UserProfile {
  nim?: string;
  nidn?: string;
  expertise?: string;
}