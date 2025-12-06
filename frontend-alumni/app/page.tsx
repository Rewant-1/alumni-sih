import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login by default, or dashboard if logged in
  // For now, redirect to login page
  redirect('/login');
}
