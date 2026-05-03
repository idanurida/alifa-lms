// app/(dashboard)/akademik/dosen/presensi/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import PresensiClient from './PresensiClient';

export default async function PresensiPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['dosen', 'staff_akademik', 'super_admin'].includes(session.user.role)) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  let kelasList: any[] = [];
  let attendances: any[] = [];

  try {
    if (session.user.role === 'dosen') {
      const [lecturer] = await sql`SELECT id FROM lecturers WHERE user_id = ${parseInt(session.user.id)}`;
      if (lecturer) {
        kelasList = await sql`
          SELECT c.id, c.class_code, co.name as course_name
          FROM classes c JOIN courses co ON c.course_id = co.id
          WHERE c.lecturer_id = ${lecturer.id} AND c.is_active = true
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
      attendances = await sql`
        SELECT a.*, c.class_code, co.name as course_name
        FROM attendances a
        JOIN classes c ON a.class_id = c.id
        JOIN courses co ON c.course_id = co.id
        WHERE a.class_id = ANY(${classIds}::int[])
        ORDER BY a.meeting_date DESC
        LIMIT 50
      `;
    }
  } catch {}

  return <PresensiClient kelasList={kelasList} attendances={attendances} />;
}
