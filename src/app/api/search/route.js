import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/user';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  await dbConnect();
  const users = await User.find({
    $or: [
      { email: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
    ]
  });

  return Response.json(users.map(user => ({
    email: user.email,
    username: user.username,
    profilephoto: user.profilephoto,
  })));
}
