import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ContentDraft {
  id: string;
  content_type: string;
  title: string;
  content: unknown;
  source_reference: string | null;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'reviewer', 'editor'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: drafts, error } = await supabase
    .from('ai_content_drafts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch AI content drafts:', error);
    return NextResponse.json({ error: 'Failed to load drafts' }, { status: 500 });
  }

  return NextResponse.json({ drafts: drafts as ContentDraft[] });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'reviewer'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json()) as { content_id: string; action: 'approve' | 'reject'; note?: string };

  const { error } = await supabase.rpc('review_ai_content', {
    p_content_id: body.content_id,
    p_action: body.action,
    p_note: body.note || null,
  });

  if (error) {
    console.error('Failed to review content:', error);
    return NextResponse.json({ error: 'Failed to review content' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
