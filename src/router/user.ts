import * as express from "express"
import { UserController } from "../controller/UserController"

export class UserRouter {
  constructor (app: express.Express) {
    const user = new UserController()

    app.get("/usuarios", user.listar)
    app.get("/usuario/:id", user.exibir)
    app.post("/usuario", user.incluir)
    app.put("/usuario/:id", user.alterar)
    app.delete("/usuario/:id", user.excluir)
  }
}
