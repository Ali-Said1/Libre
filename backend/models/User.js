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
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    date_joined: { type: Date, default: Date.now },
    cart: [CartItemSchema],
    wishlist: [WishlistItemSchema]
});


module.exports = mongoose.model("User", UserSchema);
