import mongoose from 'mongoose';

const comboSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    }],
    price: {
        type: Number,
        required: true
    },
    coverImage: {
        type: String,
        default: null
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        required: false,
        default: "placeholder.jpg"
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Combo = mongoose.model('Combo', comboSchema);
export default Combo;