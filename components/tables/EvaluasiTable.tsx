// components/tables/EvaluasiTable.tsx
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
import { EvaluationComponent } from '@/types/akademik';

interface EvaluasiTableProps {
   EvaluationComponent[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function EvaluasiTable({ data, onEdit, onDelete }: EvaluasiTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada komponen penilaian.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Komponen</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Bobot (%)</TableHead>
            <TableHead>Skor Maks</TableHead>
            <TableHead>Tenggat</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((evalComp) => (
            <TableRow key={evalComp.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">{evalComp.component_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{evalComp.component_type}</Badge>
              </TableCell>
              <TableCell>{evalComp.weight}%</TableCell>
              <TableCell>{evalComp.max_score}</TableCell>
              <TableCell>{evalComp.deadline || '—'}</TableCell>
              <TableCell>
                <Badge variant={evalComp.is_published ? 'default' : 'secondary'}>
                  {evalComp.is_published ? 'Dipublikasikan' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-card">
                    <DropdownMenuItem onClick={() => onEdit?.(evalComp.id)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(evalComp.id)}>
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}