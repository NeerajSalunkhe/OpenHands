'use server'

import Razorpay from 'razorpay'
import Payment from '@/app/models/Payment'
import dbConnect from '@/app/lib/dbConnect'

export const initiate = async (amount,formData,email,keyId, keySecret) => {
    await dbConnect()
    const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    })
    const options = {
        amount: Number(amount*100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    }
    const order = await instance.orders.create(options)
    await Payment.create({
        oid: order.id,
        amount: Number(amount),
        to_email: email,
        name: formData.name,
        message: formData.message,
    })
    return order
}
