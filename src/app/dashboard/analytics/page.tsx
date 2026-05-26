import { auth } from "@/auth";
import { DashboardApp } from "@/components/DashboardApp";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/dashboard/analytics");
  }
  if (session.user.role !== "owner") {
    redirect("/dashboard");
  }
  return <DashboardApp view="analytics" />;
}
