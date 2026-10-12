import type { Metadata } from "next";
import { WeeklyAgenda } from "@/components/admin/schedule/weekly-agenda";

export const metadata: Metadata = {
  title: "Jadwal",
};

export default function AdminSchedulePage() {
  return <WeeklyAgenda />;
}
