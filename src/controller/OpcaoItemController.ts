import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { validate } from "validate.js"
import { Opcao } from "../entity/Opcao"
import { OpcaoItem } from "../entity/OpcaoItem"
import getUser from "../hook/GetUserToken"

export class OpcaoItemController {
  private validarOpcaoItem = {
    codigo: { presence: true, type: "number" },
    descricao: { presence: { allowEmpty: false, type: "string" } },
    opcaoId: { presence: true, type: "number" }
  };

  public listar = async (req: Request, res: Response) => {
    try {
      // deve filtrar os itens
      let sql = `
                SELECT opcao_item.id
                     , codigo
                     , opcao_item.descricao
                     , opcao_item.opcaoId
                     , opcao.descricao as opcaoDescricao
                  FROM opcao_item
                  LEFT
                  JOIN opcao
                    ON opcao_item.opcaoId = opcao.id
                 WHERE opcao_item.deletedAt is null `

      if (req.query.id && parseFloat(String(req.query.id))) sql += `and opcao_item.id in (${req.query.id})`
      if (req.query.codigo && parseFloat(String(req.query.codigo))) sql += `and codigo in (${req.query.codigo})`
      if (req.query.descricao) sql += `and opcao_item.descricao like '%${req.query.descricao}%'`
      if (req.query.opcaoId && parseFloat(String(req.query.opcaoId))) sql += `and opcao_item.opcaoId in (${req.query.opcaoId})`
      const lista = await getRepository(OpcaoItem).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public exibir = async (req: Request, res: Response) => {
    try {
      // deve validar se o item existe
      const opcaoItem = await getRepository(OpcaoItem).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!opcaoItem) return res.json("Item da opção não existe!")

      // deve realizar a pesquisa
      let sql = `
                SELECT opcao_item.id
                     , codigo
                     , opcao_item.descricao
                     , opcao_item.opcaoId
                     , opcao.descricao as opcaoDescricao
                  FROM opcao_item
                  LEFT
                  JOIN opcao
                    ON opcao_item.opcaoId = opcao.id
                 WHERE opcao_item.deletedAt is null `

      if (req.params.id) sql += `and opcao_item.id = ${req.params.id}`
      const lista = await getRepository(OpcaoItem).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public incluir = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarOpcaoItem)
      if (erro) return res.json(erro)

      // deve verificar se o item já foi inserido
      const opcaoItem = await getRepository(OpcaoItem).findOne({
        descricao: req.body.descricao,
        opcaoId: req.body.opcaoId,
        deletedAt: null
      })
      if (opcaoItem) return res.json("Descrição do Item já existe!")

      const opcaoItem2 = await getRepository(OpcaoItem).findOne({
        codigo: req.body.codigo,
        opcaoId: req.body.opcaoId,
        deletedAt: null
      })
      if (opcaoItem2) return res.json("Código do Item já existe!")

      // deve validar se a opção existe
      const opcao = await getRepository(Opcao).findOne({
        id: req.body.opcaoId,
        deletedAt: null
      })
      if (!opcao) return res.json("Essa opção não existe!")

      // deve inserir
      const addOpcaoItem = await getRepository(OpcaoItem).create({
        codigo: req.body.codigo,
        descricao: req.body.descricao,
        opcaoId: req.body.opcaoId,
        createdBy: await getUser(req)
      })

      // deve salvar
      await getRepository(OpcaoItem).save(addOpcaoItem)

      // deve retornar o resultado
      return res.json("Item inserido com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public alterar = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarOpcaoItem)
      if (erro) return res.json(erro)

      // deve validar se o item existe
      const opcaoItem = await getRepository(OpcaoItem).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!opcaoItem) return res.json("Item não existe!")

      // deve validar se a opção existe
      const opcao = await getRepository(Opcao).findOne({
        id: req.body.opcaoId,
        deletedAt: null
      })
      if (!opcao) return res.json("Opção não existe!")

      // deve validar se o item já foi inserido
      const unqOpcaoItem = await getRepository(OpcaoItem).findOne({
        codigo: req.body.codigo,
        descricao: req.body.descricao,
        opcaoId: req.body.opcaoId,
        deletedAt: null
      })
      if (unqOpcaoItem) return res.json("Item já existe")

      const unqOpcaoItem3 = await getRepository(OpcaoItem).findOne({
        descricao: req.body.descricao,
        opcaoId: req.body.opcaoId,
        deletedAt: null
      })
      if (unqOpcaoItem3) return res.json("Descrição do Item já existe")

      const unqOpcaoItem2 = await getRepository(OpcaoItem).findOne({
        codigo: req.body.codigo,
        opcaoId: req.body.opcaoId,
        deletedAt: null
      })
      if (unqOpcaoItem2 && unqOpcaoItem3) { return res.json("Código do Item já existe") }

      // deve adicionar a requisição a uma variável
      const auxOpcaoItem = { ...req.body }

      // deve adicionar mais dados a variável
      auxOpcaoItem.updatedBy = await getUser(req)

      // deve alterar o item
      await getRepository(OpcaoItem).update(opcaoItem.id, auxOpcaoItem)

      // deve retornar o resultado
      return res.json("Item alterado com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public excluir = async (req: Request, res: Response) => {
    try {
      // deve validar se o item existe
      const opcaoItem = await getRepository(OpcaoItem).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!opcaoItem) return res.json("Item não existe ou já foi excluído!")

      // deve excluir o item
      const delOpcaoItem = await getRepository(OpcaoItem).softRemove(opcaoItem)
      delOpcaoItem.deletedBy = getUser(req)

      // deve salvar
      await getRepository(OpcaoItem).save(delOpcaoItem)

      // deve retornar o resultado
      return res.json("Item excluído com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };
}
