import { buildApp } from "./app.js";

// Cria uma função assíncrona chamada "start" que é responsável por iniciar o servidor Fastify.
const start = async () => {
  try {
    const app = await buildApp();
    const port = process.env.PORT;

    // Escuta o servidor Fastify na porta especificada na variável de ambiente PORT e no host
    await app.listen({
      port: Number(port),
      host: "0.0.0.0",
    });

    // Servidor iniciado com sucesso
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    // Em caso de erro durante a inicialização do servidor, o erro é capturado e exibido no console, e o processo é encerrado com um código de saída 1.
    console.error(err);
    process.exit(1);
  }
};

// Executa a função "start" para iniciar o servidor Fastify.
start();