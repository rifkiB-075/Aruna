import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contents')
    .select('id, title, kind, body')
    .eq('status', 'published')
    .limit(50);

  if (error) {
    console.error('Contents fetch error:', error);
    return NextResponse.json({ error: 'Failed to load contents' }, { status: 500 });
  }

  return NextResponse.json({ contents: data || [] });
}
