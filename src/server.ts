import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';

import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import allRoutes from './routes';

import runSeeders from './utilities/seeders';

const corsOptions = {
  exposedHeaders: 'Authorization',
};
// initialize configuration
dotenv.config();
const port = process.env.PORT;
const app: express.Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cors')(corsOptions));
const connection = createConnection();

//Seeders

//register routes
app.use('/api/v1', allRoutes);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json('Resource not found!');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).send({
    success: false,
    message: err.message,
  });
});

connection
  .then(() => {
    //register routes
    app.use('/api/v1', allRoutes);
    // runSeeders();

    // 404
    app.use((req: Request, res: Response) => {
      res.status(404).json('Resource not found!');
    });

    http.createServer(app).listen(port, () => {
      console.log(`application is listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
