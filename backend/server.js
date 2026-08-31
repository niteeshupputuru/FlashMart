const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// ======================================================
// SETTINGS
// ======================================================

const PORT = process.env.PORT || 5001;

const FRONTEND = path.join(__dirname, "../frontend");

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(FRONTEND));

// ======================================================
// MONGODB CONNECTION
// ======================================================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.log("❌ MONGO_URI is missing in .env");
} else {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB Connected Successfully ✅");
        })
        .catch((error) => {
            console.log("MongoDB Connection Failed ❌");
            console.log(error.message);
        });
}

// ======================================================
// PRODUCT DATA
// ======================================================

const products = [
    {
        id: 1,
        name: "Premium T-Shirt",
        price: 599,
        image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        description:
            "Comfortable premium cotton T-Shirt for everyday use."
    },

    {
        id: 2,
        name: "Stylish Shoes",
        price: 1299,
        image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        description:
            "Comfortable and stylish shoes for daily running and walking."
    },

    {
        id: 3,
        name: "Smart Watch",
        price: 1999,
        image:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        description:
            "Smart fitness watch with modern features."
    },

    {
        id: 4,
        name: "Backpack",
        price: 899,
        image:
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        description:
            "Durable backpack for college, office and travel."
    }
];

// ======================================================
// USER MODEL
// ======================================================

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

// ======================================================
// ORDER MODEL
// ======================================================

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },

        customer: {
            name: {
                type: String,
                required: true
            },

            email: {
                type: String,
                required: true
            },

            phone: {
                type: String,
                required: true
            },

            address: {
                type: String,
                required: true
            }
        },

        paymentMethod: {
            type: String,
            default: "Cash on Delivery"
        },

        items: {
            type: Array,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND, "index.html"));
});

// ======================================================
// FRONTEND ROUTES
// ======================================================

app.get("/cart", (req, res) => {
    res.sendFile(path.join(FRONTEND, "cart.html"));
});

app.get("/checkout", (req, res) => {
    res.sendFile(path.join(FRONTEND, "checkout.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(FRONTEND, "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(FRONTEND, "register.html"));
});

app.get("/product", (req, res) => {
    res.sendFile(path.join(FRONTEND, "product.html"));
});

// ======================================================
// PRODUCTS API
// ======================================================

// Get all products
app.get("/api/products", (req, res) => {
    res.json(products);
});

// Get single product
app.get("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);

    const product = products.find((item) => item.id === id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    res.json(product);
});

// ======================================================
// REGISTER API
// ======================================================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Registration successful"
        });

    } catch (error) {
        console.log("Register Error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});

// ======================================================
// LOGIN API
// ======================================================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

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
        console.log("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

// ======================================================
// CREATE ORDER
// ======================================================

app.post("/api/orders", async (req, res) => {
    try {
        const {
            customer,
            paymentMethod,
            items,
            totalAmount
        } = req.body;

        // Validate customer
        if (
            !customer ||
            !customer.name ||
            !customer.email ||
            !customer.phone ||
            !customer.address
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter all customer details"
            });
        }

        // Validate cart
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Validate amount
        if (
            totalAmount === undefined ||
            totalAmount === null ||
            Number(totalAmount) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid total amount"
            });
        }

        // Generate order ID
        const orderId =
            "FM" +
            Date.now() +
            Math.floor(Math.random() * 1000);

        // Create order
        const order = new Order({
            orderId,
            customer,
            paymentMethod:
                paymentMethod || "Cash on Delivery",
            items,
            totalAmount: Number(totalAmount)
        });

        // Save order
        await order.save();

        console.log("================================");
        console.log("NEW ORDER");
        console.log("Order ID:", orderId);
        console.log("Customer:", customer.name);
        console.log("Total:", totalAmount);
        console.log("================================");

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId,
            totalAmount: Number(totalAmount)
        });

    } catch (error) {
        console.log("Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to place order"
        });
    }
});

// ======================================================
// GET ALL ORDERS
// ======================================================

app.get("/api/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.log("Get Orders Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get orders"
        });
    }
});

// ======================================================
// GET SINGLE ORDER
// ======================================================

app.get("/api/orders/:orderId", async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.log("Order Fetch Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch order"
        });
    }
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "FlashMart backend is running",
        mongodb:
            mongoose.connection.readyState === 1
                ? "connected"
                : "disconnected"
    });
});

// ======================================================
// 404 API
// ======================================================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// ======================================================
// START SERVER
// ======================================================
app.get("/admin", (req, res) => {
    res.sendFile(path.join(FRONTEND, "admin.html"));
});
app.listen(PORT, () => {
    console.log("========================================");
    console.log("FLASHMART BACKEND STARTED 🚀");
    console.log("Server running on port:", PORT);
    console.log("Frontend folder:", FRONTEND);
    console.log("========================================");
});