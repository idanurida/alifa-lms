// app/(dashboard)/akademik/dosen/penilaian/PenilaianClient.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Users } from 'lucide-react';

export default function PenilaianClient({ kelasList, enrollments }: { kelasList: any[]; enrollments: any[] }) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const filtered = selectedClass
    ? enrollments.filter((e: any) => e.class_id === selectedClass)
    : enrollments;

  const kelasMap: Record<number, string> = {};
  kelasList.forEach((k: any) => { kelasMap[k.id] = `${k.class_code} - ${k.course_name}`; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Penilaian Mahasiswa</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola nilai tugas, UTS, UAS per kelas.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={selectedClass === null ? 'default' : 'outline'} size="sm" onClick={() => setSelectedClass(null)}>
          Semua Kelas
        </Button>
        {kelasList.map((k: any) => (
          <Button key={k.id} variant={selectedClass === k.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedClass(k.id)}>
            {k.class_code}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Mahasiswa ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Pilih kelas untuk melihat daftar mahasiswa.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIM</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-center">Nilai Akhir</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e: any) => (
                  <TableRow key={e.enrollment_id}>
                    <TableCell className="font-mono text-sm">{e.nim}</TableCell>
                    <TableCell className="font-medium">{e.student_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.class_code} - {e.course_name}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {e.final_score ? Number(e.final_score).toFixed(1) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {e.final_grade ? (
                        <Badge variant="outline">{e.final_grade}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Belum</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
