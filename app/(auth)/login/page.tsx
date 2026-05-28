import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const emailSchema = z.string().email("Email invalide");

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const raw = formData.get("email");
    const parsed = emailSchema.safeParse(raw);
    if (!parsed.success) return;

    await signIn("nodemailer", {
      email: parsed.data,
      redirectTo: "/",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-serif text-4xl font-bold">
            <span className="text-foreground">d</span>
            <span className="text-primary">ispo</span>
          </span>
          <p className="mt-3 text-foreground/60 text-sm">
            Organisez vos repas et sorties sans prise de tête.
          </p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">
            Connexion
          </h1>
          <p className="text-sm text-foreground/60 mb-6">
            Entre ton email pour recevoir un lien magique.
          </p>

          <form action={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="toi@exemple.fr"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 active:scale-[0.98] transition-all"
            >
              Envoyer le lien magique ✉️
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-foreground/40 mt-6">
          Pas de mot de passe, jamais de spam.
        </p>
      </div>
    </div>
  );
}
