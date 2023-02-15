import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as express from "express"
import "reflect-metadata"
import { createConnection } from "typeorm"
import { RouterController } from "./router"

createConnection().then(async (connection) => {
  // create express app
  const app = express()
  app.use(cors())
  app.use(bodyParser.json())

  // register express routes from defined application routes
  new RouterController(app)
  // Routes.forEach(route => {
  //     (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
  //         const result = (new (route.controller as any))[route.action](req, res, next);
  //         if (result instanceof Promise) {
  //             result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

  //         } else if (result !== null && result !== undefined) {
  //             res.json(result);
  //         }
  //     });
  // });

  // setup express app here
  // ...

  // start express server
  // app.listen(3000);

  // insert new users for test
  // await connection.manager.save(connection.manager.create(User, {
  //     firstName: "Timber",
  //     lastName: "Saw",
  //     age: 27
  // }));
  // await connection.manager.save(connection.manager.create(User, {
  //     firstName: "Phantom",
  //     lastName: "Assassin",
  //     age: 24
  // }));
  app.listen(process.env.APP_PORT, () => {
    console.log(`Express server has started on port ${process.env.APP_PORT}.`)
  })
}).catch((error) => console.log(error))
