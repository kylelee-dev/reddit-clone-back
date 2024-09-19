import { Router, Request, Response } from "express";
import User from "../entities/User";
import { validate } from "class-validator";

const mapErrors = (errors: Object[]) => {
    return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.constraints)[0][1]
        return prev;
}, {})
}

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
    if (errors.length >0) return res.status(400).json(mapErrors(errors));
    await user.save();
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
  console.log(email, username, password);

  res.json("test");
};

const router = Router();

router.post("/register", register);

export default router;
