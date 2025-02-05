import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes"

// Carrega as variáveis de ambiente
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Rotas
app.use("/api", routes)

// Rota de saúde para verificar se o servidor está rodando
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Servidor está rodando" })
})

const PORT = process.env.PORT || 3000

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
  // Aplicação continua rodando, mas registra o erro
})

export default server

