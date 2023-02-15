import { Request, Response } from "express"
import { getRepository } from "typeorm"
import { validate } from "validate.js"
import { Contas, TipoConta } from "../entity/Contas"
import getUser from "../hook/GetUserToken"

export class ContasController {
  private validarContas = {
    descricao: { presence: { allowEmpty: false, type: "string" } },
    observacao: { presence: false, type: "string" },
    contaPaiId: { presence: false, type: "number" }
  }

  public tree = async (_req: Request, res: Response) => {
    try {
      // deve pesquisar pelos campos e adicioná-los a uma variável
      const contas: any = await getRepository(Contas).find({ select: ["id", "descricao", "observacao", "tipo", "contaPaiId"] })

      // deve criar mais duas variáveis e filtrá-las pelo campo que será utilizado como base para o campo children
      const contasPai: any = contas.filter(el => !el.contaPaiId)
      const contasFilho: any = contas.filter(el => !!el.contaPaiId)

      // deve usar o forEach para fazer um looping que pegue childrens o qual o campo contaPaiId esteja referenciando um id existente
      contasFilho.forEach(() => {
        contasFilho.forEach(el1 => {
          el1.children = contas.filter(el => el.contaPaiId === el1.id)
        })
      })

      // deve dar início ao looping caso a variável filho tenha um contaPaiId válido
      contasPai.forEach(element => {
        element.children = contasFilho.filter(el => el.contaPaiId === element.id)
      })

      // deve retornar o resultado
      return res.json(contasPai)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  }

  public listar = async (req: Request, res: Response) => {
    try {
      // deve pequisar pelas contas e filtrar elas
      let sql = `
                SELECT id
                     , descricao
                     , observacao
                     , tipo
                     , contaPaiId
                  FROM contas
                 WHERE deletedAt is null `

      if (req.query.id && parseFloat(String(req.query.id))) sql += `and id in (${req.query.id})`
      if (req.query.descricao) sql += `and descricao like '%${req.query.descricao}%'`
      if (req.query.observacao) sql += `and observacao like '%${req.query.observacao}%'`
      if (req.query.tipo) sql += `and tipo = ${req.query.tipo}`
      if (req.query.contaPaiId && parseFloat(String(req.query.contaPaiId))) sql += `and contaPaiId in (${req.query.contaPaiId})`
      const lista = await getRepository(Contas).query(sql)

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  }

  public exibir = async (req: Request, res: Response) => {
    try {
      // deve pesquisar pelo ID da conta
      const lista = await getRepository(Contas).findOne({
        select: ["id", "descricao", "observacao", "tipo", "contaPaiId"],
        where: {
          id: parseInt(req.params.id),
          deletedAt: null
        }
      })
      if (!lista) return res.json("Conta não existe!")

      // deve retornar o resultado
      return res.json(lista)
    } catch (error) {
      return res.json({ erro: error.message })
    }
  }

  public incluir = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarContas)
      if (erro) return res.json(erro)

      // deve validar se a conta já foi inserida
      const conta = await getRepository(Contas).findOne({
        descricao: req.body.descricao,
        contaPaiId: req.body.contaPaiId,
        deletedAt: null
      })
      if (conta) return res.json("Conta já cadastrada")

      const descConta = await getRepository(Contas).findOne({
        descricao: req.body.descricao,
        deletedAt: null
      })
      if (descConta) return res.json("Descrição da Conta já cadastrada!")

      // deve incluir
      const addConta = await getRepository(Contas).create({
        descricao: req.body.descricao,
        observacao: req.body.observacao,
        tipo: TipoConta.Analitico,
        contaPaiId: req.body.contaPaiId,
        createdBy: await getUser(req)
      })

      // deve criar uma variável auxiliar para pegar o PaiId e caso o PaiId exista executar uma alteração
      const ajdConta = await getRepository(Contas).findOne({
        id: addConta.contaPaiId,
        deletedAt: null
      })
      if (ajdConta) {
        ajdConta.tipo = TipoConta.Sintetico
        ajdConta.updatedBy = await getUser(req)
        await getRepository(Contas).update(ajdConta.id, ajdConta)
      }

      // deve ter uma validação para chamar a função acima
      if (!addConta.contaPaiId) {
        addConta.tipo = TipoConta.Sintetico
      }

      // deve salvar
      await getRepository(Contas).save(addConta)

      // deve retornar o resultado
      return res.json("Conta cadastrada com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  }

  public alterar = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarContas)
      if (erro) return res.json(erro)

      // deve validar se a conta existe
      const conta = await getRepository(Contas).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!conta) return res.json("Conta não existe!")

      // deve validar se os dados já existem
      const unqConta = await getRepository(Contas).findOne({
        descricao: req.body.descricao,
        contaPaiId: req.body.contaPaiId,
        deletedAt: null
      })
      if (unqConta) return res.json("Conta já foi cadastrada!")

      const unqConta2 = await getRepository(Contas).findOne({
        descricao: req.body.descricao,
        deletedAt: null
      })
      if (unqConta2) return res.json("Descrição da Conta já cadastrada!")

      // deve colocar a requisição em uma variável
      const auxConta = { ...req.body }

      // deve adicionar dados a variável
      auxConta.updatedBy = await getUser(req)

      // deve alterar os dados e salvar
      await getRepository(Contas).update(conta.id, auxConta)

      // deve retonar o resultado
      return res.json("Conta alterada com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  }

  public excluir = async (req: Request, res: Response) => {
    try {
      // deve validar se a conta existe ou se já foi excluída
      const conta = await getRepository(Contas).findOne({
        id: parseInt(req.params.id),
        deletedAt: null
      })
      if (!conta) return res.json("Conta não existe ou já foi excluída!")

      // deve excluir
      const delConta = await getRepository(Contas).softRemove(conta)
      delConta.deletedBy = await getUser(req)

      // deve salvar
      await getRepository(Contas).save(delConta)

      // deve procurar por um id que seja o mesmo que o PaiId de conta
      const contaPai = await getRepository(Contas).findOne({
        id: conta.contaPaiId
      })

      // deve procurar por registros que tenham no seu PaiId o id de contaPai
      const FihosDoPai = await getRepository(Contas).find({
        contaPaiId: contaPai.id
      })

      // deve validar se o pai tem mais filhos, se sim, continua sendo pai, caso contrario se ele tiver um pai passa a ser filho, se não, continua sendo pai
      if (contaPai.contaPaiId && FihosDoPai.length) {
        contaPai.tipo = TipoConta.Analitico
        await getRepository(Contas).update(contaPai.id, contaPai)
      }

      // deve retornar o resultado
      return res.json("Conta excluída com sucesso!")
    } catch (error) {
      return res.json({ erro: error.message })
    }
  }
}
