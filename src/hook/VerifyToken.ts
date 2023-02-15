import { Request, Response, NextFunction } from "express"
import * as jwt from "jsonwebtoken"

export class HookAutenticacao {
  async checkAutenticate (req: Request, res: Response, next: NextFunction) {
    try {
      console.log(`${req.headers.host} - ${req.method} - ${req.url}`)

      const token = String(req.headers.authorization).replace("Bearer ", "")

      jwt.verify(token, process.env.APP_KEY)

      next()
    } catch (error) {
      return res.status(401).json({ erro: error.message })
    }
  }
}
