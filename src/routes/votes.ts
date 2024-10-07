import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import User from "../entities/User";
import Post from "../entities/Post";
import Vote from "../entities/Vote";
import Comment from "../entities/Comment";

const router = Router();
const vote = async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: "Invalid value for the vote." });
  }

  try {
    const user: User = res.locals.user;
    let post: Post = await Post.findOneByOrFail({ identifier, slug });
    let vote: Vote | null;
    let comment: Comment | undefined;

    if (commentIdentifier) {
      // Find Vote by Comment
      comment = await Comment.findOneByOrFail({
        identifier: commentIdentifier,
      });
      vote = await Vote.findOneBy({
        username: user.username,
        commentId: comment.id,
      });
    } else {
      vote = await Vote.findOneBy({
        username: user.username,
        postId: post.id,
      });
    }
    if (!vote && value === 0) {
      return res.status(404).json({ error: "Cannot find the vote" });
    } else if (!vote) {
      vote = new Vote();
      vote.user = user;
      vote.value = value;

      // whether it belongs to the post or comment
      if (comment) vote.comment = comment;
      else vote.post = post;
      await vote.save();
    } else if (value === 0) {
      vote.remove();
    } else if (vote.value !== value) {
      vote.value = value;
      await vote.save();
    }

    post = await Post.findOneOrFail({
      where: { identifier, slug },
      relations: ["comments", "comments.votes", "sub", "votes"],
    });
    post.setUserVote(user);
    post.comments.forEach((c) => c.setUserVote(user));

    return res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
router.post("/", userMiddleware, authMiddleware, vote);

export default router;
