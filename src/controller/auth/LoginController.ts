import { Request, Response } from "express"
import * as jwt from "jsonwebtoken"
import { getRepository } from "typeorm"
import { validate } from "validate.js"
import { User } from "../../entity/User"

export class LoginController {
  private validarUsuario = {
    email: { presence: true, email: true },
    senha: { presence: { allowEmpty: false, type: "string" } }
  };

  public login = async (req: Request, res: Response) => {
    try {
      // deve validar os dados da requisição
      const erro = await validate(req.body, this.validarUsuario)
      if (erro) return res.status(400).json(erro)

      // deve validar se o usuário existe
      const usuario = await getRepository(User).findOne({
        email: req.body.email,
        senha: req.body.senha,
        deletedAt: null
      })
      if (!usuario) return res.status(400).json("Usuário não existe!")

      // deve realizar o login com os dados inseridos e retornar uma key única
      const token = jwt.sign({
        data: {
          nome: usuario.nome,
          email: usuario.email
        }
      }, process.env.APP_KEY, { expiresIn: "90h" })

      // deve retornar a key única junto dos dados inseridos
      return res.json({
        token,
        payload: {
          nome: usuario.nome,
          email: usuario.email,
          isAdmin: usuario.admin
        }
      })
    } catch (error) {
      return res.json({ erro: error.message })
    }
  };
}
