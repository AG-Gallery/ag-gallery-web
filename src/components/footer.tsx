import Link from "next/link";

export default function Footer() {
  return (
    <footer className="pt-20 pb-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[15px]">AG Gallery</h4>

        <div className="ml-auto flex items-center justify-end gap-6 text-sm text-neutral-600">
          <Link
            href="/"
            target="_blank"
            className="transition-colors duration-200 hover:text-black"
          >
            Facebook
          </Link>
          <Link
            href="/"
            target="_blank"
            className="transition-colors duration-200 hover:text-black"
          >
            Instagram
          </Link>
        </div>
      </div>
    </footer>
  );
}
