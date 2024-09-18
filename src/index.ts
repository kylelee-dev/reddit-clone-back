import { AppDataSource } from "./data-source"


AppDataSource.initialize().then(async () => {

    console.log("Data")
}).catch(error => console.log(error))
