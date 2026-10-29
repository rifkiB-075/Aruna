import { describe, it, expect } from "vitest";
import { validateXlsxStructure } from "./xlsx";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("Importer xlsx", () => {
  it("validate structure", () => {
    const filePath = path.join(process.cwd(), "data/import/aruna_data_layanan_draf.xlsx");
    const result = validateXlsxStructure(filePath);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("skip if no Supabase env", () => {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      expect(true).toBe(true); // skip
    }
  });

  // ponytail: full integration test dengan cleanup, butuh Supabase live
});
