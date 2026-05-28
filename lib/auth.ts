import NextAuth from "next-auth";
import Email from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { getAvatarColorIndex } from "@/lib/avatar-colors";

function buildAdapter() {
  const adapter = PrismaAdapter(db);
  const originalCreate = adapter.createUser!.bind(adapter);
  adapter.createUser = async (user) => {
    const name = (user.email as string).split("@")[0];
    const avatarColor = getAvatarColorIndex(user.email as string);
    return originalCreate({ ...user, name, avatarColor } as Parameters<typeof originalCreate>[0]);
  };
  return adapter;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: buildAdapter(),
  session: { strategy: "jwt" },
  providers: [
    Email({
      server: "smtp://localhost:1025",
      from: "Dispo <noreply@dispo.app>",
      sendVerificationRequest: async ({ identifier, url }) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("\n🔗 Magic link pour", identifier, ":\n", url, "\n");
          return;
        }
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Dispo <noreply@dispo.app>",
          to: identifier,
          subject: "Ton lien de connexion Dispo",
          html: `<p>Clique sur ce lien pour te connecter : <a href="${url}">${url}</a></p>`,
        });
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
});
