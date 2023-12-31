import { v2 as cloudinary } from "cloudinary";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";
import {
  generateToken,
  createHashedPassword,
  comparePassword,
} from "../helpers/authHelpers.js";

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || email.trim().length === 0) {
      return next(new HttpError("Email is required.", 400));
    }

    if (!password || password.trim().length === 0) {
      return next(new HttpError("Password is required.", 400));
    }

    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return next(
        new HttpError(
          "Cannot find a user with the provided email id. Please provide valid credentials or try signing up instead.",
          400
        )
      );
    }

    if (!(await comparePassword(password, existingUser.password))) {
      return next(new HttpError("Invalid credentials.", 400));
    }

    const token = generateToken(existingUser._id, existingUser.email);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        userId: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        profileImage: existingUser.profileImage,
        chatWallpaper: existingUser.chatWallpaper,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, failed to login.", 500));
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, profileImage } = req.body;

    if (!name || name.trim().length === 0) {
      return next(new HttpError("Name is required.", 400));
    }

    if (!email || email.trim().length === 0) {
      return next(new HttpError("Email is required.", 400));
    }

    if (!password || password.trim().length === 0) {
      return next(new HttpError("Password is required.", 400));
    }

    if (!profileImage || profileImage.trim().length === 0) {
      return next(new HttpError("Profile picture is required.", 400));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(
        new HttpError("A user already exists with provided email id.", 400)
      );
    }

    const hashedPassword = await createHashedPassword(password);

    const createdUser = new User({
      name,
      email,
      password: hashedPassword,
      profileImage,
    });

    await createdUser.save();

    const token = generateToken(createdUser._id, email);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: {
        userId: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        profileImage: createdUser.profileImage,
        chatWallpaper: createdUser.chatWallpaper,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, failed to login.", 500));
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword, {
      _id: 1,
      name: 1,
      email: 1,
      profileImage: 1,
    })
      .find({ _id: { $ne: req.user._id } })
      .limit(10);

    if (!users) {
      return next(new HttpError("Something went wrong."));
    }

    res.status(200).json({
      success: true,
      message: "Users found.",
      users,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong."));
  }
};

const addChatWallpaper = async (req, res, next) => {
  try {
    const { wallpaper, remove } = req.body;

    const existingUser = await User.findOne({ email: req.user.email });

    if (!existingUser) {
      return next(new HttpError("Something went wrong, failed to find user."));
    }

    // console.log(existingUser);

    if (
      existingUser.chatWallpaper?.image_url.trim().length > 0 &&
      existingUser.chatWallpaper?.public_id.trim().length > 0
    ) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      await cloudinary.uploader
        .destroy(existingUser.chatWallpaper?.public_id, (err, res) => {
          // console.log(err, res);
        })
        .then((res) => {
          // console.log(res)
        })
        .catch((err) => {
          console.log(err);
          // throw new Error("Something went wrong, failed to update wallpaper.");
        });
    }

    if (remove) {
      existingUser.chatWallpaper = {
        image_url: "",
        public_id: "",
      };
    } else {
      existingUser.chatWallpaper = wallpaper;
    }

    await existingUser.save();

    res.status(200).json({
      success: true,
      message: remove ? "Wallpaper removed!" : "New Wallpaper added!",
      chatWallpaper: existingUser.chatWallpaper,
    });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong, failed to add chat wallpaper.")
    );
  }
};

export { login, register, searchUsers, addChatWallpaper };
