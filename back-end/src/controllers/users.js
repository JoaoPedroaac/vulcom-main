import prisma from '../database/client.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {

    // Somente usuários administradores podem acessar este recurso
    // HTTP 403: Forbidden
    if(! req?.authUser?.is_admin) return res.status(403).end()

    // Verifica se existe o campo "password" e o
    // criptografa antes de criar o novo usuário
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    await prisma.user.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {

    // Somente usuários administradores podem acessar este recurso
    // HTTP 403: Forbidden
    if(! req?.authUser?.is_admin) return res.status(403).end()

    const result = await prisma.user.findMany(
      // Omite o campo "password" do resultado
      // por questão de segurança
      { omit: { password: true } }  
    )

    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveOne = async function(req, res) {
  try {

    // Somente usuários administradores ou o próprio usuário
    // autenticado podem acessar este recurso
    // HTTP 403: Forbidden
    if(! (req?.authUser?.is_admin || 
      Number(req?.authUser?.id) === Number(req.params.id))) 
      return res.status(403).end()

    const result = await prisma.user.findUnique({
      // Omite o campo "password" do resultado
      // por questão de segurança
      omit: { password: true },
      where: { id: Number(req.params.id) }
    })

    // Somente usuários administradores podem acessar esse recurso
    // Ou usuários com o mesmo ID do usuário que está sendo consultado
    if(! (req?.authUser?.isAdmin || 
      Number(req?.authUser?.id) !== Number(req.params.id)))
      return res.status(403).end()

    // Encontrou ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.update = async function(req, res) {
  try {

    // Somente usuários administradores podem acessar este recurso
    // HTTP 403: Forbidden
    if(! req?.authUser?.is_admin) return res.status(403).end()

    // Verifica se existe o campo "password" e o
    // criptografa antes de criar o novo usuário
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 12)
    }

    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // Encontrou e atualizou ~> HTTP 204: No Content
    if(result) res.status(204).end()
    // Não encontrou (e não atualizou) ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.delete = async function(req, res) {
  try {

    // Somente usuários administradores podem acessar este recurso
    // HTTP 403: Forbidden
    if(! req?.authUser?.is_admin) return res.status(403).end()

    await prisma.user.delete({
      where: { id: Number(req.params.id) }
    })

    //Somente usuários administradores podem acessar esse recurso
    if(! req?.authUser?.isAdmin) {return res.status(403).end()}

    // Encontrou e excluiu ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> HTTP 404: Not Found
      res.status(404).end()
    }
    else {
      // Outros tipos de erro
      console.error(error)

      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
  }
}

controller.login = async function(req, res) {
  try {

      // Busca o usuário no BD usando o valor dos campos
      // "username" OU "email"
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: req.body?.username },
            { email: req.body?.email }
          ]
        }
      })

      // Se o usuário não for encontrado, retorna
      // HTTP 401: Unauthorized
      if(! user) return res.status(401).end()

      // Usuário encontrado, vamos conferir a senha
      let passwordIsValid
      
      // REMOVENDO VULNERABILIDADE DE AUTENTICAÇÃO FIXA
      // if(req.body?.username === 'admin' && req.body?.password === 'admin123') passwordIsValid = true
      // else passwordIsValid = user.password === req.body?.password
      // passwordIsValid = user.password === req.body?.password
      
      // Chamando bcrypt.compare() para verificar se o hash da senha
      // enviada coincide com o hash da senha armazenada no BD
      passwordIsValid = await bcrypt.compare(req.body?.password, user.password)

      // Se a senha estiver errada, retorna
      // HTTP 401: Unauthorized
      if(! passwordIsValid) return res.status(401).end()

      // Remove o campo "password" do objeto "user" antes
      // de usá-lo no token e na resposta da requisição
      delete user.password

      // Usuário e senha OK, passamos ao procedimento de gerar o token
      const token = jwt.sign(
        user,                       // Dados do usuário
        process.env.TOKEN_SECRET,   // Senha para criptografar o token
        { expiresIn: '24h' }        // Prazo de validade do token
      )

      // Formamos o cookie para enviar ao front-end
      res.cookie(process.env.AUTH_COOKIE_NAME, token, {
        httpOnly: true, // O cookie ficará inacessível para o JS no front-end
        secure: true,   // O cookie será criptografado em conexões https
        sameSite: 'None',
        path: '/',
        maxAge: 24 * 60 * 60 * 100  // 24h
      })

      // Retorna o token e o usuário autenticado com
      // HTTP 200: OK (implícito)
      res.send({user})

  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.logout = function(req, res) {
  // Apaga no front-end o cookie que armazena o token
  res.clearCookie(process.env.AUTH_COOKIE_NAME)
  // HTTP 204: No Content
  res.status(204).end()
}

controller.me = function(req, res) {
  // Retorna as informações do usuário autenticado
  // HTTP 200: OK (implícito)
  res.send(req?.authUser)
}

export default controller