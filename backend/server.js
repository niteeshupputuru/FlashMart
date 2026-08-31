const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();


// =====================================================
// SETTINGS
// =====================================================

const PORT = 5001;

const FRONTEND = path.join(__dirname, "../frontend");


// =====================================================
// MONGODB
// =====================================================

const MONGO_URI = process.env.MONGO_URI;


// =====================================================
// PRODUCTS
// =====================================================

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


// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true,
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

    items: [

        {

            id: Number,

            name: String,

            price: Number,

            image: String,

            quantity: Number

        }

    ],

    total: Number,

    date: {
        type: Date,
        default: Date.now
    }

});


const Order = mongoose.model(
    "Order",
    orderSchema
);


// =====================================================
// MONGODB CONNECTION
// =====================================================

if (!MONGO_URI) {

    console.log("❌ MONGO_URI not found in .env");

} else {

    mongoose
        .connect(MONGO_URI)
        .then(() => {

            console.log(
                "MongoDB Connected Successfully ✅"
            );

        })
        .catch((error) => {

            console.log(
                "MongoDB Connection Failed ❌"
            );

            console.log(
                error.message
            );

        });

}


// =====================================================
// MIME TYPES
// =====================================================

function getContentType(filePath) {

    const ext =
        path.extname(filePath).toLowerCase();

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

    return types[ext] ||
        "application/octet-stream";

}


// =====================================================
// SERVE FRONTEND FILE
// =====================================================

function serveFile(
    filePath,
    res
) {

    fs.readFile(
        filePath,
        (error, data) => {

            if (error) {

                res.writeHead(
                    404,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );

                res.end(
                    JSON.stringify({
                        error:
                            "File not found"
                    })
                );

                return;
            }


            res.writeHead(
                200,
                {
                    "Content-Type":
                        getContentType(
                            filePath
                        )
                }
            );


            res.end(data);

        }
    );

}


// =====================================================
// READ REQUEST BODY
// =====================================================

function getRequestBody(req) {

    return new Promise(
        (resolve, reject) => {

            let body = "";


            req.on(
                "data",
                (chunk) => {

                    body += chunk;

                }
            );


            req.on(
                "end",
                () => {

                    try {

                        const data =
                            body
                                ? JSON.parse(body)
                                : {};

                        resolve(data);

                    } catch (error) {

                        reject(error);

                    }

                }
            );


            req.on(
                "error",
                reject
            );

        }
    );

}


// =====================================================
// SERVER
// =====================================================

const server = http.createServer(
    async (req, res) => {


        // Remove query string

        const fullUrl =
            new URL(
                req.url,
                `http://localhost:${PORT}`
            );


        const pathname =
            fullUrl.pathname;


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
            "GET, POST, OPTIONS"
        );


        // OPTIONS

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
                path.join(
                    FRONTEND,
                    "index.html"
                ),
                res
            );

            return;

        }


        // =================================================
        // CART
        // =================================================

        if (
            pathname === "/cart" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(
                    FRONTEND,
                    "cart.html"
                ),
                res
            );

            return;

        }


        // =================================================
        // CHECKOUT
        // =================================================

        if (
            pathname === "/checkout" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(
                    FRONTEND,
                    "checkout.html"
                ),
                res
            );

            return;

        }


        // =================================================
        // PRODUCT
        // =================================================

        if (
            pathname === "/product" &&
            req.method === "GET"
        ) {

            serveFile(
                path.join(
                    FRONTEND,
                    "product.html"
                ),
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

            res.writeHead(
                200,
                {
                    "Content-Type":
                        "application/json"
                }
            );

            res.end(
                JSON.stringify(products)
            );

            return;

        }


        // =================================================
        // API - SINGLE PRODUCT
        // =================================================

        if (
            pathname.startsWith(
                "/api/products/"
            ) &&
            req.method === "GET"
        ) {

            const id =
                Number(
                    pathname.split("/").pop()
                );


            const product =
                products.find(
                    item =>
                        item.id === id
                );


            if (!product) {

                res.writeHead(
                    404,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );

                res.end(
                    JSON.stringify({
                        error:
                            "Product not found"
                    })
                );

                return;

            }


            res.writeHead(
                200,
                {
                    "Content-Type":
                        "application/json"
                }
            );

            res.end(
                JSON.stringify(product)
            );

            return;

        }


        // =================================================
        // CREATE ORDER
        // =================================================

        if (
            pathname === "/api/orders" &&
            req.method === "POST"
        ) {

            try {

                const body =
                    await getRequestBody(req);


                // Validate

                if (
                    !body.customer ||
                    !body.items ||
                    !body.items.length
                ) {

                    res.writeHead(
                        400,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );

                    res.end(
                        JSON.stringify({
                            error:
                                "Customer details and items are required"
                        })
                    );

                    return;

                }


                // Generate order ID

                const orderId =
                    "FM" +
                    Date.now();


                // Calculate total again

                let total = 0;


                body.items.forEach(
                    item => {

                        const price =
                            Number(
                                item.price
                            ) || 0;

                        const quantity =
                            Number(
                                item.quantity
                            ) || 1;

                        total +=
                            price *
                            quantity;

                    }
                );


                // Create order

                const newOrder =
                    new Order({

                        orderId:

                            orderId,

                        customer:

                            body.customer,

                        items:

                            body.items,

                        total:

                            total

                    });


                // Save MongoDB

                await newOrder.save();


                console.log(
                    "New Order:",
                    orderId
                );


                res.writeHead(
                    201,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );


                res.end(
                    JSON.stringify({

                        success:
                            true,

                        message:
                            "Order placed successfully",

                        orderId:
                            orderId,

                        total:
                            total

                    })
                );


                return;

            } catch (error) {

                console.log(
                    "ORDER ERROR:",
                    error.message
                );


                res.writeHead(
                    500,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );


                res.end(
                    JSON.stringify({

                        success:
                            false,

                        error:
                            "Order could not be placed"

                    })
                );


                return;

            }

        }


        // =================================================
        // GET ALL ORDERS
        // =================================================

        if (
            pathname === "/api/orders" &&
            req.method === "GET"
        ) {

            try {

                const orders =
                    await Order.find()
                        .sort({
                            date: -1
                        });


                res.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );


                res.end(
                    JSON.stringify(
                        orders
                    )
                );


                return;

            } catch (error) {

                res.writeHead(
                    500,
                    {
                        "Content-Type":
                            "application/json"
                    }
                );


                res.end(
                    JSON.stringify({
                        error:
                            "Could not get orders"
                    })
                );


                return;

            }

        }


        // =================================================
        // FRONTEND HTML FILES
        // =================================================

        if (
            req.method === "GET"
        ) {

            let fileName;


            if (
                pathname === "/index.html"
            ) {

                fileName =
                    "index.html";

            } else if (
                pathname === "/cart.html"
            ) {

                fileName =
                    "cart.html";

            } else if (
                pathname === "/checkout.html"
            ) {

                fileName =
                    "checkout.html";

            } else if (
                pathname === "/product.html"
            ) {

                fileName =
                    "product.html";

            }


            if (fileName) {

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

        res.writeHead(
            404,
            {
                "Content-Type":
                    "application/json"
            }
        );


        res.end(
            JSON.stringify({
                error:
                    "Page not found"
            })
        );

    }
);


// =====================================================
// START SERVER
// =====================================================

server.listen(
    PORT,
    () => {

        console.log(
            `FlashMart running on http://localhost:${PORT}`
        );

    }
);