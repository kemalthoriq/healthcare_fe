import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Panel Admin",
    template: "%s · Panel Admin Lumière",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
