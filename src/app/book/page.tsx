import { BookingExperience } from "@/components/BookingExperience";
import { TopBar } from "@/components/TopBar";

export default function BookPage() {
  return (
    <main className="shell">
      <TopBar />
      <section className="page hero">
        <div className="hero-copy">
          <span className="eyebrow">General booking link</span>
          <h1>Book any available barber</h1>
          <p className="lead">
            Pick a time that works and IconBook assigns an available chair.
          </p>
        </div>
        <BookingExperience />
      </section>
    </main>
  );
}
