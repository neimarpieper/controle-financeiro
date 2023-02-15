import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { validate } from "validate.js"
import { User } from "../entity/User"
import getUser from "../hook/GetUserToken"

export class UserController {
  private validarUser = {
    nome: { presence: { allowEmpty: false, type: "string" } },
    email: { presence: true, email: true },
    senha: { presence: { allowEmpty: false, type: "string" } },
    admin: { presence: true, type: "number", inclusion: [0, 1] }
  };

  public listar = async (req: Request, res: Response) => {
    try {
      // deve pesquisar os usuários e filtrar o resultado
      let sql = `
                SELECT id
                     , nome
                     , email
                     , senha
                     , admin
                  FROM user
                 WHERE deletedAt is null `

      if (req.query.id && parseFloat(String(req.query.id))) sql += `and id in (${req.query.id})`
      if (req.query.nome) sql += `and nome like '%${req.query.nome}%'`
      if (req.query.email) sql += `and email like '%${req.query.email}%'`
      if (req.query.senha) sql += `and senha = '${req.query.senha}'`
      if (req.query.admin) sql += `and admin = ${req.query.admin}`
      const lista = await getRepository(User).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public exibir = async (req: Request, res: Response) => {
    try {
      // deve verificar se o usuário existe
      const lista = await getRepository(User).findOne({
        select: ["id", "nome", "email", "senha", "admin"],
        where: {
          id: req.params.id,
          deletedAt: null
        }
      })
      if (!lista) return res.json("Usuário não existe!")

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public incluir = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarUser)
      if (erro) return res.status(400).json(erro)

      // deve validar se o usuário já foi incluído
      const usuario = await getRepository(User).findOne({
        email: req.body.email,
        deletedAt: null
      })
      if (usuario) return res.json("Usuário já cadastrado!")

      // deve incluir o usuário
      const addUsuario = await getRepository(User).create({
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        admin: req.body.admin,
        createdBy: await getUser(req)
      })

      // deve salvar
      await getRepository(User).save(addUsuario)

      // deve retornar o resultado
      return res.json("Usuário cadastrado com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public alterar = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarUser)
      if (erro) return res.json(erro)

      // deve validar se o usuário existe
      const usuario = await getRepository(User).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!usuario) return res.json("Usuário não cadastrado!")

      // deve validar se já existe um usuário igual
      const unqUsuario = await getRepository(User).findOne({
        email: req.body.email,
        deletedAt: null
      })
      if (unqUsuario) return res.json("Não é possível alterar, usuário já cadastrado!")

      // deve salvar as requisições em uma variável
      const auxUsuario = { ...req.body }

      // deve adicionar dados a variável
      auxUsuario.updatedBy = await getUser(req)

      // deve alterar e salvar o usuário
      await getRepository(User).update(usuario.id, auxUsuario)

      // deve retornar o resultado
      return res.json("Usuário alterado com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public excluir = async (req: Request, res: Response) => {
    try {
      // deve verificar se o usuário já foi excluído
      const usuario = await getRepository(User).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!usuario) return res.json("Usuário não existe ou já foi excluído!")

      // deve excluir
      const delUsuario = await getRepository(User).softRemove(usuario)
      delUsuario.deletedBy = await getUser(req)

      // deve salvar
      await getRepository(User).save(delUsuario)

      // deve retornar o resultado
      return res.json("Usuário excluído com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };
}
