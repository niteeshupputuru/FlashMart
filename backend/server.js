const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();


// =====================================================
// SETTINGS
// =====================================================

const PORT = process.env.PORT || 5001;

const FRONTEND = path.join(__dirname, "../frontend");

const MONGO_URI = process.env.MONGO_URI;


// =====================================================
// PRODUCTS
// =====================================================

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


// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema({

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
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const User = mongoose.model("User", userSchema);


// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        unique: true
    },

    customer: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        pincode: String
    },

    products: [
        {
            id: Number,
            name: String,
            price: Number,
            image: String,
            quantity: Number
        }
    ],

    // Keep items also for compatibility
    items: [
        {
            id: Number,
            name: String,
            price: Number,
            image: String,
            quantity: Number
        }
    ],

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


// =====================================================
// MONGODB CONNECTION
// =====================================================

if (!MONGO_URI) {

    console.log("❌ MONGO_URI not found in .env");

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


// =====================================================
// MIME TYPES
// =====================================================

function getContentType(filePath) {

    const ext = path.extname(filePath).toLowerCase();

    const types = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon"
    };

    return types[ext] || "application/octet-stream";
}


// =====================================================
// SEND JSON
// =====================================================

function sendJSON(res, statusCode, data) {

    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));

}


// =====================================================
// SERVE FILE
// =====================================================

function serveFile(filePath, res) {

    fs.readFile(filePath, (error, data) => {

        if (error) {

            sendJSON(res, 404, {
                error: "File not found"
            });

            return;
        }

        res.writeHead(200, {
            "Content-Type": getContentType(filePath)
        });

        res.end(data);

    });

}


// =====================================================
// READ REQUEST BODY
// =====================================================

function getRequestBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", (chunk) => {

            body += chunk;

        });

        req.on("end", () => {

            try {

                const data = body
                    ? JSON.parse(body)
                    : {};

                resolve(data);

            } catch (error) {

                reject(error);

            }

        });

        req.on("error", reject);

    });

}


// =====================================================
// SERVER
// =====================================================

const server = http.createServer(async (req, res) => {

    try {

        const fullUrl = new URL(
            req.url,
            `http://localhost:${PORT}`
        );

        const pathname = fullUrl.pathname;


        // =================================================
        // CORS
        // =================================================

        res.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );

        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type"
        );

        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, OPTIONS"
        );


        // =================================================
        // OPTIONS
        // =================================================

        if (req.method === "OPTIONS") {

            res.writeHead(204);
            res.end();

            return;

        }


        // =================================================
        // HOME
        // =================================================

        if (
            pathname === "/" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(FRONTEND, "index.html"),
                res
            );

            return;

        }


        // =================================================
        // REGISTER PAGE
        // =================================================

        if (
            pathname === "/register" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(FRONTEND, "register.html"),
                res
            );

            return;

        }


        // =================================================
        // LOGIN PAGE
        // =================================================

        if (
            pathname === "/login" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(FRONTEND, "login.html"),
                res
            );

            return;

        }


        // =================================================
        // CART PAGE
        // =================================================

        if (
            pathname === "/cart" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(FRONTEND, "cart.html"),
                res
            );

            return;

        }


        // =================================================
        // CHECKOUT PAGE
        // =================================================

        if (
            pathname === "/checkout" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(FRONTEND, "checkout.html"),
                res
            );

            return;

        }


        // =================================================
        // PRODUCT PAGE
        // =================================================

        if (
            pathname === "/product" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(FRONTEND, "product.html"),
                res
            );

            return;

        }


        // =================================================
        // API - PRODUCTS
        // =================================================

        if (
            pathname === "/api/products" &&
            req.method === "GET"
        ) {

            sendJSON(res, 200, products);

            return;

        }


        // =================================================
        // API - SINGLE PRODUCT
        // =================================================

        if (
            pathname.startsWith("/api/products/") &&
            req.method === "GET"
        ) {

            const id = Number(
                pathname.split("/").pop()
            );

            const product = products.find(
                item => item.id === id
            );

            if (!product) {

                sendJSON(res, 404, {
                    error: "Product not found"
                });

                return;

            }

            sendJSON(res, 200, product);

            return;

        }


        // =================================================
        // API - REGISTER
        // =================================================

        if (
            pathname === "/api/register" &&
            req.method === "POST"
        ) {

            const body = await getRequestBody(req);

            const name = body.name?.trim();

            const email = body.email
                ?.trim()
                .toLowerCase();

            const password = body.password;


            // Validate

            if (!name || !email || !password) {

                sendJSON(res, 400, {
                    error: "All fields are required"
                });

                return;

            }


            if (password.length < 6) {

                sendJSON(res, 400, {
                    error: "Password must be at least 6 characters"
                });

                return;

            }


            // Check existing user

            const existingUser = await User.findOne({
                email: email
            });

            if (existingUser) {

                sendJSON(res, 409, {
                    error: "Email already registered"
                });

                return;

            }


            // Hash password

            const hashedPassword = await bcrypt.hash(
                password,
                10
            );


            // Create user

            const newUser = new User({

                name: name,

                email: email,

                password: hashedPassword

            });


            await newUser.save();


            console.log(
                "New User Registered:",
                email
            );


            sendJSON(res, 201, {

                success: true,

                message: "Registration successful"

            });

            return;

        }


        // =================================================
        // API - LOGIN
        // =================================================

        if (
            pathname === "/api/login" &&
            req.method === "POST"
        ) {

            const body = await getRequestBody(req);

            const email = body.email
                ?.trim()
                .toLowerCase();

            const password = body.password;


            // Validate

            if (!email || !password) {

                sendJSON(res, 400, {
                    error: "Email and password are required"
                });

                return;

            }


            // Find user

            const user = await User.findOne({
                email: email
            });


            if (!user) {

                sendJSON(res, 401, {
                    error: "Invalid email or password"
                });

                return;

            }


            // Compare password

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                sendJSON(res, 401, {
                    error: "Invalid email or password"
                });

                return;

            }


            console.log(
                "User Login:",
                email
            );


            sendJSON(res, 200, {

                success: true,

                message: "Login successful",

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }

            });

            return;

        }


        // =================================================
        // API - CREATE ORDER
        // =================================================

        if (
            pathname === "/api/orders" &&
            req.method === "POST"
        ) {

            const body = await getRequestBody(req);


            // Customer validation

            if (
                !body.customer ||
                !body.customer.name ||
                !body.customer.email
            ) {

                sendJSON(res, 400, {

                    success: false,

                    error: "Customer details are required"

                });

                return;

            }


            // Accept products OR items

            const orderProducts =
                body.products ||
                body.items ||
                [];


            if (!orderProducts.length) {

                sendJSON(res, 400, {

                    success: false,

                    error: "Cart is empty"

                });

                return;

            }


            // Calculate total

            let total = 0;

            orderProducts.forEach(item => {

                const price =
                    Number(item.price) || 0;

                const quantity =
                    Number(item.quantity) || 1;

                total += price * quantity;

            });


            // Generate order ID

            const orderId =
                "FM" + Date.now();


            // Create order

            const newOrder = new Order({

                orderId: orderId,

                customer: {

                    name: body.customer.name,

                    email: body.customer.email,

                    phone: body.customer.phone || "",

                    address: body.customer.address || "",

                    city: body.customer.city || "",

                    pincode: body.customer.pincode || ""

                },

                products: orderProducts,

                items: orderProducts,

                total: total,

                status: "Order Placed"

            });


            // Save

            await newOrder.save();


            console.log(
                "New Order:",
                orderId
            );


            sendJSON(res, 201, {

                success: true,

                message: "Order placed successfully",

                orderId: orderId,

                total: total

            });

            return;

        }


        // =================================================
        // API - GET ALL ORDERS
        // =================================================

        if (
            pathname === "/api/orders" &&
            req.method === "GET"
        ) {

            const orders = await Order.find()
                .sort({
                    createdAt: -1
                });


            sendJSON(res, 200, orders);

            return;

        }


        // =================================================
        // FRONTEND HTML FILES
        // =================================================

        if (
            req.method === "GET"
        ) {

            const allowedFiles = [
                "index.html",
                "cart.html",
                "checkout.html",
                "product.html",
                "register.html",
                "login.html"
            ];


            const fileName =
                pathname.startsWith("/")
                    ? pathname.substring(1)
                    : pathname;


            if (allowedFiles.includes(fileName)) {

                serveFile(
                    path.join(
                        FRONTEND,
                        fileName
                    ),
                    res
                );

                return;

            }

        }


        // =================================================
        // 404
        // =================================================

        sendJSON(res, 404, {
            error: "Page not found"
        });


    } catch (error) {

        console.log(
            "SERVER ERROR:",
            error
        );


        sendJSON(res, 500, {

            success: false,

            error: "Internal server error"

        });

    }

});


// =====================================================
// START SERVER
// =====================================================

server.listen(PORT, "0.0.0.0", () => {

    console.log(
        `FlashMart running on port ${PORT}`
    );

    console.log(
        `Frontend Folder: ${FRONTEND}`
    );

});