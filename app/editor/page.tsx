import { redirect } from 'next/navigation';

// Redirect old /editor route to new /tools/social-graphics route
export default function EditorRedirect() {
  redirect('/tools/social-graphics');
}
