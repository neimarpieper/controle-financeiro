import * as express from "express"
import { RelacionamentoController } from "../controller/RelacionamentoController"

export class RelacionamentoRouter {
  constructor (app: express.Express) {
    const relacionamento = new RelacionamentoController()

    app.get("/relacionamento", relacionamento.listar)
    app.get("/relacionamento/:id", relacionamento.exibir)
    app.post("/relacionamento", relacionamento.incluir)
    app.put("/relacionamento/:id", relacionamento.alterar)
    app.delete("/relacionamento/:id", relacionamento.excluir)
  }
}
