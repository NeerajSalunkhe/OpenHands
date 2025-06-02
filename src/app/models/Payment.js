
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    name: { type: String },
    to_email: { type: String},  
    oid: { type: String, required: true },  
    message: { type: String },
    amount: { type: Number, required: true },   
    done: { type: Boolean, default: false },
  },
  { timestamps: true } 
);

const Payment = mongoose.models?.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
