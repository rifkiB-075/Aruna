# feat: MVP core functionality (T-020 s/d T-031)

## Summary

MVP core functionality **86% selesai** (12/14 tasks).

## What's Changed

### Database & Backend (T-020 s/d T-025)
- **Migration 0003**: `service_requirements`, `service_notes`, `service_flow_steps`, `official_channels`
- **Modul quota anonim**: hash IP SHA256 harian, `MemoryQuotaStore`, env QUOTA_ANON_PER_DAY=5/QUOTA_USER_PER_DAY=20
- **AI Gateway**: OpenAI-compatible adapter (OpenAI/xAI/OpenRouter), lazy singleton
- **Ingestion**: validasi MIME, ekstraksi teks, chunking overlap 200, embedding pipeline
- **Approval**: four-eyes workflow (submitForReview, approveSource, rejectSource, deactivateSource)
- **Auth admin**: Supabase SSR + RBAC server-side (`requireRole`, `getCurrentUser`, `hasRole`)

### RAG & Chat (T-026 s/d T-028)
- **Retrieval**: filter sumber aktif + berlaku via RPC `match_chunks`, ambang relevansi dari env
- **Orkestrasi chat**: PII scan → retrieval → LLM → validasi sitasi → fallback
- **Prompt sistem v2**: Aruna, larangan kredensial NIK/password, sitasi wajib [nomor], konteks adalah data
- **Evaluasi**: 50 test cases (Prosedur 10, Syarat 15, PII rejection 10, Out of scope 15)
- **Runner**: `pnpm eval:rag` (exit 1 bila failed), CI integration (commented, butuh Supabase live)

### UI Components (T-029 s/d T-031)
- **ServiceChannelBadge**: badge kanal (sidnok/kantor/campuran)
- **OfficialLink**: link kanal resmi dengan whitelist domain (semarangkota.go.id, play.google.com)
- **ReportButton**: form laporan keliru inline (client component)
- **Feedback module**: `reportAnswer`, `getReportStats` (dashboard stats)
- **Importer xlsx**: skeleton `validateXlsxStructure`, `importDataLayanan` (ponytail: parse + insert)

## Tests & Verification

- **Unit tests**: 20 passed (privacy 6, quota 10, integration 4)
- **Integration tests**: RLS structure verified (service_role bypass trigger, full test di e2e fase auth)
- **Lint**: ✓ (2 warnings non-blocker: unused param `_buffer`, `chatEventId`)
- **Typecheck**: ✓
- **Build**: ✓ (Next.js 15, 14 routes)
- **E2e smoke**: 3 passed

## Dependencies Added

- `xlsx@0.18.5` (importer)

## Not Included (Future Work)

- **T-032**: Aksesibilitas (axe, keyboard nav, 360px, Lighthouse >= 90) - butuh UI penuh
- **T-033**: Tinjauan UU PDP, backup test, UX test 55+ - menunggu persetujuan Hua
- **Full importer**: parse sheet xlsx, insert DB, skip CONTOH/unavailable, `-` → null
- **UI polish**: design system final, icon, color per kanal
- **Eval CI**: aktifkan `pnpm eval:rag` di CI (butuh Supabase + data sumber aktif)

## Breaking Changes

None. Backward compatible dengan fase 0 baseline.

## Security Considerations

✅ **PII Protection**: scan + redact sebelum LLM/DB  
✅ **Quota**: hash IP harian, kedaluwarsa otomatis  
✅ **Four-eyes**: uploaded_by ≠ approved_by (DB trigger enforce)  
✅ **RLS**: publik read verified only, admin full access  
✅ **Auth**: fail-closed (redirect /login bila unauth, 404 bila role ditolak)  
✅ **Prompt injection**: konteks treated as data, bukan instruksi  
✅ **Domain whitelist**: OfficialLink validate domain sebelum render  

## Database Migration

**Migration 0003** adds:
- `service_requirements` (sub_kategori, nomor, jenis_data, keterangan, origin, verification_status, source_id)
- `service_notes` (catatan, origin, verification_status, source_id)
- `service_flow_steps` (nomor, deskripsi, moda, lokasi, jam_operasional, origin, verification_status, source_id)
- `official_channels` (jenis, kontak, url, origin, verification_status, source_id)

RLS: publik read verified only, admin (editor/reviewer) full access.

## Review Checklist

- [ ] Schema migration 0003 reviewed (RLS policies correct)
- [ ] Four-eyes trigger working (`enforce_source_activation` check `current_role_name()`)
- [ ] PII scan tested (50 eval cases cover PII rejection)
- [ ] Quota logic sound (hash collision handled by UTC date + salt)
- [ ] Auth flow secure (fail-closed, redirect unauth, 404 unauthorized role)
- [ ] RAG pipeline works (retrieval filter active + berlaku, fallback bila tidak ada konteks)
- [ ] Evaluasi passed (10 test cases lokal, 50 cases siap CI)

## Related Docs

- `docs/06-TODO.md`: progress tracker (updated)
- `docs/03-ARCHITECTURE.md`: arsitektur RAG, AI Gateway, RLS
- `docs/05-SECURITY.md`: PII, quota, four-eyes, RLS policies
- `AGENTS.md`: aturan kerja agent (B5 RAG guardrails, B4c quota message)

## Deployment Notes

1. **Supabase**: apply migration 0003 di production
2. **Env vars**: tambah `QUOTA_ANON_PER_DAY`, `QUOTA_USER_PER_DAY`, `AI_PROVIDER`, `AI_MODEL`, `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS`
3. **AI Gateway**: pilih provider (OpenAI/xAI/OpenRouter), set API key
4. **Eval**: `pnpm eval:rag` butuh Supabase live + data sumber aktif (skip untuk sekarang)

---

**Progress**: Fase 0 complete (T-010 s/d T-015), MVP 12/14 done (86%).

cc @rifkiB-075
