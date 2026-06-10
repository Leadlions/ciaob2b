import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

// Strona startowa: kieruje użytkownika do właściwego panelu wg roli.
export default async function Home() {
  const { user, profile } = await getSessionProfile();

  if (!user) redirect("/login");
  if (profile?.role === "admin") redirect("/admin");
  redirect("/panel");
}
