import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AdminLoginPage(){if(await getAdmin()) redirect("/admin");return <main className="grid min-h-screen place-items-center bg-ivory px-5 py-16"><div className="w-full max-w-md bg-paper p-7 shadow-sm sm:p-10"><p className="display text-center text-3xl uppercase tracking-[.12em]">Bouclescence</p><div className="mt-8 border-t border-line pt-8"><p className="eyebrow text-wine">Administration</p><h1 className="display mt-2 text-4xl">Bienvenue</h1><p className="mt-3 text-sm leading-6 text-muted">Connectez-vous avec un compte disposant du rôle administrateur.</p><LoginForm/></div></div></main>}
