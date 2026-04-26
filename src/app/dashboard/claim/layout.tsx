import type { Metadata } from "next";
export const metadata: Metadata = { title: "Claim Links · NovaPay" };
export default function L({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
