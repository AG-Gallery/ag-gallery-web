"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type NavLinkProps = {
  href: string;
  exact?: boolean;
  className: string;
  children: React.ReactNode;
};

export function NavLink({ href, className, children }: NavLinkProps) {
  const pathname = usePathname();
  const params = useSearchParams();

  const paramsString = params.toString();
  const fullPath = pathname + (paramsString ? `?${paramsString}` : "");

  const active = fullPath === href;

  return (
    <Link
      href={href}
      className={`${active && "!text-foreground"} ${className}`}
    >
      {children}
    </Link>
  );
}
