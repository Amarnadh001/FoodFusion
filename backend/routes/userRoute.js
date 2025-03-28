import express from "express"
import { loginUser, registerUser, getUserByEmail, resetPassword, debugPasswordHashing } from "../controllers/userContoller.js"

const userRouter = express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/debug/:email", getUserByEmail) // For debugging purposes
userRouter.post("/reset-password", resetPassword) // For debugging purposes
userRouter.post("/debug-password", debugPasswordHashing) // For debugging password hashing

export default userRouter;