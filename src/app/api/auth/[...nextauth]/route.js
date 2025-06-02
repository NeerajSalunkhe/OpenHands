import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/user';

// Connect to Mongo once at startup (not on every signIn)
await dbConnect();

const authOptions = {
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
      if (!user.email) {
        // If they somehow don't have an email, deny sign-in
        return false;
      }
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = new User({
          email: user.email,
          username: user.email.split('@')[0],
          profilephoto: user.image,
        });
        await newUser.save();
        user.name = newUser.username;
      } else {
        user.name = existingUser.username;
      }
      return true;
    },
    async session({ session, token }) {
      // Override the session name to whatever we stored
      session.user.name = token.name;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // make sure this is set in production
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
