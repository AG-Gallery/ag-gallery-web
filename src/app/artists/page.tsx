import Link from "next/link";

const artists = [
  "Luna Voss",
  "Ignatius Hart",
  "Selene Cortez",
  "Oskar Langley",
  "Marisol Vega",
  "Jasper Whitman",
  "Zara Klein",
  "Theodore Crane",
  "Elowen Grey",
  "Caspian Rhodes",
  "Ophelia Marsh",
  "Dante Bishop",
  "Amara Sinclair",
  "Felix Rowan",
  "Isla Montague",
  "Orion Black",
];

export default function ArtistsPage() {
  return (
    <div className="animate-fade-in flex min-h-screen w-fit">
      <h2 className="text-2xl tracking-tight md:text-[28px]">Artists</h2>

      <section className="absolute right-0 left-0 mx-auto grid size-fit grid-cols-2 gap-x-16 gap-y-3 md:top-2/5 md:mt-0 md:grid-cols-4 md:gap-x-20">
        {artists.map((artist, i) => {
          return (
            <Link
              key={i}
              href={`/artists/${artist}`}
              className="group relative w-fit overflow-hidden"
            >
              {artist}
              <span className="bg-foreground absolute bottom-[0.5px] -z-10 flex h-[1.5px] w-full -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
