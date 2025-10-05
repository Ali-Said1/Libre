const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const Rating = require("./models/Rating");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());

const JWT_SECRET = "123";

// Connect Mongo
mongoose.connect("mongodb://127.0.0.1:27017/libre", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error:", err));

// ===================== AUTH =====================

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        return false;
    }
    return true;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return false;
    }
    return true;
}
function validatePassword(pass) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/
    //Makes sure that the password is at least 8 characters long, contains one uppercase, one special char and one number.
    if (!passwordRegex.test(pass)) {
        return false;
    }
    return true;
}

// Signup
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    if (!validateUsername(username)) {
        return res.status(400).json({ error: "Invalid username" });
    }
    if (!validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email" });
    }
    if (!validatePassword(password)) {
        return res.status(400).json({ error: "Invalid password" });
    }

    const hashed = await bcrypt.hash(password, 10);


    try {
        const user = await User.create({ username, email, password: hashed });
        res.json({ message: "User created", userId: user._id });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: "Email or Username already exists" });
        } else {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    }
});

// Login
app.post("/login", async (req, res) => {
    const { username, password, remember } = req.body;
    const user = await User.findOne({ username });
    console.log(user)
    if (!user) return res.status(400).json({ error: "User not found" });

    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "24h" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        ...(remember ? { maxAge: 24 * 60 * 60 * 1000 } : {})
    });

    res.json({ message: "Login successful" });
});

app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
});

app.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


app.patch("/changepassword", auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        const isPassValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPassValid) return res.status(401).json({ error: "Wrong Old Password" })
        if (!validatePassword(newPassword)) {
            return res.status(400).json({ error: "Invalid password" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
})
// Middleware to check JWT
function auth(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// ===================== CART =====================

// Get user cart
app.get("/cart", auth, async (req, res) => {
    const user = await User.findById(req.userId);
    res.json(user.cart);
});

// Add item to cart
app.post("/cart", auth, async (req, res) => {
    const { productId, } = req.body;
    const user = await User.findById(req.userId);

    // Check if item already exists
    const item = user.cart.find(i => i.productId === productId);
    if (item) {
        item.quantity++;
    } else {
        user.cart.push({ productId });
    }

    await user.save();
    res.status(200).json(user.cart);
});

// Remove qunatity of an item from cart
app.patch("/cart", auth, async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.userId);
    const item = user.cart.find(i => i.productId === productId);
    if (item) {
        if (item.quantity === 1)
            return res.status(400).json({ error: "Cannot decrease quantity below 1" });
        item.quantity--;
        if (item.quantity === 0) {
            user.cart = user.cart.filter(i => i.productId !== productId);
        }
        await user.save();
    }

    res.json(user.cart);
});

app.delete("/cart", auth, async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.userId);

    user.cart = user.cart.filter(i => i.productId !== productId);
    await user.save();

    res.json(user.cart);
});

// rating
app.post("/rate", auth, async (req, res) => {
    const { productId, rating } = req.body;

    // Check if user already rated this product
    let existing = await Rating.findOne({ userId: req.userId, productId });

    if (existing) {
        existing.rating = rating; // update rating
        await existing.save();
    } else {
        existing = await Rating.create({ userId: req.userId, productId, rating });
    }

    res.json(existing);
});

app.delete("/rate", auth, async (req, res) => {
    const { productId } = req.body;

    try {
        const deleted = await Rating.findOneAndDelete({ userId: req.userId, productId });

        if (!deleted) {
            return res.status(404).json({ error: "No rating found to delete" });
        }

        res.json({ message: "Rating removed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/rate/:productId", async (req, res) => {
    const { productId } = req.params;

    const ratings = await Rating.find({ productId });
    if (ratings.length === 0) return res.json({ average: 0, count: 0 });

    const avg =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    res.json({ average: avg, count: ratings.length });
});

app.get("/rate/user/:productId", auth, async (req, res) => {
    const { productId } = req.params;

    const rating = await Rating.findOne({ userId: req.userId, productId });
    if (!rating) return res.json({ rating: 0 });

    res.json({ rating: rating.rating });
});

// wishlist
app.post("/wishlist", auth, async (req, res) => {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Product ID required" });

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        console.log(user)
        console.log(productId)
        // prevent duplicates
        if (user.wishlist.some(item => item.productId === productId)) {
            return res.status(400).json({ error: "Already in wishlist" });
        }

        user.wishlist.push({ productId });
        await user.save();

        res.json({ message: "Added to wishlist", wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/wishlist", auth, async (req, res) => {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Product ID required" });

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.wishlist.some(item => item.productId === productId)) {
            return res.status(400).json({ error: "Doesn't exist in wishlist" });
        }

        user.wishlist = user.wishlist.filter(item => item.productId !== productId)

        await user.save();

        res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/wishlist", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("wishlist");
        if (!user) return res.status(404).json({ error: "User not found" });
        const wishlistReturn = user.wishlist.map(item => item.productId)
        res.json(wishlistReturn);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// app.get("/wishlist/user", auth, async (req, res) => {
//     const { productId, } = req.body;
//     const user = await User.findById(req.userId);

//     // Check if item already exists
//     const item = user.wishlist.find(i => i.productId === productId);
//     if (item) {
//         res.status(200).json(true)
//     } else {
//         res.status(404).json(false)
//     };
// });
app.listen(5000, () => console.log("Server running on http://localhost:5000"));

