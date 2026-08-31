const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5001;


/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());
app.use(express.json());


/* =========================================
   MONGODB
========================================= */

const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {

    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB Connected Successfully ✅");
        })
        .catch((error) => {
            console.log("MongoDB Connection Error ❌");
            console.log(error.message);
        });

} else {

    console.log("MONGO_URI not found in .env ⚠️");

}


/* =========================================
   USER MODEL
========================================= */

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
    }

});


const User = mongoose.model("User", userSchema);


/* =========================================
   PRODUCTS
========================================= */

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


/* =========================================
   HOME
========================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );

});


/* =========================================
   PRODUCTS API
========================================= */

app.get("/api/products", (req, res) => {

    res.json(products);

});


/* =========================================
   REGISTER
========================================= */

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });


        if (existingUser) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = new User({

            name: name,

            email: email.toLowerCase(),

            password: hashedPassword

        });


        await user.save();


        res.status(201).json({

            success: true,

            message: "Registration successful"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Registration failed"

        });

    }

});


/* =========================================
   LOGIN
========================================= */

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message: "Email and password are required"

            });

        }


        const user = await User.findOne({

            email: email.toLowerCase()

        });


        if (!user) {

            return res.status(401).json({

                message: "Invalid email or password"

            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

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

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Login failed"

        });

    }

});


/* =========================================
   FRONTEND FILES
========================================= */

const frontendPath =
    path.join(__dirname, "../frontend");


app.use(express.static(frontendPath));


/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {

    console.log(
        `FlashMart running on port ${PORT} 🚀`
    );

    console.log(
        `Frontend folder: ${frontendPath}`
    );

});