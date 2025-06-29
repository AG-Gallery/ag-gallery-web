import type { ReactNode } from "react";

import Image from "next/image";

type GridProps = {
  type: "artwork" | "exhibit";
};

export default function Grid({ type }: GridProps) {
  let description: ReactNode;

  if (type === "artwork") {
    description = (
      <>
        <h3>Artist</h3>
        <h4>
          <em className="">Artwork title</em>, 2025
        </h4>
      </>
    );
  }

  if (type === "exhibit") {
    description = (
      <>
        <h4>
          <em className="font-normal">Exhibit title</em>
        </h4>
        <p>Artist</p>
        <time className="text-sm tracking-wide lg:text-xs">Date</time>
      </>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: 8 }).map((_, i) => {
        return (
          <div key={i}>
            <Image
              src={
                type === "artwork"
                  ? "/images/exhibit-1.jpg"
                  : "/images/exhibit-2.webp"
              }
              alt="Artist's exhibit"
              width="1920"
              height="1080"
              className="aspect-[5/4] object-cover"
            />

            <div className="mt-2 text-sm font-light">{description}</div>
          </div>
        );
      })}
    </div>
  );
}
