import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Importer idempoten untuk aruna_data_layanan_draf.xlsx.
 * Aturan: semua draf, skip unavailable, `-` → null, preserve sub-kategori.
 * ponytail: validasi Metadata_Sumber lengkap, test coverage, progress tracking.
 */

export interface ImportResult {
  success: boolean;
  imported: {
    serviceTypes: number;
    requirements: number;
    notes: number;
    flowSteps: number;
    channels: number;
  };
  skipped: number;
  errors: string[];
}

interface LayananRow {
  ID: number;
  "Kode Layanan": string;
  "Nama Layanan": string;
  Kategori: string;
  "Status Portal": string;
  "Kode Alur": string | null;
}

interface SyaratRow {
  ID: number;
  "Layanan ID": string;
  "Sub-Kategori Pemohon": string;
  No: string;
  "Jenis Data Dukung": string;
  "Keterangan / Kondisi": string;
  "Asal Data": string;
}

interface CatatanRow {
  ID: number;
  "Layanan ID": string;
  Catatan: string;
  "Asal Data": string;
}

interface AlurRow {
  ID: number;
  "Layanan ID": string;
  No: number;
  Deskripsi: string;
  Moda: string | null;
  Lokasi: string | null;
  "Jam Operasional": string | null;
  "Asal Data": string;
}

interface KanalRow {
  ID: number;
  "Layanan ID": string;
  Jenis: string;
  Kontak: string;
  URL: string | null;
  "Asal Data": string;
}

/** Transform `-` string atau null menjadi null */
function normalizeValue(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str === "-" || str === "" ? null : str;
}

/**
 * Import data dari file xlsx ke database (status draft).
 */
export async function importDataLayanan(
  supabase: SupabaseClient,
  filePath: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: { serviceTypes: 0, requirements: 0, notes: 0, flowSteps: 0, channels: 0 },
    skipped: 0,
    errors: [],
  };

  try {
    const workbook = XLSX.readFile(filePath);

    // Validate required sheets
    const requiredSheets = ["Layanan", "Syarat", "Catatan", "Alur", "Kanal_Resmi"];
    for (const sheet of requiredSheets) {
      if (!workbook.Sheets[sheet]) {
        result.errors.push(`Sheet ${sheet} tidak ditemukan`);
        return result;
      }
    }

    // 1. Parse Layanan (skip unavailable)
    const layananRows = XLSX.utils.sheet_to_json<LayananRow>(workbook.Sheets["Layanan"]!, {
      defval: null,
    });
    const availableLayanan = layananRows.filter(
      (r) => r["Status Portal"] && r["Status Portal"] !== "Belum tersedia"
    );

    for (const row of availableLayanan) {
      const { data: existing } = await supabase
        .from("service_types")
        .select("id")
        .eq("code", row["Kode Layanan"])
        .single();

      if (existing) {
        result.skipped++;
        continue;
      }

      const { data: inserted, error } = await supabase
        .from("service_types")
        .insert({
          code: row["Kode Layanan"],
          name: row["Nama Layanan"],
          category: row.Kategori,
          status: "draft",
          flow_type: normalizeValue(row["Kode Alur"]),
        })
        .select("id, code")
        .single();

      if (error) {
        result.errors.push(`Layanan ${row["Kode Layanan"]}: ${error.message}`);
        continue;
      }

      result.imported.serviceTypes++;

      // 2. Parse Syarat untuk layanan ini
      const syaratRows = XLSX.utils.sheet_to_json<SyaratRow>(workbook.Sheets["Syarat"]!, {
        defval: null,
      });
      const syaratFiltered = syaratRows.filter((r) => r["Layanan ID"] === row["Kode Layanan"]);

      for (const syarat of syaratFiltered) {
        const { error: syaratErr } = await supabase.from("service_requirements").insert({
          service_type_id: inserted!.id,
          sub_kategori: normalizeValue(syarat["Sub-Kategori Pemohon"]),
          nomor: normalizeValue(syarat.No),
          jenis_data: normalizeValue(syarat["Jenis Data Dukung"]),
          keterangan: normalizeValue(syarat["Keterangan / Kondisi"]),
          origin: syarat["Asal Data"] || "unknown",
          verification_status: "draft",
        });

        if (syaratErr) {
          result.errors.push(
            `Syarat ${row["Kode Layanan"]} ID ${syarat.ID}: ${syaratErr.message}`
          );
        } else {
          result.imported.requirements++;
        }
      }

      // 3. Parse Catatan
      const catatanRows = XLSX.utils.sheet_to_json<CatatanRow>(workbook.Sheets["Catatan"]!, {
        defval: null,
      });
      const catatanFiltered = catatanRows.filter((r) => r["Layanan ID"] === row["Kode Layanan"]);

      for (const catatan of catatanFiltered) {
        const { error: catatanErr } = await supabase.from("service_notes").insert({
          service_type_id: inserted!.id,
          catatan: normalizeValue(catatan.Catatan) || "",
          origin: catatan["Asal Data"] || "unknown",
          verification_status: "draft",
        });

        if (catatanErr) {
          result.errors.push(
            `Catatan ${row["Kode Layanan"]} ID ${catatan.ID}: ${catatanErr.message}`
          );
        } else {
          result.imported.notes++;
        }
      }

      // 4. Parse Alur
      const alurRows = XLSX.utils.sheet_to_json<AlurRow>(workbook.Sheets["Alur"]!, {
        defval: null,
      });
      const alurFiltered = alurRows.filter((r) => r["Layanan ID"] === row["Kode Layanan"]);

      for (const alur of alurFiltered) {
        const { error: alurErr } = await supabase.from("service_flow_steps").insert({
          service_type_id: inserted!.id,
          nomor: alur.No,
          deskripsi: normalizeValue(alur.Deskripsi) || "",
          moda: normalizeValue(alur.Moda),
          lokasi: normalizeValue(alur.Lokasi),
          jam_operasional: normalizeValue(alur["Jam Operasional"]),
          origin: alur["Asal Data"] || "unknown",
          verification_status: "draft",
        });

        if (alurErr) {
          result.errors.push(`Alur ${row["Kode Layanan"]} ID ${alur.ID}: ${alurErr.message}`);
        } else {
          result.imported.flowSteps++;
        }
      }

      // 5. Parse Kanal Resmi
      const kanalRows = XLSX.utils.sheet_to_json<KanalRow>(workbook.Sheets["Kanal_Resmi"]!, {
        defval: null,
      });
      const kanalFiltered = kanalRows.filter((r) => r["Layanan ID"] === row["Kode Layanan"]);

      for (const kanal of kanalFiltered) {
        const { error: kanalErr } = await supabase.from("official_channels").insert({
          service_type_id: inserted!.id,
          jenis: normalizeValue(kanal.Jenis) || "",
          kontak: normalizeValue(kanal.Kontak) || "",
          url: normalizeValue(kanal.URL),
          origin: kanal["Asal Data"] || "unknown",
          verification_status: "draft",
        });

        if (kanalErr) {
          result.errors.push(`Kanal ${row["Kode Layanan"]} ID ${kanal.ID}: ${kanalErr.message}`);
        } else {
          result.imported.channels++;
        }
      }
    }

    result.success = result.errors.length === 0;
    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
    return result;
  }
}

/**
 * Validasi struktur file xlsx sebelum import.
 */
export function validateXlsxStructure(filePath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const workbook = XLSX.readFile(filePath);
    const requiredSheets = ["Layanan", "Syarat", "Catatan", "Alur", "Kanal_Resmi", "Metadata_Sumber"];

    for (const sheet of requiredSheets) {
      if (!workbook.Sheets[sheet]) {
        errors.push(`Sheet ${sheet} tidak ditemukan`);
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { valid: false, errors };
  }
}
