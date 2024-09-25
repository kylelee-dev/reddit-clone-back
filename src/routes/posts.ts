import { Request, Response, Router } from "express";
import Sub from "../entities/Sub";
import Post from "../entities/Post";

const router = Router();

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;

  if (title.trim() === "") {
    return res.status(400).json({ title: "Title cannot be empty." });
  }
  const user = res.locals.user;

  try {
    const subRecord = await Sub.findOneByOrFail({ name: sub });
    const post = new Post();

    post.title = title;
    post.body = body;
    post.user = user;
    post.sub = subRecord;

    await post.save();

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong." });
  }
};

router.post("/", createPost);

export default router;
