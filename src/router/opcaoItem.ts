import * as express from "express"
import { OpcaoItemController } from "../controller/OpcaoItemController"

export class OpcaoItemRouter {
  constructor (app: express.Express) {
    const opcaoItem = new OpcaoItemController()

    app.get("/opcao-item", opcaoItem.listar)
    app.get("/opcao-item/:id", opcaoItem.exibir)
    app.post("/opcao-item", opcaoItem.incluir)
    app.put("/opcao-item/:id", opcaoItem.alterar)
    app.delete("/opcao-item/:id", opcaoItem.excluir)
  }
}
