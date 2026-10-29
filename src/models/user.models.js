import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,              
            index: true              
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true               
        },

        fullName: {
            type: String,
            required: true,
            trim: true               
        },
        avatar: {
            type: String,
            required: true           
        },

        coverImage: {
            type: String
        },

        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        password: {
            type: String,
            required: [true, "Password is required"] 
        },

        refreshToken: {
            type: String            
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// PASSWORD HASHING
// ======================================================

userSchema.pre("save", async function (next) {

    // If password has not been changed,
    // don't hash it again.
    if (!this.isModified("password")) {
        return;
    }

    // bcrypt.hash() is asynchronous,
    // so we WAIT for the hash to finish.
    this.password = await bcrypt.hash(this.password, 10);

    // Continue with the save operation
    // next();

    // in the version 9 the next work is done now and you did'nt have to manually  add next() it will automatically return after the function is done working

});


// ======================================================
// CHECK PASSWORD
// ======================================================

userSchema.methods.isPasswordCorrect = async function (password) {

    return await bcrypt.compare(
        password,
        this.password
    );
};


// ======================================================
// GENERATE ACCESS TOKEN
// ======================================================

userSchema.methods.generateAccessToken = function () {

    return jwt.sign(
        {
            _id: this._id,           
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },

        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};


// ======================================================
// GENERATE REFRESH TOKEN
// ======================================================

userSchema.methods.generateRefreshToken = function () {

    return jwt.sign(
        {
            _id: this._id          
        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};


// ======================================================
// CREATE USER MODEL
// ======================================================

export const User = mongoose.model("User", userSchema);















































// import mongoose, { Schema } from "mongoose";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// const userSchema = new Schema(
//     {
//         username: { type: String, required: true, lowercase: true, unique: true, trim: true, index: true },
//         email: { type: String, required: true, lowercase: true, unique: true, trim: true },
//         fullName: { type: String, required: true, trim: true },
//         avatar: { type: String, required: true },
//         coverImage: { type: String },
//         watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
//         password: { type: String, required: [true, "Password is required"] },
//         refreshToken: { type: String }, // login mein save hota hai, logout mein khaali
//     },
//     { timestamps: true }
// );

// // Save se pehle password hash karo (sirf tab jab password badla ho)
// // ❌ FIXED: `return next()` hataya, Mongoose 9 mein async hook ko next nahi milta
// userSchema.pre("save", async function () {
//     if (!this.isModified("password")) return;
//     this.password = await bcrypt.hash(this.password, 10);
// });

// // Password match karta hai. Use: controller → loginUser
// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password);
// };

// // Short life token (ticket). Verify hota hai: auth.middleware.js
// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//         { _id: this._id, email: this.email, username: this.username, fullName: this.fullName },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
//     );
// };

// // Long life token (membership card). Database mein save hota hai
// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign(
//         { _id: this._id },
//         process.env.REFRESH_TOKEN_SECRET,
//         { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
//     );
// };

// // Capital User yahin se banta hai, controller aur middleware isko import karte hain
// export const User = mongoose.model("User", userSchema);