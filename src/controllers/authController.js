import User from "../models/User.js";
import { signToken } from "../utils/token.js";

const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function passwordIsStrong(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

function buildGooglePassword(uid) {
  return `Google${uid.slice(0, 24)}1`;
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!emailRule.test(email.trim())) {
      return res.status(400).json({
        message: "Email format is required, for example name@example.com"
      });
    }

    if (!passwordIsStrong(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include letters and numbers"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });
    const token = signToken(user._id);

    return res.status(201).json({ user: user.toSafeJSON(), token });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!emailRule.test(email.trim())) {
      return res.status(400).json({
        message: "Email format is required, for example name@example.com"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (user?.authProvider === "google" && !user.password) {
      return res.status(400).json({ message: "Please continue with Google login" });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    return res.json({ user: user.toSafeJSON(), token });
  } catch (error) {
    return next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { email, name, uid } = req.body;

    if (!email || !name || !uid) {
      return res.status(400).json({ message: "Google email, name, and uid are required" });
    }

    if (!emailRule.test(email.trim())) {
      return res.status(400).json({
        message: "Google account email is invalid"
      });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: buildGooglePassword(uid),
        googleUid: uid,
        authProvider: "google"
      });
    } else {
      let changed = false;

      if (!user.googleUid) {
        user.googleUid = uid;
        changed = true;
      }

      if (user.authProvider !== "google") {
        user.authProvider = "google";
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }

    const token = signToken(user._id);
    return res.json({ user: user.toSafeJSON(), token });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return res.json({ user: req.user.toSafeJSON() });
}
