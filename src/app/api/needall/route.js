import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Need from '@/app/models/needs';

export async function GET() {
  await dbConnect();

  try {
    const needs = await Need.find({});
    return NextResponse.json({ success: true, data: needs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
