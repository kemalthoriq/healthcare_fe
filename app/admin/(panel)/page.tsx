import type { Metadata } from "next";
import { DashboardWelcome } from "@/components/admin/dashboard-welcome";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return <DashboardWelcome />;
}
