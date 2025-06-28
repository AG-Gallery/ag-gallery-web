"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
};

export function NavLink({ href, exact, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname?.startsWith(href);

  return (
    <Link href={href} className={isActive ? "!text-foreground" : ""}>
      {children}
    </Link>
  );
}
