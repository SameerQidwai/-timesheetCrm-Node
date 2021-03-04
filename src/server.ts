import express, { Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";
import * as bodyParser from "body-parser";
import { createConnection } from "typeorm";
import allRoutes from "./routes";

// initialize configuration
dotenv.config();
const port = process.env.PORT;
const app: express.Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require("cors")());
const connection = createConnection();

//register routes
app.use("/api/v1", allRoutes);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json("Resource not found!");
});

connection
  .then(() => {
    http.createServer(app).listen(port, () => {
      console.log(`application is listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error("error in DB connection: ", error);
  });
