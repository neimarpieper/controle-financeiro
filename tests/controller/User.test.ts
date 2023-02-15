require("dotenv").config()
const supertest = require("supertest")
export const request = supertest(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`)
let token = ""
let payload = {}

beforeEach(() => {
  return request.post("/login")
    .send({
      email: "teste@hotmail.com",
      senha: "123456"
    })
    .then(res => {
      const aux = JSON.parse(res.text)
      token = aux.token
      payload = aux.payload
      expect(res.status).toBe(200)
      expect(aux.payload).toHaveProperty("email", "teste@hotmail.com")
    })
})

describe("Deve Testar Usuários Controller", () => {
  it("Deve Validar Autenticação", () => {
    return request.get("/usuarios")
      .then(res => {
        expect(res.status).toBe(401)
        expect(res.res.statusMessage).toEqual("Unauthorized")
        expect(res.text).toBe(JSON.stringify({ erro: "jwt malformed" }))
      })
  }
  )

  it("Deve Listar Registros", () => {
    return request.get("/usuarios")
      .set("Authorization", token)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res._body).toHaveProperty("id", res._body.id)
      })
  }
  )

  it("Deve trazer um registro por ID", () => {
    return request.get("/usuario/1")
      .set("Authorization", token)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res._body).toHaveProperty("id", res._body.id)
      })
  })

  it("Deve validar os dados da requisição", () => {
    return request.post("/usuario")
      .send({})
      .then(res => {
        expect(res.status).toBe(400)
      })
  })
  // function textoAleatorio()
  // {
  //     var letras = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  //     var aleatorio = '';
  //     for (var i = 0; i < 5; i++) {
  //         var rnum = Math.floor(Math.random() * letras.length);
  //         aleatorio += letras.substring(rnum, rnum + 1);
  //     }
  //     return aleatorio;
  // }
  // test ('Usuário Inserir', () => {
  //   const email = `${textoAleatorio()}@hotmail.com`
  //   return request.post('/salvar')
  //     .send({
  //       name: textoAleatorio(),
  //       login: textoAleatorio(),
  //       password: 123,
  //       confirmPassword: 123,
  //       email: email,
  //       created_by: "test"
  //     })
  //     .then( res => expect(res.status).toBe(200));
  // })
  // Modelo de teste
  // test ('Teste modelo', (done) => {
  //   request.post('/salvar')
  //     .send({
  //       name: 'dqd'
  //     })
  //     .then(res => {
  //       expect(res.status).toBe(400)
  //       expect(res.body.erro).toBe('Erro esperado do servidr')
  //       .done()
  //     })
  //     .catch(err => done.fail(err))
  // })
})
