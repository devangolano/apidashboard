import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes"
import path from 'path'
import fs from 'fs'

// Carrega as variáveis de ambiente
dotenv.config()

const app = express()

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('Diretório de uploads criado:', uploadsDir)
}

// Aplicar CORS para todas as rotas
app.use(cors())

// Middleware para parsing de JSON e dados de formulário
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  if (req.method !== 'GET') {
    console.log('Body:', req.body)
  }
  next()
})

// Middleware para servir arquivos estáticos (DEVE VIR ANTES DAS ROTAS DA API)
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path, stat) => {
    res.set('X-Content-Type-Options', 'nosniff')
  }
}))

// Rotas da API
app.use("/api", routes)

// Rota de saúde para verificar se o servidor está rodando
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Servidor está rodando",
    uploadsDir: uploadsDir
  })
})

const PORT = process.env.PORT || 3000

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log('Diretório de uploads:', uploadsDir)
})

// Middleware de tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
  // Aplicação continua rodando, mas registra o erro
})

export default server