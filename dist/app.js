"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
// Carrega as variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
// Rotas
app.use("/api", routes_1.default);
// Rota de saúde para verificar se o servidor está rodando
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Servidor está rodando" });
});
const PORT = process.env.PORT || 3000;
// Inicia o servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Aplicação continua rodando, mas registra o erro
});
exports.default = server;
