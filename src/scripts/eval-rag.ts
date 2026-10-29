#!/usr/bin/env tsx
/**
 * Runner evaluasi RAG: jalankan test cases terhadap processChat.
 * Usage: pnpm eval:rag
 * ponytail: automated scoring, CI integration, 50 test cases (T-028).
 */

import { createClient } from "@supabase/supabase-js";
import { processChat } from "../modules/chat/orchestrator";
import { EVAL_CASES, evaluateCase } from "../modules/eval/cases";
import type { EvalResult } from "../modules/eval/cases";

async function runEval() {
  // Setup Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`\n🧪 RAG Evaluation: ${EVAL_CASES.length} cases\n`);

  const results: EvalResult[] = [];
  let passed = 0;
  let failed = 0;

  for (const evalCase of EVAL_CASES) {
    console.log(`[${evalCase.id}] ${evalCase.question}`);

    try {
      const response = await processChat(supabase, evalCase.question);

      const result = evaluateCase(
        evalCase,
        response.answer,
        response.status,
        response.sourceIds
      );

      results.push(result);

      if (result.passed) {
        console.log(`  ✓ PASS (${result.actualStatus})`);
        passed++;
      } else {
        console.log(`  ✗ FAIL: ${result.reason}`);
        console.log(`    Status: ${result.actualStatus}`);
        console.log(`    Answer: ${response.answer.slice(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      results.push({
        caseId: evalCase.id,
        passed: false,
        reason: `Exception: ${error instanceof Error ? error.message : String(error)}`,
        actualStatus: "error",
        actualSourceIds: [],
        hasCitation: false,
      });
      failed++;
    }

    console.log("");
  }

  // Summary
  console.log("=".repeat(60));
  console.log(`Total: ${EVAL_CASES.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Pass rate: ${((passed / EVAL_CASES.length) * 100).toFixed(1)}%`);
  console.log("=".repeat(60));

  // Exit dengan error bila ada yang gagal (untuk CI)
  if (failed > 0) {
    process.exit(1);
  }
}

runEval().catch((error) => {
  console.error("Eval runner error:", error);
  process.exit(1);
});
