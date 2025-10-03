const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
    productId: String,
    quantity: { type: Number, default: 1 }
});

const WishlistItemSchema = new mongoose.Schema({
    productId: String,
    addedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    date_joined: Number,
    cart: [CartItemSchema],
    wishlist: [WishlistItemSchema]
});

const RatingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: String,
    rating: { type: Number, min: 1, max: 5 }
});


module.exports = mongoose.model("User", UserSchema);
module.exports = mongoose.model("Rating", RatingSchema);
