import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DatabaseError, deleteRoast, isDatabaseConfigured } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: { code: 'SERVER_ERROR', message: 'Saved roasts are not enabled.' } }, { status: 503 });

  try {
    const deleted = await deleteRoast(user.id, params.id);
    if (!deleted) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'This roast was not found.' } }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof DatabaseError) return NextResponse.json({ error: { code: 'SERVER_ERROR', message: error.message } }, { status: 503 });
    throw error;
  }
}
