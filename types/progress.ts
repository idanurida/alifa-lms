// types/progress.ts

// Progres Akademik Mahasiswa
export interface AcademicProgress {
  nim: string;
  name: string;
  curriculum: string;
  total_credits: number;
  completed_credits: number;
  gpa: number;
  semester_progress: Array<{
    semester: number;
    credits_taken: number;
    credits_passed: number;
    semester_gpa: number;
  }>;
  courses: Array<{
    course_code: string;
    course_name: string;
    semester: number;
    credits: number;
    status: 'completed' | 'active' | 'failed' | 'dropped';
    final_grade?: string;
    final_score?: number;
  }>;
}

// Progres Penugasan Dosen
export interface LecturerAssignmentProgress {
  lecturer_id: number;
  name: string;
  nidn: string;
  current_period: string;
  teaching_load: {
    assigned: number; // total SKS di-assign
    actual: number;   // SKS sedang diajar
    completed: number; // SKS selesai
  };
  classes: Array<{
    class_id: number;
    course_name: string;
    class_code: string;
    students_count: number;
    completion_status: {
      syllabus_uploaded: boolean;
      materials_uploaded: number; // dari 16 minggu
      evaluation_setup: boolean;  // komponen nilai sudah diatur
      attendance_input: number;   // % presensi yang sudah diinput
      grades_input: number;       // % nilai yang sudah diinput
    };
    last_activity: string;
  }>;
}