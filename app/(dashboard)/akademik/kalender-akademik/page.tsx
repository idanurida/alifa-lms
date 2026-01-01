import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AcademicCalendarManager from '@/components/akademik/AcademicCalendarManager';
import { DashboardHeading } from '@/components/dashboard/DashboardComponents';

export default async function KalenderAkademikPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Harap login kembali.</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardHeading
        title="Kalender Akademik"
        subtitle="Manajemen periode semester, jadwal UTS, dan UAS."
        badge="Akademik"
      />

      <AcademicCalendarManager />
    </div>
  );
}
