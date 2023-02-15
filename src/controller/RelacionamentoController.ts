import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { validate } from "validate.js"
import { Relacionamento } from "../entity/Relacionamento"
import getUser from "../hook/GetUserToken"

export class RelacionamentoController {
  private validarRelacionamento = {
    descricao: { presence: { allowEmpty: false, type: "string" } },
    cpfCnpj: { presence: { allowEmpty: false, type: "string" }, length: { minimum: 14, maximum: 18 } },
    endereco: { presence: { allowEmpty: false, type: "string" } },
    telefone: { presence: { allowEmpty: false, type: "string" }, length: { minimum: 13, maximum: 13 } }
  };

  public listar = async (req: Request, res: Response) => {
    try {
      // deve pesquisar pelas pessoas e filtrar
      let sql = `
                SELECT id
                     , descricao
                     , cpfCnpj
                     , endereco
                     , telefone
                  FROM relacionamento
                 WHERE deletedAt is null `

      if (req.query.id && parseFloat(String(req.query.id))) sql += `and id in (${req.query.id})`
      if (req.query.descricao) sql += `and descricao like '%${req.query.descricao}%'`
      if (req.query.cpfCnpj) sql += `and cpfCnpj like '%${req.query.cpfCnpj}%'`
      if (req.query.endereco) sql += `and endereco like '%${req.query.endereco}%'`
      if (req.query.telefone) sql += `and telefone like '%${req.query.telefone}%'`
      const lista = await getRepository(Relacionamento).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public exibir = async (req: Request, res: Response) => {
    try {
      // deve pesquisar pelo ID da pessoa
      const lista = await getRepository(Relacionamento).findOne({
        select: ["id", "descricao", "cpfCnpj", "endereco", "telefone"],
        where: {
          id: req.params.id
        }
      })
      if (!lista) return res.json("Não existe informações sobre essa pessoa!")

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public incluir = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = validate(req.body, this.validarRelacionamento)
      if (erro) return res.json(erro)

      // deve validar se os dados já foram inseridos
      const vDescricao = await getRepository(Relacionamento).findOne({
        descricao: req.body.descricao
      })
      if (vDescricao) return res.json("Descrição já foi cadastrada!")

      const vCpfCnpj = await getRepository(Relacionamento).findOne({
        cpfCnpj: req.body.cpfCnpj
      })
      if (vCpfCnpj) return res.json("CPF ou CNPJ já foram cadastrados!")

      const vEndereco = await getRepository(Relacionamento).findOne({
        endereco: req.body.endereco
      })
      if (vEndereco) return res.json("Endereço já foi cadastrado!")

      const vTelefone = await getRepository(Relacionamento).findOne({
        telefone: req.body.telefone
      })
      if (vTelefone) return res.json("Telefone já foi cadastrado!")

      // deve inserir
      const addPessoa = await getRepository(Relacionamento).create({
        descricao: req.body.descricao,
        cpfCnpj: req.body.cpfCnpj,
        endereco: req.body.endereco,
        telefone: req.body.telefone,
        createdBy: await getUser(req)
      })

      // deve salvar
      await getRepository(Relacionamento).save(addPessoa)

      // deve retornar o resultado
      return res.json("Dados foram cadastrados com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public alterar = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = validate(req.body, this.validarRelacionamento)
      if (erro) return res.json(erro)

      // deve validar se a pessoa existe
      const unqPessoa = await getRepository(Relacionamento).findOne({
        id: parseInt(req.params.id)
      })
      if (!unqPessoa) return res.json("Não existe informações sobre essa pessoa!")

      // deve validar se os dados já foram inseridos
      const vDescricao = await getRepository(Relacionamento).findOne({
        descricao: req.body.descricao
      })
      const vCpfCnpj = await getRepository(Relacionamento).findOne({
        cpfCnpj: req.body.cpfCnpj
      })
      const vEndereco = await getRepository(Relacionamento).findOne({
        endereco: req.body.endereco
      })
      const vTelefone = await getRepository(Relacionamento).findOne({
        telefone: req.body.telefone
      })
      if (vDescricao && vCpfCnpj && vEndereco && vTelefone) return res.json("Esses dados já foram cadastrados!")

      // deve adicionar a requisição a uma variável
      const auxPessoa = { ...req.body }

      // deve adicionar mais dados a variável
      auxPessoa.updatedBy = await getUser(req)

      // deve realizar o update
      await getRepository(Relacionamento).update(unqPessoa.id, auxPessoa)

      // deve retornar o resultado
      return res.json("Informações alteradas com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };

  public excluir = async (req: Request, res: Response) => {
    try {
      // deve validar se a pessoa existe
      const unqPessoa = await getRepository(Relacionamento).findOne({
        id: parseInt(req.params.id)
      })
      if (!unqPessoa) return res.json("Dados não existem ou já foram excluídos!")

      // deve excluir
      const delPessoa = await getRepository(Relacionamento).softRemove(unqPessoa)
      delPessoa.deletedBy = await getUser(req)

      // deve salvar
      await getRepository(Relacionamento).save(delPessoa)

      // deve retornar o resultado
      return res.json("Os dados foram excluídos com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };
}
