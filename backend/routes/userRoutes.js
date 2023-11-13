import { Router } from "express";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import {
  login,
  register,
  searchUsers,
  addChatWallpaper,
} from "../controllers/user-controllers.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/find", requireSignIn, searchUsers);
router.post("/chat-wallpaper", requireSignIn, addChatWallpaper);

export default router;
