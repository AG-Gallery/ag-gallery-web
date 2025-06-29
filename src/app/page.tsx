import ExhibitionCarousel from "@/features/home/exhibition-carousel";
import GalleryCarousel from "@/features/home/gallery-carousel";

export default function Home() {
  return (
    <>
      <GalleryCarousel />

      {/* Gallery Description */}
      <section className="mx-auto my-8 flex max-w-xl justify-center font-light md:my-10">
        <p className="tracking-wide text-pretty">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis,
          tempora. Dicta, earum ut itaque corrupti officiis blanditiis provident
          eveniet sint. Facilis ab blanditiis obcaecati deleniti nisi debitis
          fugiat pariatur ratione elit amet.
        </p>
      </section>

      {/* Current Exhibitions */}
      <section className="animate-fade-in my-8 md:my-10">
        <h2 className="mb-3 text-2xl tracking-tight">Now On View</h2>
        <ExhibitionCarousel
          imageLink="/images/exhibit-1.jpg"
          title="One Man’s Ceiling is Another Man’s Floor"
          artist="Friedrich Kunath"
          date="June 24 – July 26, 2025"
          basis="lg:basis-1/4"
        />
      </section>

      {/* Upcoming Exhibitions  */}
      <section className="animate-fade-in my-8 md:my-10">
        <h2 className="mb-3 text-2xl tracking-tight">Upcoming</h2>
        <ExhibitionCarousel
          imageLink="/images/exhibit-2.webp"
          title="Distant Islands"
          artist="Tom Anholt"
          date="November 4 – December 6, 2025"
          basis="lg:basis-1/4"
        />
      </section>
    </>
  );
}
