import { getServerSession, type NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

type Provider = NextAuthOptions['providers'][number];

const providers: Provider[] = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(GitHubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET }));
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
}

/** Sign-in options shown on the sign-in page. Only providers with credentials are listed. */
export const enabledProviders = providers.map((provider) => ({ id: provider.id, name: provider.name }));

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  // JWT sessions keep sign-in independent of the database; roasts are stored in Supabase.
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: '/signin', error: '/signin' },
  callbacks: {
    jwt({ token, account }) {
      // A stable, provider-scoped id ("github:12345") survives email or name changes.
      if (account) token.uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.uid) session.user.id = token.uid;
      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}
