import fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./routes/index.js";
import dotenv from "dotenv";
const app = fastify({
    logger: false,
});
// Carrega as variáveis do arquivo .env para o process.env
dotenv.config();
// Variavel de ambiente para o frontend
const urlDevelop = process.env.URL_DEVELOP;
const port = process.env.PORT;
if (!urlDevelop) {
    throw new Error("Informe a url do frontend.");
}
if (!port) {
    throw new Error("Informe uma porta para o backend.");
}
const start = async () => {
    await app.register(cors, {
        origin: urlDevelop,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    await app.register(routes);
    try {
        await app.listen({
            port: Number(port),
            host: "0.0.0.0", // Permite que o servidor seja acessado de qualquer endereço IP
        });
        console.log(`Server is running on port ${port}`);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map