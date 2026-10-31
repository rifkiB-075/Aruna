import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  totalChats: number;
  answeredRate: number;
  avgRetrievalScore: number;
  topTopics: Array<{ topic: string; count: number }>;
  unansweredQuestions: Array<{
    id: string;
    question: string;
    count: number;
    created_at: string;
  }>;
  reports: Array<{
    id: string;
    reason: string | null;
    status: string;
    created_at: string;
  }>;
}

export async function GET() {
  const supabase = await createClient();

  // Auth check: only admin roles
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role via profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'reviewer', 'editor'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Total chats last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: totalChats } = await supabase
      .from('chat_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Answered vs fallback
    const { count: answeredCount } = await supabase
      .from('chat_events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'answered')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const answeredRate =
      totalChats && totalChats > 0 ? ((answeredCount || 0) / totalChats) * 100 : 0;

    // Avg retrieval score (answered only)
    const { data: scoreData } = await supabase
      .from('chat_events')
      .select('retrieval_score')
      .eq('status', 'answered')
      .not('retrieval_score', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const avgRetrievalScore =
      scoreData && scoreData.length > 0
        ? scoreData.reduce((sum, row) => sum + (row.retrieval_score || 0), 0) / scoreData.length
        : 0;

    // Top topics (group by topic, count)
    const { data: topicsData } = await supabase
      .from('chat_events')
      .select('topic')
      .not('topic', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const topicCounts = new Map<string, number>();
    topicsData?.forEach((row) => {
      const topic = row.topic as string;
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });

    const topTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Unanswered questions (new only, top 20)
    const { data: unanswered } = await supabase
      .from('unanswered_questions')
      .select('id, redacted_question, count, created_at')
      .eq('follow_up', 'new')
      .order('count', { ascending: false })
      .limit(20);

    // Reports (new only, latest 20)
    const { data: reports } = await supabase
      .from('answer_reports')
      .select('id, reason_redacted, status, created_at')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20);

    const analytics: AnalyticsData = {
      totalChats: totalChats || 0,
      answeredRate: Math.round(answeredRate * 10) / 10,
      avgRetrievalScore: Math.round(avgRetrievalScore * 100) / 100,
      topTopics,
      unansweredQuestions:
        unanswered?.map((q) => ({
          id: q.id,
          question: q.redacted_question,
          count: q.count,
          created_at: q.created_at,
        })) || [],
      reports:
        reports?.map((r) => ({
          id: r.id,
          reason: r.reason_redacted,
          status: r.status,
          created_at: r.created_at,
        })) || [],
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics query error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
