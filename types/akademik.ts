// types/akademik.ts

// Program Studi
export interface StudyProgram {
  id: number;
  name: string;
  code: string;
  faculty: string;
  is_active: boolean;
  created_at: string;
}

// Kurikulum
export interface Curriculum {
  id: number;
  name: string;
  code: string;
  study_program_id: number;
  study_program: StudyProgram; // Embedded object
  total_credits: number;
  is_active: boolean;
  created_at: string;
}

// Skala Nilai
export interface GradeScale {
  id: number;
  curriculum_id: number;
  grade_char: string;
  grade_value: number;
  min_score: number;
  max_score: number | null;
  description: string;
  created_at: string;
}

// Periode Akademik
export interface AcademicPeriod {
  id: number;
  name: string;
  code: string;
  year: number;
  semester: 1 | 2; // Ganjil (1) atau Genap (2)
  start_date: string;
  end_date: string;
  uts_week: number;
  uas_week: number;
  is_active: boolean;
  created_at: string;
}

// Mata Kuliah
export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number; // Gabungan sks_theory dan sks_practice
  curriculum_id: number;
  curriculum: Curriculum; // Embedded object
  semester: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Kelas Kuliah
export interface Class {
  id: number;
  course_id: number;
  course: Course; // Embedded object
  academic_period_id: number;
  academic_period: AcademicPeriod; // Embedded object
  class_code: string;
  lecturer_id: number;
  lecturer: {
    name: string;
    nidn: string;
  }; // Embedded lecturer info
  schedule: {
    day: string;
    time: string;
    room: string;
  };
  max_students: number;
  enrolled_students: number; // Computed field
  is_active: boolean;
  created_at: string;
  scheduleText: string; // Computed field for display
}

// Penugasan Dosen
export interface LecturerAssignment {
  id: number;
  lecturer_id: number;
  lecturer: {
    name: string;
    nidn: string;
    expertise: string;
  }; // Embedded lecturer info
  class_id: number;
  class: {
    course_code: string;
    course_name: string;
    class_code: string;
  }; // Embedded class info
  assignment_type: 'main' | 'assistant' | 'guest';
  teaching_load: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

// Enrollment Mahasiswa
export interface StudentEnrollment {
  id: number;
  student_id: number;
  student: {
    name: string;
    nim: string;
  }; // Embedded student info
  class_id: number;
  class: {
    course_code: string;
    course_name: string;
    class_code: string;
  }; // Embedded class info
  enrollment_date: string;
  status: 'registered' | 'active' | 'dropped' | 'failed' | 'completed';
  final_score?: number;
  final_grade?: string;
  created_at: string;
}

// Komponen Penilaian
export interface EvaluationComponent {
  id: number;
  class_id: number;
  component_type: string;
  component_name: string;
  weight: number; // Percentage
  max_score: number;
  deadline?: string;
  description?: string;
  is_published: boolean;
  created_at: string;
}

// Aktivitas & Nilai
export interface StudentActivity {
  id: number;
  enrollment_id: number;
  activity_type: string;
  activity_date: string;
  score: number;
  max_score: number;
  notes?: string;
  created_at: string;
}

// Materi Pembelajaran
export interface LearningMaterial {
  id: number;
  class_id: number;
  title: string;
  material_type: 'slide' | 'reading' | 'video' | 'assignment' | 'solution';
  file_path?: string;
  content?: string;
  week_number: number;
  is_published: boolean;
  created_at: string;
}

// Presensi
export interface Attendance {
  id: number;
  class_id: number;
  meeting_number: number;
  meeting_date: string;
  attendance_data: Record<string, boolean>; // { student_id: is_present }
  created_at: string;
}

// Dokumen Mahasiswa
export interface StudentDocument {
  id: number;
  student_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: number;
  verified_at?: string;
  uploaded_at: string;
}

// Dokumen Dosen
export interface LecturerDocument {
  id: number;
  lecturer_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  status: 'pending' | 'verified' | 'rejected';
  expiration_date?: string;
  verified: boolean;
  uploaded_at: string;
}