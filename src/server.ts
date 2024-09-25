import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth";
import subRoutes from "./routes/subs";
import postRoutes from "./routes/posts";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
app.use(express.json());
const origin = "http://localhost:3000";
app.use(express.static("public"));
app.use(
  cors({
    origin,
    credentials: true,
  })
);
// HTTP request logger
app.use(morgan("dev"));
app.use(cookieParser());
app.get("/", (_, res) => res.send("running"));

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subs", subRoutes);
let port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log("Database initialized...");
    })
    .catch((error) => console.log(error));
});
