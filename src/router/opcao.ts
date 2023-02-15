import * as express from "express"
import { OpcaoController } from "../controller/OpcaoController"

export class OpcaoRouter {
  constructor (app: express.Express) {
    const opcao = new OpcaoController()

    app.get("/opcao/dropdown/:id", opcao.dropdown)
    app.get("/opcao", opcao.listar)
    app.get("/opcao/:id", opcao.exibir)
    app.post("/opcao", opcao.incluir)
    app.put("/opcao/:id", opcao.alterar)
    app.delete("/opcao/:id", opcao.excluir)
  }
}
