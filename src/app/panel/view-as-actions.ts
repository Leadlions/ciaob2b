"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { VIEW_AS_COOKIE } from "@/lib/view-as";

export async function setViewAs(formData: FormData) {
  const { profile } = await getSessionProfile();
  if (profile?.role !== "admin") return;

  const id = String(formData.get("client_id") || "");
  const store = await cookies();
  if (id) {
    store.set(VIEW_AS_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  } else {
    store.delete(VIEW_AS_COOKIE);
  }
  redirect("/panel");
}

export async function exitViewAs() {
  const store = await cookies();
  store.delete(VIEW_AS_COOKIE);
  redirect("/admin");
}
