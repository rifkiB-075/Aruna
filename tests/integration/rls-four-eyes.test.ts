import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// RLS four-eyes: editor insert draft, reviewer approve, uploader ≠ approver.
// Butuh Supabase lokal running (supabase start), migration 0002_test_helpers applied.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe("RLS four-eyes", () => {
  let adminClient: SupabaseClient;
  let editorId: string;
  let reviewerId: string;
  let serviceTypeId: string;

  beforeAll(async () => {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Env NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada");
    }

    adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Buat 2 admin: editor dan reviewer (service_role bypass RLS)
    const { data: users, error: authErr } = await adminClient.auth.admin.listUsers();
    if (authErr) throw authErr;

    // Cek existing atau buat baru
    let editor = users.users.find((u) => u.email === "editor@test.local");
    let reviewer = users.users.find((u) => u.email === "reviewer@test.local");

    if (!editor) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: "editor@test.local",
        password: "test123456",
        email_confirm: true,
      });
      if (error) throw error;
      editor = data.user;
    }
    if (!reviewer) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: "reviewer@test.local",
        password: "test123456",
        email_confirm: true,
      });
      if (error) throw error;
      reviewer = data.user;
    }

    editorId = editor!.id;
    reviewerId = reviewer!.id;

    // Upsert profiles
    await adminClient.from("profiles").upsert([
      { id: editorId, role: "editor" },
      { id: reviewerId, role: "reviewer" },
    ]);

    // Service type untuk tes
    const { data: st } = await adminClient
      .from("service_types")
      .select("id")
      .eq("code", "TESTCODE")
      .maybeSingle();

    if (st) {
      serviceTypeId = st.id;
    } else {
      const { data: created, error } = await adminClient
        .from("service_types")
        .insert({ code: "TESTCODE", name: "Test Service", category: "test" })
        .select("id")
        .single();
      if (error) throw error;
      serviceTypeId = created.id;
    }
  });

  afterAll(async () => {
    await adminClient.rpc("clear_test_user");
    await adminClient.from("sources").delete().match({ service_type_id: serviceTypeId });
    await adminClient.from("service_types").delete().eq("code", "TESTCODE");
  });

  it("editor insert draft sources", async () => {
    await adminClient.rpc("set_test_user", { user_id: editorId });

    const { data, error } = await adminClient.from("sources").insert({
      title: "Test Draft",
      service_type_id: serviceTypeId,
      effective_date: "2026-01-01",
      status: "draft",
      file_path: "/test.pdf",
      checksum: "abc123",
      uploaded_by: editorId,
    }).select().single();

    expect(error).toBeNull();
    expect(data?.status).toBe("draft");
    expect(data?.uploaded_by).toBe(editorId);

    await adminClient.rpc("clear_test_user");
  });

  it("reviewer activate source (four-eyes: uploader ≠ approver)", async () => {
    await adminClient.rpc("set_test_user", { user_id: editorId });

    const { data: draft, error: draftErr } = await adminClient.from("sources").insert({
      title: "Four-Eyes Test",
      service_type_id: serviceTypeId,
      effective_date: "2026-01-01",
      status: "ready_for_review",
      file_path: "/four-eyes.pdf",
      checksum: "def456",
      uploaded_by: editorId,
    }).select("id").single();

    expect(draftErr).toBeNull();
    const sourceId = draft!.id;

    await adminClient.rpc("clear_test_user");
    await adminClient.rpc("set_test_user", { user_id: reviewerId });

    const { data: activated, error: activateErr } = await adminClient
      .from("sources")
      .update({ status: "active" })
      .eq("id", sourceId)
      .select()
      .single();

    expect(activateErr).toBeNull();
    expect(activated?.status).toBe("active");
    expect(activated?.uploaded_by).toBe(editorId);
    expect(activated?.approved_by).toBe(reviewerId);

    await adminClient.rpc("clear_test_user");
  });

  it("four-eyes trigger reject self-approval", async () => {
    await adminClient.rpc("set_test_user", { user_id: editorId });

    const { data: draft } = await adminClient.from("sources").insert({
      title: "Self-Approve Test",
      service_type_id: serviceTypeId,
      effective_date: "2026-01-01",
      status: "ready_for_review",
      file_path: "/self.pdf",
      checksum: "ghi789",
      uploaded_by: editorId,
    }).select("id").single();

    const sourceId = draft!.id;

    const { error } = await adminClient
      .from("sources")
      .update({ status: "active" })
      .eq("id", sourceId);

    expect(error).not.toBeNull();
    expect(error?.message).toContain("Pengungguh tidak boleh menyetujui dokumennya sendiri");

    await adminClient.rpc("clear_test_user");
  });

  it("only reviewer can activate sources", async () => {
    await adminClient.rpc("set_test_user", { user_id: reviewerId });

    const { data: draft } = await adminClient.from("sources").insert({
      title: "Reviewer Activate",
      service_type_id: serviceTypeId,
      effective_date: "2026-01-01",
      status: "ready_for_review",
      file_path: "/reviewer.pdf",
      checksum: "jkl012",
      uploaded_by: editorId,
    }).select("id").single();

    const sourceId = draft!.id;

    const { error } = await adminClient
      .from("sources")
      .update({ status: "active" })
      .eq("id", sourceId);

    expect(error).toBeNull();

    await adminClient.rpc("clear_test_user");
  });
});
