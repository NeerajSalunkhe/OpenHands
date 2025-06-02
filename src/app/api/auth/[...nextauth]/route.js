// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/user";

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

      // By the time this runs, dbConnect() has already been awaited in handler()
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
  debug: true, // <-- enable NextAuth’s verbose logging
  secret: process.env.NEXTAUTH_SECRET,
});

async function handler(request, response) {
  // 1) Ensure Mongo is connected before NextAuth handlers run
  await dbConnect();

  // 2) Call the actual NextAuth handler
  return nextAuthHandler(request, response);
}

export { handler as GET, handler as POST };
