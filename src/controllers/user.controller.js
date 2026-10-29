import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"; // capital User = database se baat karne wala
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Claudinary.js";

// Cookie safety: JS se chhoo nahi sakte + sirf HTTPS
const cookieOptions = { httpOnly: true, secure: true };

// Dono tokens banao aur refreshToken database mein save karo. Use: loginUser
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // ❌ FIXED: `User` (capital), pehle `user.findById` likha tha
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();   // method: user.models.js
        const refreshToken = user.generateRefreshToken(); // method: user.models.js

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // baaki fields check mat karo

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

// REGISTER (isme koi galti nahi thi)
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }
    if (!email.includes("@")) {
        throw new ApiError(400, "Please enter a valid email");
    }

    const lowerCaseUsername = username.toLowerCase();

    const existedUser = await User.findOne({
        $or: [{ username: lowerCaseUsername }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // req.files multer se aata hai
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage;
    if (coverImageLocalPath) coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) throw new ApiError(400, "Avatar file is required");

    // Password yahan hash hota hai (user.models.js → pre("save"))
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: lowerCaseUsername,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// LOGIN
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // ❌ FIXED: dono missing ho tabhi error (pehle `!username || !email` tha, to dono maangta tha)
    if (!(username || email)) throw new ApiError(400, "email or username is required");
    if (!password) throw new ApiError(400, "password is required");

    // username ya email se dhoondo (username DB mein lowercase hota hai)
    const user = await User.findOne({
        $or: [{ username: username?.toLowerCase() }, { email }],
    });
    if (!user) throw new ApiError(404, "User does not exist");

    // small `user` ka method (user.models.js)
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Frontend ko bhejne ke liye safe copy (upar wale user mein naya refreshToken nahi hai)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookies mein bhi, JSON mein bhi (mobile app ke liye)
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

// LOGOUT (req.user verifyJWT se aata hai: auth.middleware.js)
const logoutUser = asyncHandler(async (req, res) => {
    // ❌ FIXED: `await` missing tha, uske bina database se token hat hi nahi raha tha
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Named exports (router mein { } ke saath import hote hain)
export { registerUser, loginUser, logoutUser };