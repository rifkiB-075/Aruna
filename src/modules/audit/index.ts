export type AuditAction =
  | "source.upload" | "source.approve" | "source.reject" | "source.activate" | "source.deactivate"
  | "content.approve" | "content.reject" | "role.change" | "admin.login";

export interface AuditEntry {
  actorId: string;
  action: AuditAction;
  objectType: string;
  objectId: string;
  summary?: string;
}

/** Audit log append-only. Implementasikan penulisan di sisi server. */
export async function writeAudit(_entry: AuditEntry): Promise<void> {
  void _entry;
  throw new Error("writeAudit belum diimplementasikan");
}
