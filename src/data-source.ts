import "reflect-metadata"
import { DataSource } from "typeorm"
import User from "./entities/User"
import Post from "./entities/Post"
import Sub from "./entities/Sub"
import Vote from "./entities/Vote"
import Comment from "./entities/Comment"
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [User, Post, Sub, Vote, Comment],
    migrations: [],
    subscribers: [],
})
