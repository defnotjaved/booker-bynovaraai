import { auth } from "@/auth";
import { DashboardApp } from "@/components/DashboardApp";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/dashboard/settings");
  }
  if (session.user.role !== "owner") {
    redirect("/dashboard");
  }
  return <DashboardApp view="settings" />;
}
