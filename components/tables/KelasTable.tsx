// components/tables/KelasTable.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users } from 'lucide-react';

interface Class {
  id: number;
  name: string;
  code: string;
  lecturer: string;
  student_count: number;
  semester: string;
  status: 'active' | 'inactive';
}

interface KelasTableProps {
  data: Class[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function KelasTable({ data, onEdit, onDelete }: KelasTableProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Kelas</TableHead>
            <TableHead>Dosen</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Mahasiswa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((classItem) => (
            <TableRow key={classItem.id}>
              <TableCell className="font-medium">{classItem.code}</TableCell>
              <TableCell>{classItem.name}</TableCell>
              <TableCell>{classItem.lecturer}</TableCell>
              <TableCell>{classItem.semester}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {classItem.student_count}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={classItem.status === 'active' ? 'default' : 'secondary'}>
                  {classItem.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(classItem.id)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(classItem.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}