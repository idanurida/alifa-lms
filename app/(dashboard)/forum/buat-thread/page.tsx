// app/(dashboard)/forum/buat-thread/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function BuatThreadPage({ searchParams }: { searchParams: { category_id?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(session.user.role as string)) {
    return <div>Unauthorized</div>;
  }

  let categories = [];
  try {
    const result = await sql`
      SELECT id, name, slug FROM forum_categories WHERE is_active = true ORDER BY name
    `;
    categories = result;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return <div>Failed to load categories.</div>;
  }

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const currentSession = await getServerSession(authOptions);
    if (!currentSession || !['super_admin', 'staff_akademik', 'dosen', 'mahasiswa'].includes(currentSession.user.role as string)) {
      // Handle unauthorized access
      return;
    }

    const categoryId = parseInt(formData.get('category_id') as string);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!categoryId || !title || !content) {
      // Handle validation error
      return;
    }

    // Validasi apakah kategori aktif
    const [category] = await sql`SELECT is_active FROM forum_categories WHERE id = ${categoryId}`;
    if (!category || !category.is_active) {
      // Handle error: category not found or inactive
      return;
    }

    try {
      // Dapatkan lecturer_id atau student_id dari user session
      const [lecturer] = await sql`SELECT id FROM lecturers WHERE user_id = ${currentSession.user.id}`;
      const [student] = await sql`SELECT id FROM students WHERE user_id = ${currentSession.user.id}`;
      const userId = lecturer?.id || student?.id;

      if (!userId) {
        // Handle error: user profile not found
        return;
      }

      // Generate slug dari title
      const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

      // Buat thread baru
      const [newThread] = await sql`
        INSERT INTO forum_threads (category_id, user_id, title, slug, is_pinned, is_locked, view_count)
        VALUES (${categoryId}, ${userId}, ${title}, ${slug}, false, false, 0)
        RETURNING id
      `;

      // Buat post pertama (first post)
      await sql`
        INSERT INTO forum_posts (thread_id, user_id, content, is_first_post)
        VALUES (${newThread.id}, ${userId}, ${content}, true)
      `;

      // Redirect ke thread yang baru dibuat
      redirect(`/forum/thread/${newThread.id}`);

    } catch (error) {
      console.error('Failed to create thread:', error);
      // Handle error
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium">Forum Diskusi</p>
        <p className="text-muted-foreground text-sm">
          Buat thread diskusi baru.
        </p>
      </div>

      <Card className="glass-effect dark:glass-effect-dark">
        <CardHeader>
          <CardTitle>Buat Thread Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category_id">Kategori *</Label>
              <Select name="category_id" required defaultValue={searchParams.category_id}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Contoh: Tanya Jawab Materi Algoritma"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Konten *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Tulis isi diskusi Anda di sini..."
                required
                className="mt-1 min-h-[150px]"
              ></Textarea>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit">
                <Send size={16} className="mr-2" />
                Buat Thread
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}