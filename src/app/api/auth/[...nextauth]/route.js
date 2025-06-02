import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/user';

const handler = NextAuth({
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
      await dbConnect();
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
    }
  }
});

export { handler as GET, handler as POST };
