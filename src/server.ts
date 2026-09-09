import { buildApp } from "./app.js";

// Função assíncrona responsável por iniciar o servidor Fastify.
const start = async () => {
  try {
    const app = await buildApp();
    const port = process.env.PORT;

    // Escuta o servidor
    await app.listen({
      port: Number(port),
      host: "0.0.0.0",
    });

    // Iniciado com sucesso
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    // Captura o erro e exibe no console, e o processo é encerrado com um código de saída 1.
    console.error(err);
    process.exit(1);
  }
};

// Inicia o servidor.
start();