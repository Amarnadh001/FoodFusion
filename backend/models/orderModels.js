import mongoose from "mongoose"

// Define a schema for order items
const orderItemSchema = {
    foodId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    isReviewed: { type: Boolean, default: false }
};

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{
        type: [orderItemSchema],
        required: true
    },
    amount:{type:Number,required:true},
    address:{type:Object,required:true},
    status:{type:String,default:"Food Processing"},
    date:{type:Date,default:Date.now},
    payment:{type:Boolean,default:false},
    paymentMethod:{type:String,default:"online"},
    discount: { type: Number, default: 0 }, // Add discount field
    couponCode: { type: String }, // Add coupon code field
    allowReview: { type: Boolean, default: false }, // Add allowReview field
})

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema)
export default orderModel;