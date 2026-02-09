import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { isAdmin, type UserServerMetadata } from '@/lib/permissions';

/**
 * GET /api/admin/users
 * List all Stack Auth users (admin only)
 */
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverMetadata = user.serverMetadata as UserServerMetadata | null;
    if (!isAdmin(serverMetadata)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const usersList = await stackServerApp.listUsers();

    const users = usersList.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      primaryEmail: u.primaryEmail,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
