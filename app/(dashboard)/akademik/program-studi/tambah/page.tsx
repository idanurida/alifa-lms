import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgramStudiForm from '@/components/akademik/ProgramStudiForm'; // Mengimpor form yang baru dibuat
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function TambahProgramStudiPage() {
    const session = await getServerSession(authOptions);

    if (!session || !['super_admin', 'staff_akademik'].includes(session.user.role as string)) {
        return (
            <div className="p-6 text-center text-red-500">
                Anda tidak memiliki izin untuk mengakses halaman ini.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Tambah Program Studi Baru</h1>
                <p className="text-muted-foreground text-sm">
                    Masukkan detail Program Studi baru ke dalam sistem.
                </p>
            </div>

            <Card className="glass-effect dark:glass-effect-dark">
                <CardHeader>
                    <CardTitle>Formulir Program Studi</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Menggunakan ProgramStudiForm yang tidak memerlukan props */}
                    <ProgramStudiForm />
                </CardContent>
            </Card>
        </div>
    );
}