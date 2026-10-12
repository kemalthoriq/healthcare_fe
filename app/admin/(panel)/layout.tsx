import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
