import type { Metadata } from "next";
export const metadata: Metadata = { title: "Compliance · NovaPay" };
export default function L({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
