// app/(dashboard)/akademik/dosen/materi/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { MateriClient } from './MateriClient';

export default async function MateriPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['dosen', 'staff_akademik', 'super_admin'].includes(session.user.role)) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  let kelasList: any[] = [];
  let materiList: any[] = [];

  try {
    // Get lecturer's classes
    if (session.user.role === 'dosen') {
      const [lecturer] = await sql`SELECT id FROM lecturers WHERE user_id = ${parseInt(session.user.id)}`;
      if (lecturer) {
        kelasList = await sql`
          SELECT c.id, c.class_code, co.name as course_name
          FROM classes c
          JOIN courses co ON c.course_id = co.id
          WHERE c.lecturer_id = ${lecturer.id} AND c.is_active = true
          ORDER BY c.class_code
        `;
      }
    } else {
      // Staff/superadmin see all active classes
      kelasList = await sql`
        SELECT c.id, c.class_code, co.name as course_name
        FROM classes c
        JOIN courses co ON c.course_id = co.id
        WHERE c.is_active = true
        ORDER BY c.class_code
      `;
    }

    // Get recent materials
    if (kelasList.length > 0) {
      const classIds = kelasList.map((k: any) => k.id);
      materiList = await sql`
        SELECT lm.*, c.class_code, co.name as course_name
        FROM learning_materials lm
        JOIN classes c ON lm.class_id = c.id
        JOIN courses co ON c.course_id = co.id
        WHERE lm.class_id = ANY(${classIds}::int[])
        ORDER BY lm.created_at DESC
        LIMIT 50
      `;
    }
  } catch (error) {
    // fallback - empty data
  }

  return <MateriClient kelasList={kelasList} materiList={materiList} />;
}
