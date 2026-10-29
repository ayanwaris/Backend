import { Router } from "express";
// ❌ FIXED: named exports hain, isliye { } ke andar (pehle bina { } ke tha)
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
// ❌ FIXED: ye import missing tha
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// app.js mein "/api/v1/users" lagta hai, to URL: /api/v1/users/register
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// Pehle guard (verifyJWT), phir logoutUser
router.route("/logout").post(verifyJWT, logoutUser);

export default router;