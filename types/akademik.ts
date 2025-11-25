// Types untuk modul akademik - sesuai dengan struktur database PostgreSQL
export interface StudyProgram {
  id: number;
  name: string;
  code: string;
  faculty?: string;
  is_active: boolean;
  created_at: Date | string;
}

export interface Curriculum {
  id: number;
  name: string;
  code: string;
  study_program_id?: number;
  study_program?: StudyProgram;
  total_credits: number;
  is_active: boolean;
  created_at: Date | string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  curriculum_id?: number;
  curriculum?: Curriculum;
  semester?: number;
  description?: string;
  is_active: boolean;
  created_at: Date | string;
}

export interface AcademicPeriod {
  id: number;
  name: string;
  code: string;
  year: number;
  semester: number;
  start_date: Date | string;
  end_date: Date | string;
  uts_week?: number;
  uas_week?: number;
  is_active: boolean;
  created_at: Date | string;
}

export interface Lecturer {
  id: number;
  nidn: string;
  name?: string;
  email?: string;
  phone?: string;
  expertise?: string;
  status: string;
  user_id?: string;
  created_at: Date | string;
}

export interface Student {
  id: number;
  user_id?: number;
  nim: string;
  name?: string;
  email?: string;
  phone?: string;
  curriculum_id?: number;
  curriculum?: Curriculum;
  study_program_id?: string;
  year_entry: number;
  status: string;
  photo_url?: string;
  total_credits: number;
  current_semester: number;
  created_at: Date | string;
}

export interface Class {
  id: number;
  course_id?: number;
  course?: Course;
  academic_period_id?: number;
  academic_period?: AcademicPeriod;
  class_code: string;
  lecturer_id?: number;
  lecturer?: Lecturer;
  schedule: any;
  max_students: number;
  current_students: number;
  is_active: boolean;
  created_at: Date | string;
}

export interface LecturerAssignment {
  id: number;
  lecturer_id?: number;
  lecturer?: Lecturer;
  class_id?: number;
  class?: Class;
  assignment_type: string;
  teaching_load: number;
  start_date?: Date | string;
  end_date?: Date | string;
  is_active: boolean;
  created_at: Date | string;
}

// Extended interfaces untuk kompatibilitas dengan komponen existing
export interface CurriculumWithProgram extends Curriculum {
  programStudi?: StudyProgram;
  totalCredits?: number;
  isActive?: boolean;
}

export interface StudyProgramWithExtras extends StudyProgram {
  isActive?: boolean;
}

export interface ClassWithExtras extends Class {
  course_code?: string;
  course_name?: string;
}

export type UserRole = 'mahasiswa' | 'dosen' | 'admin' | 'superadmin';

// Types untuk form creation
export type CreateStudyProgram = Omit<StudyProgram, 'id' | 'created_at'>;
export type CreateCurriculum = Omit<Curriculum, 'id' | 'created_at'>;
export type CreateCourse = Omit<Course, 'id' | 'created_at'>;
export type CreateAcademicPeriod = Omit<AcademicPeriod, 'id' | 'created_at'>;
export type CreateLecturerAssignment = Omit<LecturerAssignment, 'id' | 'created_at'>;
