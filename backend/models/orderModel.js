import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        isReviewed: {
            type: Boolean,
            default: false
        }
    }],
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'Food Processing', 'Your food is prepared', 'Out for delivery', 'Delivered', 'cancelled', 'cancellation_requested'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    payment: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    allowReview: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: ''
    },
    cancellationRequest: {
        reason: {
            type: String,
            default: null
        },
        requestedAt: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', null],
            default: null
        },
        adminResponse: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;