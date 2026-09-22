import { buildApp } from "./app.js";
import type { FastifyInstance } from "fastify";

// dotenv.config({ quiet: true });

describe("Inicialização da aplicação e rotas", () => {
  // Simula a instancia app do Fastify
  let app: FastifyInstance;
  // Simula as variaveis de ambiente originais para restaurá-las após os testes, garantindo que os testes não afetem o ambiente global.
  const originalEnv = process.env;

  // Garante que as variáveis de ambiente necessárias para os testes estejam definidas ANTES (BEFORE ALL) de cada teste, garantindo que a aplicação seja inicializada corretamente.
  beforeAll(async () => {
    process.env.URL_DEVELOP = "http://localhost:5173";

    app = await buildApp();
    await app.ready();
  });

  // Garante que a instância do aplicativo Fastify seja fechada e as variáveis de ambiente originais sejam restauradas APÓS (AFTER) todos os testes, garantindo que os testes não afetem o ambiente global.
  afterAll(async () => {
    await app.close();
    process.env = originalEnv;
  });

  // Garante que as variáveis de ambiente necessárias para os testes estejam definidas ANTES (BEFORE EACH) de cada teste, garantindo que a aplicação seja inicializada corretamente.
  beforeEach(() => {
    // Garante ambiente limpo e padronizado antes de cada teste
    process.env.URL_DEVELOP = "http://localhost:5173";
  });

  // Deve lançar erro se a variável de ambiente URL_DEVELOP não estiver informada
  it("deve lançar erro se URL_DEVELOP não estiver informada", async () => {
    delete process.env.URL_DEVELOP;

    // Espera que a função buildApp lance um erro com a mensagem "Informe a url do frontend."
    await expect(buildApp()).rejects.toThrow("Informe a URL_DEVELOP do frontend.");
  });
});