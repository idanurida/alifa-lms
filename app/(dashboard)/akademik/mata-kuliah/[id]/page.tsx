import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MataKuliahForm from '@/components/forms/MataKuliahForm';
import { Curriculum, Course } from '@/types/akademik';

export default async function EditMataKuliahPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
        redirect('/auth/login');
    }

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) notFound();

    let course: any = null;
    let curricula: any[] = [];

    try {
        const [courseResult] = await sql`
      SELECT * FROM courses WHERE id = ${courseId}
    `;
        if (!courseResult) notFound();
        course = courseResult;

        const curriculaResult = await sql`
      SELECT id, name, code FROM curricula WHERE is_active = true ORDER BY code
    `;
        curricula = curriculaResult;
    } catch (error) {
        console.error('Error fetching course:', error);
        return <div>Error loading data.</div>;
    }

    return (
        <div className="space-y-6 p-4 md:p-6 pb-20">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">Edit Mata Kuliah</h1>
                <p className="text-muted-foreground text-sm">
                    Perbarui informasi mata kuliah {course.name} ({course.code}).
                </p>
            </div>

            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle>Formulir Pengubahan Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <MataKuliahForm
                        curricula={curricula as any}
                        initialData={course}
                        isEdit={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
