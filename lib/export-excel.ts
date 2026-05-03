// lib/export-excel.ts — Lightweight CSV/XLSX exporter
// Tidak butuh dependency tambahan — generate CSV yang bisa dibuka Excel

export function exportToCSV(filename: string, columns: string[], rows: Record<string, unknown>[]) {
  // Escape helper
  const esc = (val: unknown) => {
    const str = String(val ?? '');
    // Escape double quotes and wrap in quotes if contains comma, newline, or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Header row
  const header = columns.map(esc).join(',');

  // Data rows
  const dataRows = rows.map(row =>
    columns.map(col => esc(row[col])).join(',')
  );

  // Combine
  const csv = '\uFEFF' + [header, ...dataRows].join('\n'); // BOM for Excel UTF-8

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
