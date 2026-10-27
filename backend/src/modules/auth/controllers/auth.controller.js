import { registerSchema } from "../validators/register.validator.js";
import { registerUser } from "../services/auth.service.js";
import { loginSchema } from "../validators/login.validator.js";
import { loginUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
    try {
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }



        const user = await registerUser(validation.data);

        return res.status(201).json({
            message: "Registration successful",
            user,
        });
    } catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Invalid email or password format",
            });
        }

        const result = await loginUser(validation.data);

        res.cookie("accessToken", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });

        return res.status(200).json({
            message: "Login successful",
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
      path: "/",

  });

  return res.status(200).json({
      message: "Logout successful",

  });
};
