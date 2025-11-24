// app/(dashboard)/akademik/mahasiswa/nilai/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp } from 'lucide-react';

export default function NilaiPage() {
  const grades = [
    { course: 'Pemrograman Dasar', code: 'TI101', credits: 3, grade: 'A', score: 4.0 },
    { course: 'Basis Data', code: 'TI102', credits: 3, grade: 'A-', score: 3.7 },
    { course: 'Jaringan Komputer', code: 'TI103', credits: 3, grade: 'B+', score: 3.3 },
  ];

  const gpa = 3.67;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Nilai Akademik</h1>
        <p className="text-muted-foreground">
          Transkrip Nilai Semester Genap 2024/2025
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPK</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gpa}</div>
            <p className="text-xs text-muted-foreground">
              Indeks Prestasi Kumulatif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Baik</div>
            <p className="text-xs text-muted-foreground">
              Tidak ada mata kuliah mengulang
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Nilai Huruf</TableHead>
                <TableHead>Nilai Angka</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{grade.code}</TableCell>
                  <TableCell>{grade.course}</TableCell>
                  <TableCell>{grade.credits}</TableCell>
                  <TableCell>
                    <Badge variant={grade.grade === 'A' ? 'default' : 'secondary'}>
                      {grade.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>{grade.score}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Lulus
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}