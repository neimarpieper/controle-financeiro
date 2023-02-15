import * as express from "express"
import { DashboardController } from "../controller/DashboardController"

export class DashboardRouter {
  constructor (app: express.Express) {
    const dashboard = new DashboardController()

    app.get("/dashboard/saldo", dashboard.listarSaldo)
    app.get("/dashboard/conta-financeiro", dashboard.listarContas)
  }
}
