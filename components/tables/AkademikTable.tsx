// components/tables/AkademikTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface AkademikTableProps {
  data: any[]; // Ganti dengan tipe spesifik seperti Curriculum, Course, dll
  columns: {
    key: string;
    header: string;
    render?: (item: any) => React.ReactNode;
  }[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  editPath?: string;
  deleteAction?: (id: number) => void;
}

export default function AkademikTable({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  editPath, 
  deleteAction 
}: AkademikTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada data.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className="w-auto">
                {col.header}
              </TableHead>
            ))}
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id || index} className="hover:bg-muted/30 transition-colors">
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(item) : item[col.key]}
                </TableCell>
              ))}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-card">
                    {editPath ? (
                      <DropdownMenuItem asChild>
                        <Link href={`${editPath}/${item.id}`}>Edit</Link>
                      </DropdownMenuItem>
                    ) : onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item.id)}>Edit</DropdownMenuItem>
                    )}
                    {deleteAction ? (
                      <DropdownMenuItem onClick={() => deleteAction(item.id)} className="text-destructive">
                        Hapus
                      </DropdownMenuItem>
                    ) : onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                        Hapus
                      </DropdownMenuItem>
                    )}
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