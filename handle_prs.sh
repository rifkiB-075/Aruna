#!/bin/bash
set -e

echo "=== Handling Dependabot PRs ==="

# PR#4: zod sudah fixed
echo "Closing PR#4 (zod already fixed)..."
gh pr close 4 -c "Already fixed in commit 8b08117. Zod 3.25.76 → 4.6.7 dengan pnpm.overrides untuk mengatasi 8 vulnerabilities." || echo "PR#4 skip"

# PR#2: Next 16 breaking
echo "Closing PR#2 (Next 16 breaking)..."
gh pr close 2 -c "Next.js 16 memiliki breaking changes (App Router, Turbopack default). Postpone sampai MVP stabil (fase 2). Butuh testing mendalam sebelum upgrade major version." || echo "PR#2 skip"

# PR#3: eslint-config-next 16 (ikut Next 16)
echo "Closing PR#3 (eslint-config-next ikut Next 16)..."
gh pr close 3 -c "Ikut Next.js 16 upgrade (ditunda). Config ini terikat ke Next major version." || echo "PR#3 skip"

# PR#1: @types/node (aman)
echo "Merging PR#1 (@types/node types-only)..."
gh pr merge 1 --squash --delete-branch || echo "PR#1 skip"

# PR#5: @supabase/ssr (aman)
echo "Merging PR#5 (@supabase/ssr minor update)..."
gh pr merge 5 --squash --delete-branch || echo "PR#5 skip"

echo "=== Done ==="
