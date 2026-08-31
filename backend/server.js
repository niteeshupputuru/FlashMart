const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();

const app = express();

// ==========================================
// SETTINGS
// ==========================================

const PORT = process.env.PORT || 5001;

const FRONTEND = path.join(__dirname, "../frontend");

const MONGO_URI = process.env.MONGO_URI;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(express.static(FRONTEND));


// ==========================================
// PRODUCTS
// ==========================================

const products = [
    {
        id: 1,
        name: "Premium T-Shirt",
        price: 599,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        description: "Comfortable premium cotton T-Shirt for everyday use."
    },
    {
        id: 2,
        name: "Stylish Shoes",
        price: 1299,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        description: "Comfortable and stylish shoes for daily running and walking."
    },
    {
        id: 3,
        name: "Smart Watch",
        price: 1999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        description: "Smart fitness watch with modern features."
    },
    {
        id: 4,
        name: "Backpack",
        price: 899,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        description: "Durable backpack for college, office and travel."
    }
];


// ==========================================
// PRODUCT API
// ==========================================

app.get("/api/products", (req, res) => {
    res.json(products);
});


// ==========================================
// SINGLE PRODUCT
// ==========================================

app.get("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    res.json(product);
});


// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", userSchema);


// ==========================================
// ORDER SCHEMA
// ==========================================

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },

    customer: {
        type: Object,
        required: true
    },

    products: {
        type: Array,
        required: true
    },

    items: {
        type: Array,
        default: []
    },

    total: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "Order Placed"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model("Order", orderSchema);


// ==========================================
// REGISTER
// ==========================================

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        console.log("New User Registered:", email);

        res.json({
            success: true,
            message: "Registration successful"
        });

    } catch (error) {

        console.error("Register Error:", error);

        res.status(500).json({
            error: "Registration failed"
        });
    }
});


// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        console.log("User Login:", email);

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            error: "Login failed"
        });
    }
});


// ==========================================
// CREATE ORDER
// ==========================================

app.post("/api/orders", async (req, res) => {

    try {

        const {
            customer,
            products,
            items,
            total
        } = req.body;

        if (!customer || !products || total === undefined) {
            return res.status(400).json({
                error: "Order details are missing"
            });
        }

        const orderId =
            "FM" +
            Date.now();

        const order = new Order({

            orderId,

            customer,

            products,

            items: items || products,

            total,

            status: "Order Placed"
        });

        await order.save();

        console.log("New Order:", orderId);

        res.json({
            success: true,
            message: "Order placed successfully",
            orderId: orderId,
            total: total
        });

    } catch (error) {

        console.error("Order Error:", error);

        res.status(500).json({
            error: "Order processing failed"
        });
    }
});


// ==========================================
// GET ORDERS
// ==========================================

app.get("/api/orders", async (req, res) => {

    try {

        const orders = await Order
            .find()
            .sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {

        console.error("Orders Error:", error);

        res.status(500).json({
            error: "Could not fetch orders"
        });
    }
});


// ==========================================
// FRONTEND ROUTES
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(FRONTEND, "index.html")
    );

});

app.get("/index.html", (req, res) => {

    res.sendFile(
        path.join(FRONTEND, "index.html")
    );

});

app.get("/product", (req, res) => {

    res.sendFile(
        path.join(FRONTEND, "product.html")
    );

});

app.get("/cart", (req, res) => {

    res.sendFile(
        path.join(FRONTEND, "cart.html")
    );

});

app.get("/checkout", (req, res) => {

    res.sendFile(
        path.join(FRONTEND, "checkout.html")
    );

});

app.get("/login", (req, res) => {

    res.sendFile(
        path.join(FRONTEND, "login.html")
    );

});

app.get("/register", (req, res) => {

    res.sendFile(
        path.join(FRONTEND, "register.html")
    );

});


// ==========================================
// START SERVER
// ==========================================

async function startServer() {

    try {

        if (MONGO_URI) {

            await mongoose.connect(MONGO_URI);

            console.log(
                "MongoDB Connected Successfully ✅"
            );

        } else {

            console.log(
                "MongoDB URI not found"
            );

        }

        app.listen(PORT, "0.0.0.0", () => {

            console.log(
                `FlashMart running on port ${PORT} 🚀`
            );

            console.log(
                `Frontend Folder: ${FRONTEND}`
            );

        });

    } catch (error) {

        console.error(
            "Server Startup Error:",
            error
        );

    }
}

startServer();