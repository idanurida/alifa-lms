// app/(dashboard)/superadmin/email-log/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Mail, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import EmailViewer from './EmailViewer';

export default async function EmailLogPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'super_admin') redirect('/login');

  let emails: any[] = [];
  try {
    emails = await sql`
      SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100
    `;
  } catch {
    // Table might not exist yet
  }

  const statusColors: Record<string, string> = {
    sent: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Log Email</h1>
          <p className="text-muted-foreground text-sm">
            {emails.length > 0
              ? `${emails.filter((e: any) => e.status === 'pending').length} pending, ${emails.filter((e: any) => e.status === 'sent').length} terkirim`
              : 'Semua email yang dikirim/disimpan oleh sistem.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Email (100 terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Belum ada email. Reset password atau undangan akan muncul di sini.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Penerima</TableHead>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead className="text-right">Lihat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-sm">{e.recipient}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{e.subject}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[e.status] || ''} variant="outline">
                        {e.status === 'sent' ? 'Terkirim' : e.status === 'failed' ? 'Gagal' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(e.created_at).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <EmailViewer email={e} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
