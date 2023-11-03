import { FastifyReply, FastifyRequest } from "fastify"

export function checkSessionIDExists(req: FastifyRequest, res: FastifyReply) {
  const {sessionId} = req.cookies

  console.log({
    Title: "Teste",
    Content: req.cookies
  })

  if(!sessionId){
    return res.status(401).send({
      error: 'Unauthorized'
    })
  }
  
}