import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Settings, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Asumsi cn (classnames helper) tersedia

// --- Interface untuk Mata Kuliah dari hasil JOIN query ---
interface MataKuliah {
    id: number;
    code: string;
    name: string;
    credits: number;
    semester: number;
    description: string;
    is_active: boolean;
    curriculum_name: string;
}

export default async function MataKuliahPage() {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as string;
    
    // Otorisasi: Hanya user dengan peran tertentu yang dapat mengakses halaman
    if (!session || !['super_admin', 'staff_akademik', 'dosen'].includes(userRole)) {
        redirect('/auth/login');
    }

    // Otorisasi untuk Manajemen Data
    const canManage = ['super_admin', 'staff_akademik'].includes(userRole);

    let data: MataKuliah[] = [];
    try {
        const result = await sql<MataKuliah[]>`
            SELECT 
                c.id, 
                c.code, 
                c.name, 
                c.credits, 
                c.semester, 
                c.description, 
                c.is_active,
                cur.name as curriculum_name
            FROM courses c
            JOIN curricula cur ON c.curriculum_id = cur.id
            ORDER BY c.semester, c.code
        `;
        data = result;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        // Jika fetch gagal, set data kosong dan tampilkan pesan error di UI
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground flex items-center">
                        <BookOpen className="w-8 h-8 mr-3 text-primary" /> Daftar Mata Kuliah
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Total {data.length} mata kuliah terdaftar berdasarkan kurikulum.
                    </p>
                </div>
                {canManage && (
                    <Button asChild className="bg-primary hover:bg-primary/90 transition-colors shadow-md">
                        <Link href="/akademik/mata-kuliah/tambah">
                            <Plus size={18} className="mr-2" />
                            Tambah Mata Kuliah
                        </Link>
                    </Button>
                )}
            </div>

            <Card className="shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-xl">Filter dan Pencarian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                    
                    {/* Filter dan Pencarian Bar */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Cari kode, nama mata kuliah..." 
                                className="pl-10 w-full"
                                // Catatan: Implementasi pencarian interaktif memerlukan Client Component
                            />
                        </div>
                        <Input placeholder="Filter Semester..." className="md:w-1/4" />
                        <Input placeholder="Filter Kurikulum..." className="md:w-1/4" />
                    </div>

                    {/* Tabel Mata Kuliah */}
                    <div className="overflow-x-auto border rounded-lg">
                        {data.length > 0 ? (
                            <Table className="min-w-full">
                                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                    <TableRow className="hover:bg-gray-50/70 dark:hover:bg-gray-800/70">
                                        <TableHead className="w-[100px] font-semibold text-primary">Kode</TableHead>
                                        <TableHead className="font-semibold text-primary">Nama Mata Kuliah</TableHead>
                                        <TableHead className="text-center font-semibold text-primary">SKS</TableHead>
                                        <TableHead className="text-center font-semibold text-primary">Semester</TableHead>
                                        <TableHead className="font-semibold text-primary">Kurikulum</TableHead>
                                        <TableHead className="text-center font-semibold text-primary">Status</TableHead>
                                        <TableHead className="text-center w-[100px] font-semibold text-primary">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((course) => (
                                        <TableRow key={course.id} className="hover:bg-primary/5 transition-colors">
                                            <TableCell className="font-mono font-medium">{course.code}</TableCell>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell className="text-center">{course.credits}</TableCell>
                                            <TableCell className="text-center">{course.semester}</TableCell>
                                            <TableCell>{course.curriculum_name}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge 
                                                    variant={course.is_active ? 'default' : 'secondary'}
                                                    className={cn("text-xs font-semibold", course.is_active ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600")}
                                                >
                                                    {course.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link href={`/akademik/mata-kuliah/${course.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" title="Lihat/Edit">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-10 text-center text-muted-foreground">
                                {data.length === 0 && (
                                    <>
                                        <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                                        <p className="text-lg font-semibold">Belum ada Mata Kuliah</p>
                                        <p className="text-sm">Silakan tambahkan mata kuliah baru untuk memulai.</p>
                                    </>
                                )}
                                {data.length === 0 && data.length > 0 && (
                                    <p>Gagal memuat data. Periksa koneksi database atau query Anda.</p>
                                )}
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}