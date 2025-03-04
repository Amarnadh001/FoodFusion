import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    address:{type:Object,required:true},
    status:{type:String,default:"Food Processing"},
    date:{type:Date,default:Date.now()},
    payment:{type:Boolean,default:false},
    discount: { type: Number, default: 0 }, // Add discount field
    couponCode: { type: String }, // Add coupon code field
})

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema)
export default orderModel;