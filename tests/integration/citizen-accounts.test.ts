import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test struktur migrasi 0004 (tidak butuh data live)
describe('Migration 0004 struktur', () => {
  const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  it('tabel citizen_accounts ada dengan kolom wajib', async () => {
    const { data, error } = await supabase
      .from('citizen_accounts')
      .select('id, email, created_at, last_active_at')
      .limit(0);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('tabel usage_counters ada dengan kolom wajib', async () => {
    const { data, error } = await supabase
      .from('usage_counters')
      .select('account_id, chat_count_today, reset_date, total_chats')
      .limit(0);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('tabel chat_sessions ada dengan kolom wajib', async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, account_id, created_at, title, deleted_at')
      .limit(0);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('tabel chat_messages ada dengan kolom wajib', async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, session_id, account_id, role, content, metadata, created_at')
      .limit(0);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('RPC increment_chat_count ada', async () => {
    // Cek function exist (akan error karena tidak ada user, tapi function harus ada)
    const { error } = await supabase.rpc('increment_chat_count', { 
      user_id: '00000000-0000-0000-0000-000000000000' 
    });

    // Function ada tapi user tidak ada = expected error
    expect(error).toBeDefined();
    expect(error?.message).not.toContain('function does not exist');
  });

  it('RPC cleanup_old_chat_sessions ada', async () => {
    const { data, error } = await supabase.rpc('cleanup_old_chat_sessions', { 
      retention_days: 90 
    });

    // Function harus ada dan return integer
    expect(error).toBeNull();
    expect(typeof data).toBe('number');
  });
});

// ponytail: Integration test dengan JWT real user (butuh Supabase live)
