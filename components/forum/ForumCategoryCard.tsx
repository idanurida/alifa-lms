// components/forum/CreateThreadForm.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateThreadFormProps {
  categorySlug: string;
  onSuccess?: () => void;
}

export default function CreateThreadForm({ categorySlug, onSuccess }: CreateThreadFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Creating thread:', { title, content, categorySlug });
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Thread Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul Thread</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul thread..."
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Konten</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis konten thread Anda di sini..."
              rows={8}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Buat Thread</Button>
            <Button type="button" variant="outline" onClick={onSuccess}>
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}