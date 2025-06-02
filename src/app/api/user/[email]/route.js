import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/user';

// GET /api/user/[email]
export async function GET(request, { params }) {
  await dbConnect();
  const { email } = params;
  const cleanEmail = decodeURIComponent(email).toLowerCase();

  const user = await User.findOne({ email: cleanEmail }).lean();
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }



  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST /api/user/[email]
export async function POST(request, { params }) {
  await dbConnect();

  try {
    const body = await request.json();
    const { email: paramEmail } = params;

    const cleanEmail = decodeURIComponent(paramEmail).toLowerCase();

    if (!cleanEmail) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // Optional: Validate followers/following are arrays if present
    if (body.followers && !Array.isArray(body.followers)) {
      return new Response(JSON.stringify({ error: 'Followers must be an array' }), { status: 400 });
    }
    if (body.following && !Array.isArray(body.following)) {
      return new Response(JSON.stringify({ error: 'Following must be an array' }), { status: 400 });
    }

    // Remove `email` from body just in case
    delete body.email;

    // Always update updatedAt
    const updateFields = {
      ...body,
      updatedAt: new Date(),
    };

    const updatedUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      updateFields,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }


    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in POST /api/user/[email]:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
