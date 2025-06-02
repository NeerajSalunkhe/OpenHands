import dbConnect from '@/app/lib/dbConnect';
import Payment from '@/app/models/Payment';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  var query = searchParams.get('query') || '';

  await dbConnect();

  query=query.replace('@','%40');
//   console.log(' *****************debug  :',  query);
  const payment = await Payment.find({
    // $or: [
    //   { to_email: { $regex: query} },
    // ]
    to_email:query,
  });

  const result = payment.map(user => ({
    name: user.name,
    amount: user.amount,
    message: user.message,
  }));

  return NextResponse.json(result);
}
