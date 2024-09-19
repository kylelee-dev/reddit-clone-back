import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import authRouter from "./routes/auth"
import cors from "cors"
const app = express();


app.use(express.json());
const origin = "http://localhost:3000"

app.use(cors({
    origin
}))
// HTTP request logger
app.use(morgan("dev"));

app.get("/", (_, res) => res.send("running"));

app.use("/api/auth", authRouter);
let port = 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log("Database initialized...");
    })
    .catch((error) => console.log(error));
});
