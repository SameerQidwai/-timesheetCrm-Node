import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';

import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import allRoutes from './routes';
import moment from 'moment-timezone';

const corsOptions = {
  exposedHeaders: 'Authorization',
};
// initialize configuration
dotenv.config();
const port = process.env.PORT;

export const FRONTEND_URL =
  process.env.ENVIRONMENT == 'production'
    ? 'http://crm.1lm.com.au/'
    : process.env.ENVIRONMENT == 'test'
    ? 'http://testcrm.1lm.com.au/'
    : 'http://localhost:3001/';

const app: express.Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cors')(corsOptions));
const connection = createConnection();

//Moment Config
moment.tz.setDefault('Etc/UTC');

//register routes
app.use('/api/v1', allRoutes);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json('Resource not found!');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  if (err.name == 'Error') {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
  res.status(500).send({
    success: false,
    message: err.message,
  });
});

connection
  .then(() => {
    //register routes
    app.use('/api/v1', allRoutes);

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
