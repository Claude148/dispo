import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <span className="text-5xl mb-6 block">✉️</span>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
          Vérifie tes emails
        </h1>
        <p className="text-foreground/60 text-sm mb-2">
          On t'a envoyé un lien magique. Clique dessus pour te connecter.
        </p>
        <p className="text-foreground/40 text-xs mb-8">
          (En développement, le lien apparaît dans la console du serveur.)
        </p>
        <Link
          href="/login"
          className="text-sm text-primary hover:underline"
        >
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
