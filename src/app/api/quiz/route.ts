import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, question, options, answer_key, explanation, quiz_id, quizzes!inner(status)')
    .eq('quizzes.status', 'published')
    .limit(10);

  if (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json({ error: 'Failed to load quiz' }, { status: 500 });
  }

  return NextResponse.json({ questions: data || [] });
}
