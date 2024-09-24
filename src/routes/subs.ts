import { NextFunction, Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";
import Sub from "../entities/Sub";
import User from "../entities/User";
import { AppDataSource } from "../data-source";
import Post from "../entities/Post";

const router = Router();

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = "Name cannot be empty.";
    if (isEmpty(title)) errors.title = "Title cannot be empty.";

    const sub = await AppDataSource.getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = "Sub with the name already exists.";

    if (Object.keys(errors).length > 0) throw errors;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong." });
  }

  try {
    const user: User = res.locals.user;

    const sub = new Sub();
    sub.name = name;
    sub.title = title;
    sub.description = description;

    sub.user = user;

    await sub.save();

    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong." });
  }
};
const topSubs = async (_: Request, res: Response) => {
  try {
    const imageUrlExp = `COALESCE(s."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const subs = await AppDataSource.createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, "s")
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, "DESC")
      .limit(5)
      .execute();

    return res.json(subs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Problem occurred." });
  }
};

const getSub = async(req: Request, res: Response) => {
    const name = req.params.name;

    try {
        const sub = await Sub.findOneByOrFail({name});
        
        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(404).json({error: "Community cannot be found."})
    }
}
router.get("/:name", userMiddleware, getSub);
router.post("/create", userMiddleware, authMiddleware, createSub);
router.get("/sub/topSubs", topSubs);

export default router;
