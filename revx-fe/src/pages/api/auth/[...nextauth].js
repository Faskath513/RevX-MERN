import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter your username" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            username: credentials.username,
            password: credentials.password,
          });

          const { data } = response;

          if (data?.token && data?.id && data?.username && data?.role) {
            return {
              id: data.id,
              username: data.username,
              role: data.role,
              token: data.token,
              roleDetails: data.roleDetails || {},
            };
          }

          throw new Error("Invalid credentials");
        } catch (error) {
          console.error("Authorization error:", error.response?.data || error.message);
          throw new Error(error.response?.data?.message || "Login failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.token = user.token;
        token.roleDetails = user.roleDetails || {};
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.token = token.token;
      session.user.roleDetails = token.roleDetails || {};
      return session;
    },

    // Check the user role on redirect
    async redirect({ url, baseUrl, user }) {
      // Explicitly handle role-based redirection
      if (user?.role === "hr") {
        return `${baseUrl}/hr`; // Redirect HR users to HR dashboard
      } else if (user?.role === "manager") {
        return `${baseUrl}/manager`; // Redirect Manager users to Manager dashboard
      } else {
        return `${baseUrl}/employee`; // Default to Employee dashboard
      }
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Optional error page for failed login
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  debug: process.env.NODE_ENV === "development",
});
