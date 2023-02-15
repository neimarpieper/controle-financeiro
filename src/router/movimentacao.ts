import * as express from "express"
import { MovimentacaoController } from "../controller/MovimentacaoController"

export class MovimentacaoRouter {
  constructor (app: express.Express) {
    const movimentacao = new MovimentacaoController()

    app.get("/movimento", movimentacao.listar)
    app.get("/movimento/:id", movimentacao.exibir)
    app.post("/movimento", movimentacao.incluir)
    app.put("/movimento/:id", movimentacao.alterar)
    app.delete("/movimento/:id", movimentacao.excluir)
  }
}
