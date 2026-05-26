import { getSnapshot } from "@/lib/store";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const { services, barbers } = await getSnapshot();
  const activeBarbers = barbers
    .filter((b) => b.active)
    .map(({ id, name, slug, active }: { id: string; name: string; slug: string; active: boolean }) => ({ id, name, slug, active }));

  return <LandingPage barbers={activeBarbers} services={services} />;
}
