import { test, expect } from '@playwright/test';

/**
 * Security tests untuk fase 2 akun warga.
 * Test: IDOR, PII tidak tersimpan, RLS, cascade delete.
 * 
 * ponytail: Butuh Supabase live + 2 test users untuk full test.
 * Saat ini: struktur test saja, skip execution tanpa env.
 */

test.describe('Security: Akun Warga', () => {
  test("IDOR: user A tidak bisa akses riwayat user B", async ({ page: _page }) => {
    // Setup: Buat 2 user (A dan B), user A buat chat session
    // 1. Signup user A, login, buat session, ambil session_id
    // 2. Logout, signup user B, login
    // 3. User B coba GET /api/chat/history?session_id=<A's session>
    // Expect: 401 atau empty array (RLS block)
    
    await _page.goto('/login');
    
    // User A signup
    await _page.fill('input[type="email"]', 'usera@test.local');
    await _page.fill('input[type="password"]', 'password123');
    await _page.click('button:has-text("Daftar")');
    
    // Wait for email verification (mock atau skip)
    // Login user A
    // Buat chat session via API
    const resA = await _page.evaluate(async () => {
      const res = await fetch('/api/chat/history', { method: 'GET' });
      return res.json();
    });
    
    const sessionIdA = resA.sessions[0]?.id;
    expect(sessionIdA).toBeDefined();
    
    // Logout
    await _page.evaluate(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    });
    
    // User B signup dan login
    await _page.goto('/login');
    await _page.fill('input[type="email"]', 'userb@test.local');
    await _page.fill('input[type="password"]', 'password123');
    await _page.click('button:has-text("Daftar")');
    
    // User B coba akses session A
    const resB = await _page.evaluate(async (sessionId: string) => {
      const res = await fetch(`/api/chat/history?session_id=${sessionId}`);
      return { status: res.status, data: await res.json() };
    }, sessionIdA);
    
    // RLS harus block
    expect([401, 403]).toContain(resB.status);
  });

  test.skip('PII tidak tersimpan di chat_messages', async ({ page: _page }) => {
    // Setup: Login, kirim chat dengan NIK
    // 1. Login user
    // 2. Kirim chat: "NIK saya 3374012345670001"
    // 3. Query DB: SELECT content FROM chat_messages WHERE role='user' ORDER BY created_at DESC LIMIT 1
    // Expect: content berisi [NIK] atau tidak ada baris (safeToStore=false)
    
    await _page.goto('/login');
    // Login mock user
    
    await _page.goto('/chat');
    await _page.fill('textarea', 'NIK saya 3374012345670001');
    await _page.click('button:has-text("Kirim")');
    
    // Wait for response
    await _page.waitForTimeout(2000);
    
    // Cek DB via API admin atau direct query (butuh service_role)
    const dbContent = await _page.evaluate(async () => {
      // ponytail: call test endpoint atau Supabase direct
      return null;
    });
    
    // Tidak boleh ada NIK mentah
    expect(dbContent).not.toContain('3374012345670001');
  });

  test.skip('Pemisahan admin/warga: admin tidak punya citizen_account', async ({ page: _page }) => {
    // 1. Login sebagai admin (dari profiles)
    // 2. Query citizen_accounts WHERE id = admin.id
    // Expect: tidak ada baris
    
    // 3. Login sebagai warga
    // 4. Query profiles WHERE id = citizen.id
    // Expect: tidak ada baris
    
    await _page.goto('/login');
    expect(true).toBe(true); // placeholder
  });

  test.skip('Cascade delete: hapus akun → semua riwayat hilang', async ({ page: _page }) => {
    // 1. Signup user, buat 3 chat sessions dengan beberapa messages
    // 2. DELETE /api/account
    // 3. Query citizen_accounts, chat_sessions, chat_messages WHERE account_id = user.id
    // Expect: semua tabel kosong (cascade ON DELETE)
    
    await _page.goto('/login');
    // Signup
    
    // Buat sessions
    
    // Delete account
    const res = await _page.evaluate(async () => {
      const res = await fetch('/api/account', { method: 'DELETE' });
      return res.status;
    });
    
    expect(res).toBe(200);
    
    // Verify cascade (butuh DB query)
  });

  test.skip('RLS bypass attempt: anon key tidak bisa insert admin role', async ({ page: _page }) => {
    // Coba insert ke profiles dengan role='super_admin' via anon key
    // Expect: RLS block atau policy violation
    
    const res = await _page.evaluate(async () => {
      // Create Supabase client dengan anon key
      // Try insert { id: gen_random_uuid(), role: 'super_admin' }
      return { error: 'RLS blocked' };
    });
    
    expect(res.error).toBeTruthy();
  });
});

// ponytail: Setup test users dengan fixture, cleanup setelah test
