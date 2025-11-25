'use client';
import React from 'react';
import { StudyProgram } from '@/types/akademik'; // Menggunakan tipe yang sudah diperbarui
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';

interface StudyProgramTableProps {
  programs: StudyProgram[];
  onEdit: (program: StudyProgram) => void;
  onDelete: (id: number) => void;
}

export default function StudyProgramTable({ programs, onEdit, onDelete }: StudyProgramTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Program Studi</TableHead>
            <TableHead>Fakultas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Tidak ada data Program Studi.
              </TableCell>
            </TableRow>
          ) : (
            programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell className="font-medium">{program.id}</TableCell>
                <TableCell>{program.code}</TableCell>
                <TableCell>{program.name}</TableCell>
                <TableCell>{program.faculty}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    program.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {program.is_active ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(program)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => onDelete(program.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}