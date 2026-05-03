// app/(dashboard)/akademik/dosen/penilaian/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import PenilaianClient from './PenilaianClient';

export default async function PenilaianPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['dosen', 'staff_akademik', 'super_admin'].includes(session.user.role)) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  let lecturerId: number | null = null;
  let kelasList: any[] = [];
  let enrollments: any[] = [];

  try {
    if (session.user.role === 'dosen') {
      const [lecturer] = await sql`SELECT id FROM lecturers WHERE user_id = ${parseInt(session.user.id)}`;
      if (lecturer) {
        lecturerId = lecturer.id;
        kelasList = await sql`
          SELECT c.id, c.class_code, co.name as course_name
          FROM classes c JOIN courses co ON c.course_id = co.id
          WHERE c.lecturer_id = ${lecturerId} AND c.is_active = true
        `;
      }
    } else {
      kelasList = await sql`
        SELECT c.id, c.class_code, co.name as course_name
        FROM classes c JOIN courses co ON c.course_id = co.id WHERE c.is_active = true
      `;
    }

    if (kelasList.length > 0) {
      const classIds = kelasList.map((k: any) => k.id);
      enrollments = await sql`
        SELECT se.id as enrollment_id, se.student_id, se.final_score, se.final_grade,
               s.name as student_name, s.nim,
               c.class_code, co.name as course_name, c.id as class_id
        FROM student_enrollments se
        JOIN students s ON se.student_id = s.id
        JOIN classes c ON se.class_id = c.id
        JOIN courses co ON c.course_id = co.id
        WHERE c.id = ANY(${classIds}::int[])
        ORDER BY c.class_code, s.name
        LIMIT 100
      `;
    }
  } catch {}

  return <PenilaianClient kelasList={kelasList} enrollments={enrollments} />;
}
