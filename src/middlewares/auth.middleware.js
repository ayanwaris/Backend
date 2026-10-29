// ❌ FIXED: asyncHandler default export hai, isliye { } nahi lagaya
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

// ❌ FIXED: naam `verifyJWT` (pehle `veryfyJWT` tha). Use: user.router.js → logout route
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Token cookie se lo (browser) ya Authorization header se (mobile)
        // ❌ FIXED: `req.cookies` (pehle `req.cookie` tha)
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new ApiError(401, "Unauthorized Request");

        // Token asli hai? Secret wahi jo user.models.js ne use kiya
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Token ki _id se user nikalo (password aur refreshToken ke bina)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) throw new ApiError(401, "Invalid Access Token");

        // Sticker: logoutUser isi se req.user._id padhta hai
        req.user = user;
        next(); // agle function par jao
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});