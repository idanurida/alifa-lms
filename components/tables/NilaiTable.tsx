'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StudentActivity {
  id: number;
  studentName: string;
  studentId: string;
  assignment: string;
  score: number;
  status: string;
  submittedAt: string;
}

interface NilaiTableProps {
  data: StudentActivity[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function NilaiTable({ data, onEdit, onDelete }: NilaiTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Mahasiswa</TableHead>
          <TableHead>NIM</TableHead>
          <TableHead>Tugas</TableHead>
          <TableHead>Nilai</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal Submit</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className="font-medium">{activity.studentName}</TableCell>
            <TableCell>{activity.studentId}</TableCell>
            <TableCell>{activity.assignment}</TableCell>
            <TableCell>
              <Badge variant={activity.score >= 75 ? 'default' : 'destructive'}>
                {activity.score}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={
                activity.status === 'submitted' ? 'secondary' :
                activity.status === 'graded' ? 'default' : 'outline'
              }>
                {activity.status}
              </Badge>
            </TableCell>
            <TableCell>{activity.submittedAt}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(activity.id)}>
                    Edit Nilai
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(activity.id)}
                    className="text-red-600"
                  >
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}