import { getSnapshot } from "@/lib/store";
import { LandingPage } from "@/components/landing-page";

export default function Home() {
  const { services, barbers } = getSnapshot();
  const activeBarbers = barbers
    .filter((b) => b.active)
    .map(({ id, name, slug, active }) => ({ id, name, slug, active }));

  return <LandingPage barbers={activeBarbers} services={services} />;
}
