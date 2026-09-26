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
            type: String            
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
        return next();
    }

    // bcrypt.hash() is asynchronous,
    // so we WAIT for the hash to finish.
    this.password = await bcrypt.hash(this.password, 10);

    // Continue with the save operation
    next();
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