import { BookingExperience } from "@/components/BookingExperience";
import { TopBar } from "@/components/TopBar";

export default async function BarberBookPage({
  params
}: {
  params: Promise<{ barberSlug: string }>;
}) {
  const { barberSlug } = await params;
  const name = barberSlug.charAt(0).toUpperCase() + barberSlug.slice(1);

  return (
    <main className="shell">
      <TopBar />
      <section className="page hero">
        <div className="hero-copy">
          <span className="eyebrow">Barber booking link</span>
          <h1>Book {name}</h1>
          <p className="lead">
            This link keeps the preferred-barber habit intact while still syncing
            every appointment into the shared IconBook calendar.
          </p>
        </div>
        <BookingExperience barberSlug={barberSlug} />
      </section>
    </main>
  );
}
