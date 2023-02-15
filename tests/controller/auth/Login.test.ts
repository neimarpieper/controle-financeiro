require("dotenv").config()
const supertest = require("supertest")
const request = supertest(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`)

describe("Deve Testar Autenticação Login", () => {
  it("Deve validar os dados da requisição ", () => {
    return request.post("/login")
      .send({})
      .then(res => {
        expect(res.status).toBe(400)
        expect(res.text).toBe(JSON.stringify({
          email: ["Email can't be blank"],
          senha: ["Senha can't be blank"]
        }))
      })
  })

  it("Deve validar se o usuário existe", () => {
    return request.post("/login")
      .send({
        email: "eder@123.com",
        senha: "blablabla"
      })
      .then(res => {
        expect(res.status).toBe(400)
        expect(res.text).toBe(JSON.stringify("Usuário não existe!"))
      })
  })

  it("Deve gerar e retornar a token", () => {
    return request.post("/login")
      .send({
        email: "teste@hotmail.com",
        senha: "123456"
      })
      .then(res => {
        expect(res.status).toBe(200)
        expect(res._body).toHaveProperty("token", res._body.token)
        expect(res._body.payload).toHaveProperty("email", "teste@hotmail.com")
      })
  })
})
