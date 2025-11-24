// components/tables/DosenTable.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Mail, Phone, GraduationCap } from 'lucide-react';

interface Dosen {
  id: number;
  user_id: number;
  nidn: string;
  name: string;
  expertise: string;
  email: string;
  is_active: boolean;
  total_classes: number;
}

interface DosenTableProps {
  data: Dosen[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function DosenTable({ data, onEdit, onDelete }: DosenTableProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIDN</TableHead>
            <TableHead>Nama Dosen</TableHead>
            <TableHead>Bidang Keahlian</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dosen) => (
            <TableRow key={dosen.id}>
              <TableCell className="font-medium">{dosen.nidn}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{dosen.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {dosen.user_id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{dosen.expertise || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Mail size={14} className="text-muted-foreground" />
                  {dosen.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <GraduationCap size={14} className="text-muted-foreground" />
                  {dosen.total_classes} kelas
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={dosen.is_active ? 'default' : 'secondary'}>
                  {dosen.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(dosen.id)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(dosen.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>Tidak ada data dosen</p>
        </div>
      )}
    </div>
  );
}