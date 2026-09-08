import Link from "next/link";
import type { ReactNode } from "react";
export function ButtonLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) { return <Link href={href} className={`inline-flex min-h-12 items-center justify-center px-7 text-xs font-bold uppercase tracking-[.17em] transition-colors ${light ? "bg-paper text-ink hover:bg-white" : "bg-wine text-white hover:bg-wine-dark"}`}>{children}</Link>; }
