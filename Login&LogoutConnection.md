# Sab kuch kaise jud-ta hai (pehle ye padho)

## Request ka safar (LOGIN)

```
Postman/Browser
   POST /api/v1/users/login
        │
        ▼
 src/app.js                      app.use("/api/v1/users", userRouter)
        │
        ▼
 src/routes/user.router.js       router.route("/login").post(loginUser)
        │
        ▼
 src/controllers/user.controller.js   loginUser
        │   ├─ User.findOne(...)            ──► src/models/user.models.js  (User model)
        │   ├─ user.isPasswordCorrect()     ──► src/models/user.models.js  (method)
        │   ├─ generateAccessAndRefreshTokens() ─► user.generateAccessToken()/generateRefreshToken()
        │   └─ res.cookie(...)              ──► browser mein cookies
        ▼
 Response: cookies + JSON
```

## Request ka safar (LOGOUT)

```
POST /api/v1/users/logout   (cookies saath aati hain)
        │
        ▼
 app.js → user.router.js:  .post(verifyJWT, logoutUser)
        │
        ├─► 1) src/middlewares/auth.middleware.js  verifyJWT
        │        token nikaala → jwt.verify → User.findById → req.user = user → next()
        │
        └─► 2) src/controllers/user.controller.js  logoutUser
                 req.user._id (guard ne diya) → refreshToken hataya → cookies clear
```

## Kaun si file kisko import karti hai

| File | Kya import karti hai | Kahan se |
|---|---|---|
| `app.js` | `userRouter` | `routes/user.router.js` |
| `user.router.js` | `registerUser, loginUser, logoutUser` | `controllers/user.controller.js` |
| `user.router.js` | `verifyJWT` | `middlewares/auth.middleware.js` |
| `user.router.js` | `upload` | `middlewares/multer.middleware.js` |
| `user.controller.js` | `User` | `models/user.models.js` |
| `user.controller.js` | `asyncHandler` | `utils/asyncHandler.js` |
| `user.controller.js` | `ApiError`, `ApiResponse` | `utils/` |
| `auth.middleware.js` | `User`, `asyncHandler`, `ApiError` | `models/`, `utils/` |

## `.env` ke naam (model aur middleware inhi ko padhte hain)

```
ACCESS_TOKEN_SECRET      → model (token banane) + auth.middleware (verify karne)
ACCESS_TOKEN_EXPIRY      → model
REFRESH_TOKEN_SECRET     → model
REFRESH_TOKEN_EXPIRY     → model
CORS_ORIGIN              → app.js
```

## Aapki 9 galtiyan (sab fix ho gayi)

| # | File | Galat | Sahi |
|---|---|---|---|
| 1 | controller | `user.findById(userId)` | `User.findById(userId)` |
| 2 | controller | `if (!username \|\| !email)` | `if (!(username \|\| email))` |
| 3 | controller | logout mein `User.findByIdAndUpdate` bina `await` | `await User.findByIdAndUpdate` |
| 4 | middleware | `req.cookie?.accessToken` | `req.cookies?.accessToken` |
| 5 | middleware | `veryfyJWT` (spelling) | `verifyJWT` |
| 6 | middleware | `import { asyncHandler }` (named) | `import asyncHandler` (default) |
| 7 | router | `import registerUser, {...}` (default) | `import { registerUser, ... }` (named) |
| 8 | router | `verifyJWT` import hi nahi tha | `import { verifyJWT } from ...` |
| 9 | model | `return next()` (Mongoose 9 mein `next` nahi) | `return;` |

Choti improvements: missing input par status `401` ki jagah `400`, login mein `username?.toLowerCase()`, aur cookie options ek jagah `cookieOptions`.