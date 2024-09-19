import { Router, Request, Response } from "express";
import User from "../entities/User";
import { isEmpty, validate } from "class-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
const mapErrors = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    if (emailUser) {
      errors.email = "Email is already in use.";
    }
    if (usernameUser) {
      errors.username = "Username is already in use.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }
    const user = new User();

    user.email = email;
    user.username = username;
    user.password = password;

    // Validation
    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json(mapErrors(errors));
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    let errors: any = {};
    const { username, password } = req.body;

    if (isEmpty(username)) errors.username = "Username cannot be empty.";
    if (isEmpty(password)) errors.password = "Password cannot be empty.";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    const user = await User.findOneBy({ username });

    if (!user)
      return res
        .status(404)
        .json({ username: "User does not exist in the system." });
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res
        .status(400)
        .json({ password: "Password is incorrect. Please double check." });
    }
    // Password matches, generate token
   
    const token = jwt.sign({ username }, process.env.JWT_SECRET as string);

    res.set("Set-Cookie", cookie.serialize("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7days
        path: "/"
    }));

    return res.json({ user, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
