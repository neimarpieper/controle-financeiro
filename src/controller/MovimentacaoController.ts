import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { validate } from "validate.js"
import { Contas } from "../entity/Contas"
import { Movimentacao } from "../entity/Movimentacao"
import { Relacionamento } from "../entity/Relacionamento"
import getUser from "../hook/GetUserToken"

export class MovimentacaoController {
  private validarMovimentacao = {
    descricao: { presence: { allowEmpty: false, type: "string" } },
    receita: { presence: true, type: "number" },
    despesa: { presence: true, type: "number" },
    tipo: { presence: true, type: "number", inclusion: [1, 2, 3] },
    relacionamentoId: { presence: true, type: "number" },
    contaOrigemId: { presence: true, type: "number" },
    contaDestinoId: { presence: true, type: "number" }
  };

  public listar = async (req: Request, res: Response) => {
    try {
      // deve trazer as movimentações e filtrar
      let sql = `
                SELECT movimentacao.id
                     , movimentacao.descricao
                     , diaMovimento
                     , receita
                     , despesa
                     , saldo
                     , movimentacao.tipo
                     , opcao_item.descricao as tipoDescricao
                     , movimentacao.relacionamentoId
                     , relacionamento.descricao as relacionamentoDescricao
                     , movimentacao.contaOrigemId
                     , contasOrigem.descricao as contaOrigemDescricao
                     , movimentacao.contaDestinoId
                     , contasDestino.descricao as contaDestinoDescricao
                  FROM movimentacao
                  LEFT
                  JOIN contas as contasOrigem
                    ON movimentacao.contaOrigemId = contasOrigem.id
                  LEFT
                  JOIN contas as contasDestino
                    ON movimentacao.contaDestinoId = contasDestino.id
                 RIGHT
                  JOIN opcao_item
                    ON movimentacao.tipo = opcao_item.codigo
                  LEFT
                  JOIN relacionamento
                    ON movimentacao.relacionamentoId = relacionamento.id
                 WHERE movimentacao.deletedAt is null
                   AND opcao_item.opcaoId = 1 `

      if (req.query.id && parseFloat(String(req.query.id))) sql += `and movimentacao.id in (${req.query.id})`
      if (req.query.descricao) sql += `and movimentacao.descricao like '%${req.query.descricao}%'`
      if (req.query.diaMovimento) sql += `and diaMovimento like '%${req.query.diaMovimento}%'`
      if (req.query.receita) sql += `and receita = ${req.query.receita} `
      if (req.query.despesa) sql += `and despesa = ${req.query.despesa} `
      if (req.query.saldo) sql += `and saldo = ${req.query.saldo} `
      if (req.query.tipo && parseFloat(String(req.query.tipo))) sql += `and movimentacao.tipo in (${req.query.tipo})`
      if (req.query.relacionamentoId && parseFloat(String(req.query.relacionamentoId))) sql += `and movimentacao.relacionamentoId in (${req.query.relacionamentoId})`
      if (req.query.contaOrigemId && parseFloat(String(req.query.contaOrigemId))) sql += `and movimentacao.contaOrigemId in (${req.query.contaOrigemId})`
      if (req.query.contaDestinoId && parseFloat(String(req.query.contaDestinoId))) sql += `and movimentacao.contaDestinoId in (${req.query.contaDestinoId})`
      if (sql) sql += "order by id"
      const lista = await getRepository(Movimentacao).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public exibir = async (req: Request, res: Response) => {
    try {
      // deve retonar a movimentacao pelo ID
      let sql = `
                SELECT movimentacao.id
                     , movimentacao.descricao
                     , diaMovimento
                     , receita
                     , despesa
                     , saldo
                     , movimentacao.tipo
                     , opcao_item.descricao as tipoDescricao
                     , movimentacao.relacionamentoId
                     , relacionamento.descricao as relacionamentoDescricao
                     , movimentacao.contaOrigemId
                     , contasOrigem.descricao as contaOrigemDescricao
                     , movimentacao.contaDestinoId
                     , contasDestino.descricao as contaDestinoDescricao
                  FROM movimentacao
                  LEFT
                  JOIN contas as contasOrigem
                    ON movimentacao.contaOrigemId = contasOrigem.id
                  LEFT
                  JOIN contas as contasDestino
                    ON movimentacao.contaDestinoId = contasDestino.id
                 RIGHT
                  JOIN opcao_item
                    ON movimentacao.tipo = opcao_item.codigo
                  LEFT
                  JOIN relacionamento
                    ON movimentacao.relacionamentoId = relacionamento.id
                 WHERE movimentacao.deletedAt is null
                   AND opcao_item.opcaoId = 1 `

      if (req.params.id) sql += `and movimentacao.id = ${req.params.id}`
      const lista = await getRepository(Movimentacao).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public incluir = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = validate(req.body, this.validarMovimentacao)
      if (erro) return res.json(erro)

      // deve validar se a conta existe
      const contaOrigem = await getRepository(Contas).findOne({
        id: req.body.contaOrigemId,
        deletedAt: null
      })
      if (!contaOrigem) return res.json("Conta de origem não existe!")

      const contaDestino = await getRepository(Contas).findOne({
        id: req.body.contaDestinoId,
        deletedAt: null
      })
      if (!contaDestino) return res.json("Conta de destino não existe!")

      // deve validar se os dados de pessoa existem
      const relacionamento = await getRepository(Relacionamento).findOne({
        id: req.body.relacionamentoId,
        deletedAt: null
      })
      if (!relacionamento) return res.json("Dados de relacionamento não existem!")

      // deve incluir
      const addMov = await getRepository(Movimentacao).create({
        descricao: req.body.descricao,
        diaMovimento: new Date(),
        receita: req.body.receita,
        despesa: req.body.despesa,
        saldo: req.body.receita - req.body.despesa,
        tipo: req.body.tipo,
        relacionamentoId: req.body.relacionamentoId,
        contaOrigemId: req.body.contaOrigemId,
        contaDestinoId: req.body.contaDestinoId,
        createdBy: await getUser(req)
      })

      // deve salvar
      await getRepository(Movimentacao).save(addMov)

      // deve retornar o resultado
      return res.json("Movimentação cadastrada com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public alterar = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = validate(req.body, this.validarMovimentacao)
      if (erro) return res.json(erro)

      // deve validar se o id existe
      const unqMov = await getRepository(Movimentacao).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!unqMov) return res.json("Movimentação não existe!")

      // deve validar se a conta existe
      const contaOrigem = await getRepository(Contas).findOne({
        id: req.body.contaOrigemId,
        deletedAt: null
      })
      if (!contaOrigem) return res.json("Conta de origem não existe!")

      const contaDestino = await getRepository(Contas).findOne({
        id: req.body.contaDestinoId,
        deletedAt: null
      })
      if (!contaDestino) return res.json("Conta de destino não existe!")

      // deve validar se os dados de pessoa existem
      const relacionamento = await getRepository(Relacionamento).findOne({
        id: req.body.relacionamentoId,
        deletedAt: null
      })
      if (!relacionamento) return res.json("Dados de relacionamento não existem!")

      // deve adicionar a requisição a uma variável
      const auxMov = { ...req.body }

      // deve adicionar mais dados a variável
      auxMov.updatedBy = await getUser(req)
      auxMov.saldo = req.body.receita - req.body.despesa

      // deve realizar o update
      await getRepository(Movimentacao).update(unqMov.id, auxMov)

      // deve retornar o resultado
      return res.json("Movimentação alterada com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public excluir = async (req: Request, res: Response) => {
    try {
      // deve validar se o movimento existe
      const unqMov = await getRepository(Movimentacao).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!unqMov) return res.json("Movimento não existe ou já foi excluído")

      // deve excluir
      const delMov = await getRepository(Movimentacao).softRemove(unqMov)
      delMov.deletedBy = await getUser(req)

      // deve salvar
      await getRepository(Movimentacao).save(delMov)

      // deve retornar o resultado
      return res.json("Movimentação excluída com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };
}
