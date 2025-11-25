// app/(dashboard)/pengaturan/identitas/page.tsx - VERSI BENAR
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { GraduationCap, User, FileText } from 'lucide-react';
import Link from 'next/link'; // TAMBAHKAN IMPORT INI

export default async function PengaturanIdentitasPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['mahasiswa', 'dosen'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let documents: any[] = [];
  let identityInfo = null;

  try {
    if (session.user.role === 'mahasiswa') {
      const [student] = await sql`
        SELECT s.id, s.nim, s.name, s.year_entry, c.name as curriculum_name
        FROM students s
        JOIN curricula c ON s.curriculum_id = c.id
        WHERE s.user_id = ${session.user.id}
      `;
      identityInfo = student;

      documents = await sql`
        SELECT id, document_type, file_name, status, uploaded_at
        FROM student_documents
        WHERE student_id = ${identityInfo.id}
        ORDER BY uploaded_at DESC
      `;
    } else if (session.user.role === 'dosen') {
      const [lecturer] = await sql`
        SELECT l.id, l.nidn, l.name, l.expertise
        FROM lecturers l
        WHERE l.user_id = ${session.user.id}
      `;
      identityInfo = lecturer;

      documents = await sql`
        SELECT id, document_type, file_name, status, expiration_date, uploaded_at
        FROM lecturer_documents
        WHERE lecturer_id = ${identityInfo.id}
        ORDER BY uploaded_at DESC
      `;
    }
  } catch (error) {
    console.error('Failed to fetch identity data:', error);
    return <div>Failed to load data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Identitas</h1>
        <p className="text-muted-foreground">
          Kelola dokumen identitas dan informasi profil spesifik Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {session.user.role === 'mahasiswa' ? <GraduationCap size={18} /> : <User size={18} />}
            Informasi {session.user.role === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {session.user.role === 'mahasiswa' ? 'NIM' : 'NIDN'}
              </p>
              <p className="font-mono font-medium">{identityInfo?.[session.user.role === 'mahasiswa' ? 'nim' : 'nidn']}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p>{identityInfo?.name}</p>
            </div>
            {session.user.role === 'mahasiswa' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Kurikulum</p>
                  <p>{identityInfo?.curriculum_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tahun Masuk</p>
                  <p>{identityInfo?.year_entry}</p>
                </div>
              </>
            )}
            {session.user.role === 'dosen' && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Keahlian</p>
                <p>{identityInfo?.expertise}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={18} />
            Dokumen Identitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="mb-4" asChild>
            <Link href={`/pengaturan/identitas/upload`}>
              Upload Dokumen Baru
            </Link>
          </Button>
          {documents.length === 0 ? (
            <p className="text-muted-foreground">Belum ada dokumen yang diunggah.</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Jenis Dokumen</th>
                    <th className="text-left p-2">Nama File</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Tanggal Upload</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc: any) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">{doc.document_type}</td>
                      <td className="p-2 font-medium">{doc.file_name}</td>
                      <td className="p-2">
                        <Badge variant={
                          doc.status === 'verified' ? 'default' :
                          doc.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="p-2">{new Date(doc.uploaded_at).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
