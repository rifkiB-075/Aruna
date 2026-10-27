# lib/db

Klien DB dan helper query (pilih satu: Drizzle ORM atau Supabase client, dan konsisten).
Skema dan migrasi SQL ada di /supabase/migrations. UI dan route tidak memanggil DB langsung;
selalu lewat service di src/modules/*.
