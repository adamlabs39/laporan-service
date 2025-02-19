import { ZodError } from "zod"

const errorMiddleware = (error, request, response, nextFunction) => {
  console.error("ERR: ", error)
  if (error instanceof ZodError) response.status(400).json({ message: error.errors })
  response.status(500).json({ message: error.message })
}

export default errorMiddleware
