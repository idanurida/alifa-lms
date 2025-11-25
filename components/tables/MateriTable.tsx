'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LearningMaterial {
  id: number;
  title: string;
  type: string;
  uploadDate: string;
  size: string;
  downloads: number;
}

interface MateriTableProps {
  data: LearningMaterial[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function MateriTable({ data, onEdit, onDelete }: MateriTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul Materi</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Tanggal Upload</TableHead>
          <TableHead>Ukuran</TableHead>
          <TableHead>Download</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((material) => (
          <TableRow key={material.id}>
            <TableCell className="font-medium">{material.title}</TableCell>
            <TableCell>
              <Badge variant={
                material.type === 'pdf' ? 'destructive' :
                material.type === 'video' ? 'default' : 'secondary'
              }>
                {material.type}
              </Badge>
            </TableCell>
            <TableCell>{material.uploadDate}</TableCell>
            <TableCell>{material.size}</TableCell>
            <TableCell>{material.downloads}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(material.id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(material.id)}
                      className="text-red-600"
                    >
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}