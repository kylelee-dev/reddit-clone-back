import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import authRouter from "./routes/auth"
import cors from "cors"
import dotenv from "dotenv";

const app = express();
dotenv.config();
app.use(express.json());
const origin = "http://localhost:3000"

app.use(cors({
    origin,
    credentials: true
}))
// HTTP request logger
app.use(morgan("dev"));

app.get("/", (_, res) => res.send("running"));

app.use("/api/auth", authRouter);
let port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log("Database initialized...");
    })
    .catch((error) => console.log(error));
});
