import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { Movimentacao } from "../entity/Movimentacao"

export class DashboardController {
  public listarSaldo = async (req: Request, res: Response) => {
    try {
      // deve realizar a pesquisa com base nos dias e retornar o saldo dos dias especificados
      let sql = `
                SELECT SUM(receita) as totalReceita
                     , SUM(despesa) as totalDespesa
                     , SUM(saldo) as saldo
                  FROM movimentacao
                 WHERE deletedAt is null `

      if (req.query.dataInicio && req.query.dataFim) sql += `and date(diaMovimento) between '${req.query.dataInicio}' and '${req.query.dataFim}'`
      const saldo = await getRepository(Movimentacao).query(sql)

      // deve retornar o resultado
      return res.json(saldo[0])
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public listarContas = async (req: Request, res: Response) => {
    try {
      // deve realizar a pesquisa com base nos dias e retornar o saldo de cada conta nos dias que foram passados
      let sql = `
                SELECT movimentacao.id
                     , contas.descricao
                     , saldo
                     , contas.tipo
                     , contas.contaPaiId
                  FROM movimentacao
                  LEFT
                  JOIN contas
                    ON movimentacao.contaOrigemId = contas.id
                 WHERE movimentacao.deletedAt is null `

      if (req.query.dataInicio && req.query.dataFim) sql += `and date(diaMovimento) between '${req.query.dataInicio}' and '${req.query.dataFim}'`
      if (sql) sql += "order by contas.descricao"
      const saldo = await getRepository(Movimentacao).query(sql)

      // deve retornar o resultado
      return res.json(saldo)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };
}
