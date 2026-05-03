// components/laporan/LaporanTable.tsx
'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export-excel';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface LaporanTableProps {
  title: string;
  columns: Column[];
  data: Record<string, unknown>[];
  filename: string;
}

export default function LaporanTable({ title, columns, data, filename }: LaporanTableProps) {
  const cols = columns.map(c => c.key);

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button
          size="sm"
          onClick={() => exportToCSV(filename, columns.map(c => c.label), data.map(row => {
            const mapped: Record<string, unknown> = {};
            columns.forEach(c => { mapped[c.label] = row[c.key]; });
            return mapped;
          }))}
          disabled={data.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Ekspor ke Excel
        </Button>
      </div>
      <div className="rounded-md border mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map(c => (
                <th key={c.key} className="text-left p-2 font-medium text-sm">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-8 text-muted-foreground">
                  Belum ada data.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b hover:bg-muted/30">
                  {columns.map(c => (
                    <td key={c.key} className="p-2 text-sm">
                      {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
