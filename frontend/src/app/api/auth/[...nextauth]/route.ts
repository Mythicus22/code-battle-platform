import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import axios from "axios";

// This bridges NextAuth with our Custom Backend
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock',
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'mock',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock',
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await axios.post(`${API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });
          
          if (res.data?.user) {
             const user = res.data.user;
             // Must map to standard NextAuth interface
             return {
               id: user.id,
               name: user.username,
               email: user.email,
               accessToken: res.data.token,
               trophies: user.trophies || 1000
             };
          }
          return null;
        } catch (error: any) {
          throw new Error(error.response?.data?.error || "Invalid credentials");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // If Logging in via Provider (Google/Github), we must hit our backend bridge
      if (account && user) {
         if (account.provider === 'google' || account.provider === 'github') {
            try {
               const res = await axios.post(`${API_URL}/auth/oauth`, {
                  email: user.email,
                  name: user.name,
                  provider: account.provider,
                  providerId: account.providerAccountId
               });
               token.accessToken = res.data.token;
               token.id = res.data.user.id;
               token.username = res.data.user.username;
               token.trophies = res.data.user.trophies;
            } catch (err) {
               console.error("OAuth Backend Sync Error", err);
            }
         } else {
            // Standard credentials
            token.accessToken = user.accessToken;
            token.id = user.id;
            token.username = user.name;
            token.trophies = (user as any).trophies;
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).trophies = token.trophies;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET || "code_battle_secret_key"
});

export { handler as GET, handler as POST };
