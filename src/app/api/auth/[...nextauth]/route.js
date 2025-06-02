import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/user";

// 1) Create the “pure” NextAuth handler (synchronous export)
const nextAuthHandler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // 2) By the time this runs, dbConnect() has already been called in the wrapper below
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = new User({
          email: user.email,
          username: user.email.split("@")[0],
          profilephoto: user.image,
        });
        await newUser.save();
        user.name = newUser.username;
      } else {
        user.name = existingUser.username;
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// 3) Wrap it in an async function so that the database is connected before NextAuth runs:
async function handler(request, response) {
  await dbConnect();
  return nextAuthHandler(request, response);
}

// 4) Export named handlers (no top-level await or TypeScript syntax):
export { handler as GET, handler as POST };
