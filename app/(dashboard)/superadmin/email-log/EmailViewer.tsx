// app/(dashboard)/superadmin/email-log/EmailViewer.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default function EmailViewer({ email }: { email: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        <Eye className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[10vh]" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">👁️ Preview Email</h3>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>✕</Button>
              </div>
              <div className="space-y-3 text-sm">
                <div><strong>To:</strong> {email.recipient}</div>
                <div><strong>Subject:</strong> {email.subject}</div>
                <div><strong>Status:</strong> {email.status}</div>
                <div className="border rounded-xl overflow-hidden">
                  <iframe
                    srcDoc={email.body_html}
                    className="w-full h-[400px] border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
