import Image from "next/image";
import Link from "next/link";

import Grid from "@/components/grid";

export default function ArtistPage() {
  return (
    <>
      <h2 className="text-2xl tracking-tight lg:text-[28px]">Artist name</h2>

      <section className="animate-fade-in my-5 lg:my-14 lg:flex">
        <Image
          src="/images/artist.webp"
          alt=""
          width="1920"
          height="1080"
          className="aspect-[3/2] w-full shrink-0 object-cover grayscale-100 lg:w-64"
        />

        <article className="my-8 grid grid-cols-1 lg:my-0 lg:ml-24 lg:grid-cols-[100px_1fr]">
          <h2 className="mb-3 text-xl font-medium tracking-wide lg:mb-0 lg:text-sm">
            Biography
          </h2>

          <div className="w-full tracking-wide text-pretty lg:w-3/4 lg:text-[15px]">
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio
              neque quis ratione debitis quos dicta distinctio, reiciendis odit
              incidunt nisi enim, expedita sapiente deserunt officiis dolor
              perferendis nam deleniti quia. Sed quos sapiente error, explicabo
              assumenda nesciunt doloribus. Quas saepe obcaecati dolorum eaque
              nemo exercitationem nihil minima voluptatum. Voluptatum, provident
              porro quo ex id animi officiis quae eos, est ratione sit soluta,
              quasi repellendus laudantium libero exercitationem. Nobis,
              reprehenderit commodi. Lorem ipsum dolor sit amet, consectetur
              adipisicing elit. Quas saepe obcaecati dolorum eaque nemo
              exercitationem nihil minima voluptatum.
              <br />
              <br />
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Exercitationem sequi qui blanditiis ut odio, quas nostrum natus
              laudantium. Nisi, doloremque. Quas saepe obcaecati dolorum eaque
              nemo exercitationem nihil minima voluptatum. Eveniet rerum amet
              repudiandae doloremque non quidem. Corporis id, assumenda
              excepturi vel perferendis sunt provident. Quod minus, et ab
              voluptatibus impedit ea. Lorem ipsum dolor, sit amet consectetur
              adipisicing elit. Id tempore cupiditate voluptatem minima, quae
              nulla maiores consectetur aliquid dolorem fugiat pariatur ratione
              laudantium similique quis aspernatur quas. Saepe, numquam ipsam.
            </p>
          </div>
        </article>
      </section>

      <hr className="bg-foreground w-full" />

      <section className="my-8 lg:my-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Selected Works</h2>
          <Link
            href="/"
            className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
          >
            View all
          </Link>
        </div>

        <Grid type="artwork" />
      </section>

      <hr className="bg-foreground w-full" />

      <section className="my-8 lg:my-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Exhibitions</h2>
          <Link
            href="/"
            className="hover:text-foreground text-sm text-neutral-500 transition-colors duration-200"
          >
            View all
          </Link>
        </div>

        <Grid type="exhibit" />
      </section>
    </>
  );
}
