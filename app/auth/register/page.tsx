// app/auth/register/page.tsx
// Redirect ke halaman aktivasi (claim account via NIM/NIDN)
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  redirect('/auth/activate');
}
