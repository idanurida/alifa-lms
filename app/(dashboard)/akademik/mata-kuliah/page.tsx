import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Settings, BookOpen, Filter } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Interface untuk Mata Kuliah dari hasil JOIN query
interface MataKuliah {
    id: number;
    code: string;
    name: string;
    credits: number;
    theory_credits: number;
    practical_credits: number;
    semester: number;
    prerequisites: string | null;
    description: string;
    is_active: boolean;
    curriculum_name: string;
    prodi_name: string;
}

interface StudyProgram {
    id: number;
    name: string;
}

export default async function MataKuliahPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as string;

    if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(userRole)) {
        redirect('/auth/login');
    }

    const canManage = ['super_admin', 'staff_akademik'].includes(userRole);
    const query = (searchParams.query as string) || '';
    const activeTab = (searchParams.prodi as string) || '';

    let data: MataKuliah[] = [];
    let studyPrograms: StudyProgram[] = [];

    try {
        studyPrograms = await sql`SELECT id, name FROM study_programs ORDER BY name` as StudyProgram[];

        const result = await sql`
            SELECT 
                c.id, 
                c.code, 
                c.name, 
                c.credits, 
                c.theory_credits,
                c.practical_credits,
                c.semester, 
                c.prerequisites,
                c.description, 
                c.is_active,
                cur.name as curriculum_name,
                sp.name as prodi_name
            FROM courses c
            JOIN curricula cur ON c.curriculum_id = cur.id
            JOIN study_programs sp ON cur.study_program_id = sp.id
            WHERE (c.name ILIKE ${'%' + query + '%'} OR c.code ILIKE ${'%' + query + '%'})
            ORDER BY sp.name, c.semester, c.code
        ` as MataKuliah[];
        data = result;
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }

    const defaultTab = activeTab || (studyPrograms.length > 0 ? studyPrograms[0].name : '');

    // Group data by Prodi
    const groupedByProdi = data.reduce((acc, course) => {
        if (!acc[course.prodi_name]) acc[course.prodi_name] = {};
        if (!acc[course.prodi_name][course.semester]) acc[course.prodi_name][course.semester] = [];
        acc[course.prodi_name][semesterFix(course.semester)].push(course);
        return acc;
    }, {} as Record<string, Record<number, MataKuliah[]>>);

    function semesterFix(s: any) {
        return typeof s === 'number' ? s : 1;
    }

    return (
        <div className="space-y-8 p-4 md:p-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground flex items-center">
                        <BookOpen className="w-8 h-8 mr-3 text-primary" /> Struktur Kurikulum
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Manajemen data mata kuliah dan sebaran kredit per prodi.
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

            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <form className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="query"
                            defaultValue={query}
                            placeholder="Cari kode atau nama mata kuliah..."
                            className="pl-10 w-full bg-muted/50 focus:bg-background transition-all"
                        />
                        <input type="hidden" name="prodi" value={defaultTab} />
                    </form>
                </CardContent>
            </Card>

            <Tabs defaultValue={defaultTab} className="w-full">
                <div className="flex items-center justify-between mb-6 overflow-x-auto">
                    <TabsList className="bg-muted/50 p-1">
                        {studyPrograms.map((prodi) => (
                            <TabsTrigger
                                key={prodi.id}
                                value={prodi.name}
                                className="px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                {prodi.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {studyPrograms.map((prodi) => (
                    <TabsContent key={prodi.id} value={prodi.name} className="space-y-8 animate-in fade-in transition-all duration-300">
                        {groupedByProdi[prodi.name] ? (
                            Object.entries(groupedByProdi[prodi.name] as Record<number, MataKuliah[]>).sort(([a], [b]) => Number(a) - Number(b)).map(([semester, courses]) => (
                                <Card key={`${prodi.name}-${semester}`} className="overflow-hidden border-none shadow-md ring-1 ring-border">
                                    <div className="bg-primary/5 py-3 px-6 border-b flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-primary flex items-center">
                                            <Badge variant="outline" className="mr-3 bg-background border-primary/20 text-primary">
                                                SEMESTER {semester}
                                            </Badge>
                                        </h3>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                            {courses.length} Mata Kuliah
                                        </Badge>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                    <TableHead className="w-12 text-center text-xs font-bold uppercase tracking-wider">No</TableHead>
                                                    <TableHead className="w-24 text-xs font-bold uppercase tracking-wider">Kode</TableHead>
                                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Mata Kuliah</TableHead>
                                                    <TableHead className="text-center w-24 border-x text-xs font-bold uppercase tracking-wider">T</TableHead>
                                                    <TableHead className="text-center w-24 border-x text-xs font-bold uppercase tracking-wider">P</TableHead>
                                                    <TableHead className="text-center w-24 border-x text-xs font-bold uppercase tracking-wider">Total</TableHead>
                                                    <TableHead className="w-28 text-xs font-bold uppercase tracking-wider">Prasyarat</TableHead>
                                                    <TableHead className="text-center w-28 text-xs font-bold uppercase tracking-wider">Status</TableHead>
                                                    {canManage && <TableHead className="text-center w-20 text-xs font-bold uppercase tracking-wider">Aksi</TableHead>}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {courses.map((course, index) => (
                                                    <TableRow key={course.id} className="group hover:bg-muted/20 transition-colors">
                                                        <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                                                        <TableCell className="font-mono text-xs font-bold text-primary">{course.code}</TableCell>
                                                        <TableCell className="font-medium">{course.name}</TableCell>
                                                        <TableCell className="text-center border-x text-muted-foreground">{course.theory_credits || 0}</TableCell>
                                                        <TableCell className="text-center border-x text-muted-foreground">{course.practical_credits || 0}</TableCell>
                                                        <TableCell className="text-center border-x font-bold text-foreground bg-primary/5">{course.credits}</TableCell>
                                                        <TableCell className="text-[11px] text-muted-foreground italic">
                                                            {course.prerequisites || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className={cn(
                                                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                                                                course.is_active ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-700"
                                                            )}>
                                                                {course.is_active ? 'Aktif' : 'Non-aktif'}
                                                            </div>
                                                        </TableCell>
                                                        {canManage && (
                                                            <TableCell className="text-center">
                                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-full">
                                                                    <Link href={`/akademik/mata-kuliah/${course.id}`}>
                                                                        <Settings className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-primary/[0.02] font-bold border-t-2">
                                                    <TableCell colSpan={5} className="text-right text-xs uppercase tracking-widest text-muted-foreground">
                                                        Total SKS Semester {semester}
                                                    </TableCell>
                                                    <TableCell className="text-center border-x text-primary text-lg">
                                                        {courses.reduce((sum, c) => sum + c.credits, 0)}
                                                    </TableCell>
                                                    <TableCell colSpan={canManage ? 3 : 2}></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                                <Filter className="w-12 h-12 mb-4 text-muted-foreground/30" />
                                <p className="text-lg font-semibold text-muted-foreground">Tidak ada data untuk filter ini</p>
                                <p className="text-sm text-muted-foreground/60">Coba ubah kata kunci pencarian Anda.</p>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
