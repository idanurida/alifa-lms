// app/(dashboard)/akademik/dosen/edit/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DosenForm from '@/components/forms/DosenForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditDosenPage({ params }: PageProps) {
    const { id: idParam } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
        redirect('/login');
    }

    const id = parseInt(idParam);
    if (isNaN(id)) notFound();

    const dosen = await prisma.lecturer.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!dosen) notFound();

    // Map to the format DosenForm expects
    const initialData = {
        id: dosen.id,
        nidn: dosen.nidn,
        name: dosen.name,
        email: dosen.email,
        phone: dosen.phone,
        expertise: dosen.expertise,
        status: dosen.status,
    };

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">Edit Data Dosen</h1>
                <p className="text-muted-foreground text-sm">
                    Perbarui informasi dosen {dosen.name}
                </p>
            </div>

            <DosenForm initialData={initialData} />
        </div>
    );
}
