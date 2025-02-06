import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes"

// Carrega as variáveis de ambiente
dotenv.config()

const app = express()

// Configuração do CORS
const corsOptions = {
  origin: ['https://dashboard-six-weld-47.vercel.app', 'http://localhost:5173', '*'], // Adicionado '*' para teste
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}

// Middleware para logging detalhado de requisições CORS
app.use((req, res, next) => {
  console.log('CORS Request:');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  next();
});

// Aplicar CORS para todas as rotas
app.use(cors(corsOptions))

// Lidar explicitamente com requisições OPTIONS
app.options('*', cors(corsOptions));

// Middleware para parsing de JSON e dados de formulário
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  console.log('Body:', req.body)
  next()
})

// Rotas da API
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