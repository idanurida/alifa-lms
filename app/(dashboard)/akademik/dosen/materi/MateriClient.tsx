// app/(dashboard)/akademik/dosen/materi/MateriClient.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Link, Calendar } from 'lucide-react';

interface Kelas {
  id: number;
  class_code: string;
  course_name: string;
}

interface Materi {
  id: number;
  class_id: number;
  title: string;
  material_type: string;
  file_path?: string;
  content?: string;
  week_number?: number;
  is_published: boolean;
  created_at: string;
  class_code?: string;
  course_name?: string;
}

export function MateriClient({ kelasList, materiList }: { kelasList: Kelas[]; materiList: Materi[] }) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const filtered = selectedClass
    ? materiList.filter(m => m.class_id === selectedClass)
    : materiList;

  const typeIcons: Record<string, any> = {
    file: FileText,
    video: Video,
    link: Link,
  };

  const typeColors: Record<string, string> = {
    file: 'bg-blue-100 text-blue-700',
    video: 'bg-red-100 text-red-700',
    link: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Materi Pembelajaran</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload dan kelola materi perkuliahan.</p>
      </div>

      {/* Class filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedClass === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedClass(null)}
        >
          Semua Kelas
        </Button>
        {kelasList.map(k => (
          <Button
            key={k.id}
            variant={selectedClass === k.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedClass(k.id)}
          >
            {k.class_code} - {k.course_name}
          </Button>
        ))}
      </div>

      {/* Materials list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada materi. Upload materi melalui API.</p>
          </div>
        ) : (
          filtered.map(m => {
            const Icon = typeIcons[m.material_type] || FileText;
            return (
              <Card key={m.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{m.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={typeColors[m.material_type]} variant="outline">
                          {m.material_type}
                        </Badge>
                        {m.week_number && (
                          <Badge variant="secondary">Minggu {m.week_number}</Badge>
                        )}
                      </div>
                      {(m.class_code || m.course_name) && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {m.class_code} - {m.course_name}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(m.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
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
