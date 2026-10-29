# Integration Tests

Tes integrasi RLS dan four-eyes approval flow. Butuh Supabase lokal running.

## Prasyarat

1. **Docker Desktop** running
2. Supabase CLI installed: `supabase --version`
3. `.env.local` dengan credential lokal

## Jalankan

```bash
# Start Supabase lokal (pertama kali atau setelah stop)
supabase start

# Verify migrations applied
supabase db reset  # atau supabase migration up

# Run integration tests
pnpm test:integration

# Stop Supabase
supabase stop
```

## Test Coverage

- `rls-four-eyes.test.ts`: RLS policies untuk aktivasi sumber
  - Editor insert draft sources
  - Reviewer activate sources (four-eyes: uploader ≠ approver)
  - Self-approval rejection via trigger
  - Only reviewer can activate

## Troubleshooting

**Error: cannot find file specified (docker pipe)**
→ Docker Desktop belum running. Jalankan Docker Desktop dulu.

**Error: Env NEXT_PUBLIC_SUPABASE_URL wajib**
→ Copy `.env.example` ke `.env.local`, isi dengan output `supabase status`.

**Error: relation "profiles" does not exist**
→ Migration belum applied: `supabase db reset`.
