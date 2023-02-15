import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { validate } from "validate.js"
import { Opcao } from "../entity/Opcao"
import getUser from "../hook/GetUserToken"

export class OpcaoController {
  private validarOpcao = {
    descricao: { presence: { allowEmpty: false, type: "string" } }
  };

  public dropdown = async (req: Request, res: Response) => {
    try {
      // deve retornar uma lista com as opções e itens das opções
      let sql = `
                SELECT opcao.id
                     , opcao.descricao
                     , opcao_item.codigo
                     , opcao_item.opcaoId
                  FROM opcao
                  LEFT
                  JOIN opcao_item
                    ON opcao.id = opcao_item.opcaoId
                 WHERE opcao.deletedAt is null `

      if (req.params.id) sql += `and opcao.id = ${req.params.id}`
      const lista = await getRepository(Opcao).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public listar = async (req: Request, res: Response) => {
    try {
      // deve pesquisar pela opção e filtrar ela
      let sql = `
                SELECT id
                     , descricao
                  FROM opcao
                 WHERE deletedAt is null `

      if (req.query.id && parseFloat(String(req.query.id))) sql += `and id in (${req.query.id})`
      if (req.query.descricao) sql += `and descricao like '%${req.query.descricao}%'`
      const lista = await getRepository(Opcao).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public exibir = async (req: Request, res: Response) => {
    try {
      // deve validar se a opção existe
      const lista = await getRepository(Opcao).findOne({
        select: ["id", "descricao"],
        where: {
          id: req.params.id,
          deletedAt: null
        }
      })
      if (!lista) return res.json("Opção não existe!")

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public incluir = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarOpcao)
      if (erro) return res.json(erro)

      // deve validar se a opção já existe
      const opcao = await getRepository(Opcao).findOne({
        descricao: req.body.descricao,
        deletedAt: null
      })
      if (opcao) return res.json("Opção já existe!")

      // deve adicionar a opção
      const addOpcao = await getRepository(Opcao).create({
        descricao: req.body.descricao,
        createdBy: await getUser(req)
      })

      // deve salvar
      await getRepository(Opcao).save(addOpcao)

      // deve retornar o resultado
      return res.json("Opção inserida com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public alterar = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarOpcao)
      if (erro) return res.json(erro)

      // deve validar se a opção existe
      const opcao = await getRepository(Opcao).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!opcao) return res.json("Opção não existe!")

      // deve validar se a opção já foi inserida
      const unqOpcao = await getRepository(Opcao).findOne({
        descricao: req.body.descricao,
        deletedAt: null
      })
      if (unqOpcao) return res.json("Opção já existe!")

      // deve adicionar a requisição a uma variável
      const auxOpcao = { ...req.body }

      // deve adicionar mais dados a variavel
      auxOpcao.updatedBy = await getUser(req)

      // deve alterar a opção
      await getRepository(Opcao).update(opcao.id, auxOpcao)

      // deve retornar o resultado
      return res.json("Opção alterada com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public excluir = async (req: Request, res: Response) => {
    try {
      // deve validar se a opção já foi excluida
      const opcao = await getRepository(Opcao).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!opcao) return res.json("Opção não existe ou já foi excluída!")

      // deve excluir a opção
      const delOpcao = await getRepository(Opcao).softRemove(opcao)
      delOpcao.deletedBy = await getUser(req)

      // deve salvar
      await getRepository(Opcao).save(delOpcao)

      // deve retornar o resultado
      return res.json("Opção excluída com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };
}
