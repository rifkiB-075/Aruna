import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Importer idempoten untuk aruna_data_layanan_draf.xlsx.
 * Aturan: semua draf, skip CONTOH, skip unavailable, `-` → null, preserve sub-kategori.
 * ponytail: validasi Metadata_Sumber lengkap, pisahkan catatan dari checklist, test coverage.
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

/**
 * Import data dari file xlsx ke database (status draft).
 */
export async function importDataLayanan(
  supabase: SupabaseClient,
  filePath: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: {
      serviceTypes: 0,
      requirements: 0,
      notes: 0,
      flowSteps: 0,
      channels: 0,
    },
    skipped: 0,
    errors: [],
  };

  try {
    // 1. Baca file
    const workbook = XLSX.readFile(filePath);

    // 2. Import service types (skip unavailable)
    const serviceTypesSheet = workbook.Sheets["Layanan"];
    if (!serviceTypesSheet) {
      result.errors.push("Sheet Layanan tidak ditemukan");
      return result;
    }

    // ponytail: parse sheet, insert ke service_types, skip unavailable, handle `-` → null
    // ponytail: import Syarat, Catatan, Alur, Kanal_Resmi ke tabel detail
    // ponytail: validasi Metadata_Sumber lengkap sebelum izinkan aktivasi

    result.success = true;
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
