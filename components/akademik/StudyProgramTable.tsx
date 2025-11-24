// components/akademik/StudyProgramTable.tsx - PASTIKAN SUDAH SESUAI
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StudyProgram {
  id: number;
  name: string;
  code: string;
  faculty: string;
  is_active: boolean;
  created_at: string;
  total_students: number;
}

interface StudyProgramTableProps {
  programs?: StudyProgram[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function StudyProgramTable({ 
  programs = [],
  onEdit, 
  onDelete 
}: StudyProgramTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrograms = programs.filter(program =>
    program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge variant="default">Aktif</Badge>
      : <Badge variant="secondary">Non-Aktif</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Cari program studi..."
          className="px-3 py-2 border rounded-md w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Program Studi</TableHead>
            <TableHead>Fakultas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Jumlah Mahasiswa</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPrograms.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-mono">{program.code}</TableCell>
              <TableCell className="font-medium">{program.name}</TableCell>
              <TableCell>{program.faculty}</TableCell>
              <TableCell>{getStatusBadge(program.is_active)}</TableCell>
              <TableCell>{program.total_students}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(program.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(program.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {programs.length === 0 ? 'Tidak ada data program studi' : 'Tidak ditemukan program studi yang sesuai'}
        </div>
      )}
    </div>
  );
}