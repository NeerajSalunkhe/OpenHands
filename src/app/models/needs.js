
import mongoose from 'mongoose';

const Needschema = new mongoose.Schema(
  {
    key:{type:String,required:true},
    name: { type: String ,required:true},
    email: { type: String ,required:true},    
    message: { type: String,required:true},
    amount: { type: Number, required: true},
    collected_amount :{ type: Number},
    supporters: { type: [String], default: [] },
  }
);

const Need = mongoose.models?.Need || mongoose.model('Need', Needschema);
export default Need;
