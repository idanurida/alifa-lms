import { sql } from '@/lib/db';
import { LandingPageContent } from '@/components/landing/LandingPageContent';

// Force dynamic rendering to ensure stats are always up-to-date
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let stats = {
    students: 0,
    lecturers: 0,
    studyPrograms: 0,
    satisfaction: "99%"
  };

  try {
    // Fetch real stats from database
    const [studentsResult] = await sql`SELECT COUNT(*)::int as count FROM students`;
    const [lecturersResult] = await sql`SELECT COUNT(*)::int as count FROM lecturers`;
    const [programsResult] = await sql`SELECT COUNT(*)::int as count FROM study_programs`;

    stats = {
      students: studentsResult?.count || 0,
      lecturers: lecturersResult?.count || 0,
      studyPrograms: programsResult?.count || 0,
      satisfaction: "99%"
    };
  } catch (error) {
    console.error('Failed to fetch landing page stats:', error);
    // Fallback values in case of database error
    stats = {
      students: 2500,
      lecturers: 150,
      studyPrograms: 48,
      satisfaction: "99%"
    };
  }

  return <LandingPageContent dbStats={stats} />;
}
