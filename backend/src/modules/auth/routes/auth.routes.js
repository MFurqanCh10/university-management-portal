import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import {
    loginLimiter, registerLimiter
} from "../../../middleware/authRateLimiter.js"

const router = express.Router();

router.post("/register",registerLimiter, register);
router.post("/login",loginLimiter, login);
router.post("/logout", logout);

export default router;