// import asyncHandler from "../utils/asyncHandler.js";
// import { ApiError } from '../utils/ApiError.js'
// import { User } from '../models/user.models.js'
// import {uploadOnCloudinary} from '../utils/Claudinary.js'
// import {ApiResponse} from '../utils/ApiResponse.js'

// const registerUser = asyncHandler(async (req, res) => {
//     // Get Users Details
//     // Validation - find if any fields are empty
//     // Check if users already exist: username & email
//     // Check for images and avatars.
//     // Uplaod to Cloudinary, avatar
//     // Create user Object - Create entry in db
//     // Remove Password and Refresh Token from Response Result
//     // Check for user Creation
//     // return res

//     const { fullName, email, username, password } = req.body
//     console.log("email: ", email)

//     if ([fullName, email, username, password].some(fields?.trim() === "")) {
//         throw new ApiError(400, "All Fields are required")
//     }

//     const userExisted = User.findOne({
//         $or: [{username}, {email}]
//     })

//     if(!userExisted){
//         throw new ApiError(409, "User with email or username Already exist")
//     }

//     const avatarLocalPath = req.files?.avatar[0]?.path
//     const coverImagePath = req.files?.coverImage[0]?.path

//     if(!avatarLocalPath){
//         throw new ApiError(400, "Avatar File is Required")
//     }


//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     const coverImage = await uploadOnCloudinary(coverImagePath)

//     if(!avatar){
//         throw new ApiError(409, "Avatar file is Required")
//     }

//     user = await User.Create({
//         fullName,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email,
//         password,
//         username: username.toLowerCase()
//     })

//     const createdUser = await User.findbyId(user._id).select(
//         "-password -refreshToken"
//     )

//     if(!createdUser){
//         throw new ApiError(500, "User Not Created")
//     }

//     return res.status(201).json(
//         new ApiResponse(201, createdUser, "User Created Sucessfully")
//     )

// });

// export default registerUser;






//===========================================================

// MY OLD CODE

//===========================================================








































/*
 =====================================================================
  HOW TO READ THIS FILE
 =====================================================================
  [MISTAKE]     = what was wrong in your original code
  [FIX]         = how it is fixed in the code right below the comment
  [IMPROVEMENT] = not an error, but this makes the code better/safer
  [CHECK]       = something you should confirm in your own project

  The code is split in 10 sections. Each section matches one step.
 =====================================================================
*/


// =====================================================================
// SECTION 1: IMPORTS
// =====================================================================

// Default export  -> no curly braces
import asyncHandler from "../utils/asyncHandler.js";

// Named exports   -> curly braces
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// [MISTAKE] Your path was '../utils/Claudinary.js'. "Claudinary" looks like a typo.
// [CHECK]   The path must match your real file name EXACTLY (small/capital
//           letters too). If your file is really named Claudinary.js, keep it.
import { uploadOnCloudinary } from "../utils/Claudinary.js";


// =====================================================================
// SECTION 2: THE FUNCTION AND THE PLAN
// =====================================================================

const registerUser = asyncHandler(async (req, res) => {
    // Plan (steps):
    // 1. Get user details
    // 2. Validate - check no field is empty
    // 3. Check if user already exists (username or email)
    // 4. Get image paths and check avatar
    // 5. Upload images to Cloudinary
    // 6. Create user in database
    // 7. Remove password and refresh token from the result
    // 8. Check the user was really created
    // 9. Send the response

    // [IMPROVEMENT] Typos fixed in comments: "Uplaod" -> "Upload", "Sucessfully" -> "Successfully".


    // =================================================================
    // SECTION 3: GET USER DETAILS
    // =================================================================

    const { fullName, email, username, password } = req.body;
    console.log("email: ", email); // only for testing, remove it later


    // =================================================================
    // SECTION 4: VALIDATION (check for empty fields)
    // =================================================================

    // [MISTAKE] Your code:
    //   [fullName, email, username, password].some(fields?.trim() === "")
    //   1) `some` needs a FUNCTION inside it. You gave it a plain condition.
    //   2) `fields` was never defined, so it would crash.
    //
    // [FIX] Write a small arrow function. It receives each value one by one.
    //
    // [IMPROVEMENT] Use `!field?.trim()` instead of `field?.trim() === ""`.
    //   - If a field is MISSING (undefined), `undefined === ""` is false,
    //     so your old check would let it pass.
    //   - `!field?.trim()` is true for both missing AND empty values.
    if ([fullName, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // [IMPROVEMENT] Optional: check the email has an "@" sign.
    if (!email.includes("@")) {
        throw new ApiError(400, "Please enter a valid email");
    }


    // =================================================================
    // SECTION 5: CHECK IF USER ALREADY EXISTS
    // =================================================================

    // [IMPROVEMENT] You save the username in lowercase, so search with the
    //   lowercase username too. Otherwise "Ayan" and "ayan" can both register.
    const lowerCaseUsername = username.toLowerCase();

    // [MISTAKE] `findOne` has no `await`. Without it, you get a Promise
    //   (always "truthy"), not the real user.
    // [FIX] Add `await`.
    const existedUser = await User.findOne({
        $or: [{ username: lowerCaseUsername }, { email }],
    });

    // [MISTAKE] Your check was `if (!userExisted)`. That is REVERSED.
    //   It threw an error when the user was NOT found (a new user).
    // [FIX] Throw the error when the user IS found.
    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }


    // =================================================================
    // SECTION 6: GET FILE PATHS AND CHECK AVATAR
    // =================================================================

    // [MISTAKE] `req.files?.avatar[0]?.path`
    //   If no avatar is sent, `avatar` is undefined and `[0]` crashes.
    // [FIX] Put `?.` before `[0]` too:  avatar?.[0]?.path
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    // [MISTAKE] Same crash problem for the cover image.
    // [IMPROVEMENT] Renamed `coverImagePath` -> `coverImageLocalPath`
    //   so the name matches `avatarLocalPath` and is easier to read.
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // Avatar is compulsory.
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }


    // =================================================================
    // SECTION 7: UPLOAD TO CLOUDINARY
    // =================================================================

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // [MISTAKE] Your code uploaded the cover image ALWAYS, even when the
    //   user did not send one. That can crash or give a bad result.
    // [FIX] Upload only if the cover image path exists.
    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // [MISTAKE] You used status 409 here. 409 means "conflict".
    // [FIX] A missing avatar is a bad request, so use 400
    //   (same as the earlier avatar check).
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }


    // =================================================================
    // SECTION 8: CREATE USER IN THE DATABASE
    // =================================================================

    // [MISTAKE] 1) `user = ...` has no `const`. This makes a global variable
    //              and can cause errors in strict mode.
    //           2) `User.Create` has a capital C. The real method is `create`.
    // [FIX] Write `const user = await User.create(...)`.
    const user = await User.create({
        fullName,
        avatar: avatar.url,                  // only the url, not the whole Cloudinary response
        coverImage: coverImage?.url || "",   // ?. = safe if missing, || "" = empty text if no image
        email,
        password,                            // the model encrypts it automatically
        username: lowerCaseUsername,
    });


    // =================================================================
    // SECTION 9: CHECK USER CREATION AND REMOVE SECRET FIELDS
    // =================================================================

    // [MISTAKE] `findbyId` has a small b. The real method is `findById`.
    // [FIX] Use `findById`. Keep `await`, and keep `.select("-password -refreshToken")`
    //   (the minus sign means "remove this field").
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // [IMPROVEMENT] Better error message. Also 500 is correct here,
    //   because the problem is on the server side.
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }


    // =================================================================
    // SECTION 10: SEND THE RESPONSE
    // =================================================================

    // Your original code here was already correct.
    // [IMPROVEMENT] Only the message text was corrected ("Sucessfully").
    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// =====================================================================
// EXPORT
// =====================================================================

// [CHECK] This is a DEFAULT export. In the routes file, import it WITHOUT
//   curly braces:   import registerUser from "../controllers/user.controller.js";
export default registerUser;


/*
 =====================================================================
  DO LATER (not part of this lesson yet)
 =====================================================================
  After a successful Cloudinary upload, delete the local files from your
  server (inside your uploadOnCloudinary helper, using fs.unlinkSync),
  so your server storage does not fill up.
 =====================================================================
*/