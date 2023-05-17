import express, { Request, Response, NextFunction, Application } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import * as bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import allRoutes from './routes';
import moment from 'moment-timezone';
import { crmLock } from './middlewares/systemLock';

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

// const app: express.Application = express();
const app: express.Application = express();
// const wholeExp: any = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cors')(corsOptions));

//LOGS
const originalSend = (app as any).response.send;

(app as any).response.send = function sendOverWrite(body: any) {
  originalSend.call(this, body);
  this._logBody = body;
};

const connection = createConnection();

//Moment Config
moment.tz.setDefault('Etc/UTC');

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
});

morgan.token('req', (req: any, res: any) => JSON.stringify(req.body));
morgan.token('resBody', (req: any, res: any) => JSON.stringify(res._logBody));
morgan.token('headers', (req: Request, res: any) =>
  JSON.stringify(req.headers)
);
morgan.token('query', (req: any, res: any) => JSON.stringify(req.query));
morgan.token('locals', (req: any, res: any) => JSON.stringify(res.locals));

app.use(
  morgan(
    `------------------------------------------------------------------------------
    Time: :date[clf]
    Http-Version: :http-version
    Address: :remote-addr
    User: :remote-user
    User Agent: :user-agent
    Method: :method
    Route: :url
    Headers: :headers
    Query Params: :query
    Request Body :req
    Status Code: :status
    Locals: :locals
    Response Body :resBody
    Response Length: :res[content-length]
    `,
    { stream: accessLogStream }
  )
);

//register routes
app.use('/api/v1', [crmLock], allRoutes);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json('Resource not found!');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  if (err.name == 'Error') {
    return res.status(400).send({
      success: false,
      message: err.message,
    });
  }
  return res.status(500).send({
    success: false,
    message: err.message,
  });
});

connection
  .then(() => {
    //register routes
    app.use('/api/v1', [crmLock], allRoutes);

    // 404
    app.use((req: Request, res: Response) => {
      return res.status(404).json('Resource not found!');
    });

    http.createServer(app).listen(port, () => {
      console.log(`application is listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error('error in DB connection: ', error);
  });
