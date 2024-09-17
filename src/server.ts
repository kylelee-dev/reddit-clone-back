import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";

const app = express();

app.use(express.json());

// HTTP request logger
app.use(morgan("dev")); 

app.get("/", (_, res) => res.send("running"));


let port = 4000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`)

    AppDataSource.initialize().then(async () => {

        console.log("Database initialized...")
    }).catch(error => console.log(error))
    
})