import * as express from "express"
import { ContasController } from "../controller/ContasController"

export class ContasRouter {
  constructor (app: express.Express) {
    const contas = new ContasController()

    app.get("/conta-financeiro/tree", contas.tree)
    app.get("/conta-financeiro", contas.listar)
    app.get("/conta-financeiro/:id", contas.exibir)
    app.post("/conta-financeiro", contas.incluir)
    app.put("/conta-financeiro/:id", contas.alterar)
    app.delete("/conta-financeiro/:id", contas.excluir)
  }
}
