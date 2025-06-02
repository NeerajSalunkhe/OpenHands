import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Need from '@/app/models/needs';

// POST — Create a new need
export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        body.email = body.email.replace(/%40/g, '@');
        const need = await Need.create(body);
        if (Number(need.collected_amount) >= Number(need.amount)) {
            await Need.findByIdAndDelete(need._id);
            return NextResponse.json({
                success: true,
                message: 'Need was created and deleted immediately as it was already fulfilled.',
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: need }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

// GET — Get need by email and key
// GET — Get need by email and key, then delete it
export async function GET(request, { params }) {
    await dbConnect();

    try {
        const { email } = params;
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json(
                { success: false, message: 'Key query parameter is required' },
                { status: 400 }
            );
        }

        const decodedEmail = decodeURIComponent(email);
        const need = await Need.findOne({ email: decodedEmail, key: key });

        if (!need) {
            return NextResponse.json(
                { success: false, message: 'Need not found' },
                { status: 404 }
            );
        }

        // Store a copy of the need to return after deletion
        const needToReturn = { ...need._doc };

        // Delete the need after fetching
        await Need.findByIdAndDelete(need._id);

        return NextResponse.json({ success: true, data: needToReturn }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

