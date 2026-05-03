// app/(dashboard)/akademik/dosen/presensi/PresensiClient.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export default function PresensiClient({ kelasList, attendances }: { kelasList: any[]; attendances: any[] }) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const filtered = selectedClass
    ? attendances.filter((a: any) => a.class_id === selectedClass)
    : attendances;

  const statusIcons: Record<string, any> = {
    hadir: CheckCircle,
    izin: Clock,
    sakit: MinusCircle,
    alpha: XCircle,
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    hadir: { bg: 'bg-green-100', text: 'text-green-700' },
    izin: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    sakit: { bg: 'bg-orange-100', text: 'text-orange-700' },
    alpha: { bg: 'bg-red-100', text: 'text-red-700' },
  };

  const countStatus = (data: Record<string, string>, status: string) =>
    Object.values(data).filter(v => v === status).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Presensi</h1>
        <p className="text-muted-foreground text-sm mt-1">Rekap kehadiran mahasiswa per pertemuan.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada data presensi.</p>
          </div>
        ) : (
          filtered.map((a: any) => {
            const data = typeof a.attendance_data === 'string' ? JSON.parse(a.attendance_data) : a.attendance_data;
            const stats = {
              hadir: countStatus(data, 'hadir'),
              izin: countStatus(data, 'izin'),
              sakit: countStatus(data, 'sakit'),
              alpha: countStatus(data, 'alpha'),
            };
            const total = Object.keys(data).length;

            return (
              <Card key={a.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Pertemuan {a.meeting_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(a.meeting_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge variant="outline">{a.class_code}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{a.course_name}</p>
                  <div className="flex gap-3 text-sm">
                    {(['hadir', 'izin', 'sakit', 'alpha'] as const).map(status => {
                      const Icon = statusIcons[status];
                      const color = statusColors[status];
                      return (
                        <div key={status} className="flex items-center gap-1">
                          <Icon className={`h-4 w-4 ${color.text}`} />
                          <span className="font-medium">{stats[status]}</span>
                        </div>
                      );
                    })}
                    <span className="text-muted-foreground ml-auto">/ {total} mhs</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
