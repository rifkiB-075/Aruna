import { requireRole } from "@/modules/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["editor", "reviewer", "super_admin"]);
  return <div>{children}</div>;
}
