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

interface EvaluationComponent {
  id: number;
  name: string;
  type: string;
  weight: number;
  deadline: string;
  status: string;
}

interface EvaluasiTableProps {
  data: EvaluationComponent[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function EvaluasiTable({ data, onEdit, onDelete }: EvaluasiTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Evaluasi</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Bobot</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((evaluation) => (
          <TableRow key={evaluation.id}>
            <TableCell className="font-medium">{evaluation.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{evaluation.type}</Badge>
            </TableCell>
            <TableCell>{evaluation.weight}%</TableCell>
            <TableCell>{evaluation.deadline}</TableCell>
            <TableCell>
              <Badge variant={evaluation.status === 'active' ? 'default' : 'secondary'}>
                {evaluation.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(evaluation.id)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(evaluation.id)}
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