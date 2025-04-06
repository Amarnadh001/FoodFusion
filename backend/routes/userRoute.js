import express from "express"
import { loginUser, registerUser, getUserByEmail, resetPassword, debugPasswordHashing, debugPassword } from "../controllers/userContoller.js"

const userRouter = express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/user/:email",getUserByEmail)
userRouter.post("/reset-password",resetPassword)
userRouter.post("/debug-password-hashing",debugPasswordHashing)
userRouter.post("/debug-password",debugPassword)

export default userRouter;