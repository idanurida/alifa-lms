// app/auth/page.tsx
import { redirect } from 'next/navigation';

// Redirect root auth ke login
export default function AuthPage() {
  redirect('/login');
}