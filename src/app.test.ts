import { buildApp } from "./app.js";
import type { FastifyInstance } from "fastify";

describe("Inicialização da aplicação e rotas", () => {
  // Simula a instancia app do Fastify para ser usada nos testes, garantindo que cada teste tenha um ambiente limpo e padronizado.
  let app: FastifyInstance;
  // Simula as variaveis de ambiente originais para restaurá-las após os testes, garantindo que os testes não afetem o ambiente global.
  const originalEnv = process.env;

  // Garante que as variáveis de ambiente necessárias para os testes estejam definidas ANTES (BEFORE) de cada teste, garantindo que a aplicação seja inicializada corretamente.
  beforeAll(async () => {
    process.env.URL_DEVELOP = "http://localhost:5173";
    process.env.PORT = "3333";

    app = await buildApp();
    await app.ready();
  });

  // Garante que a instância do aplicativo Fastify seja fechada e as variáveis de ambiente originais sejam restauradas APÓS (AFTER) todos os testes, garantindo que os testes não afetem o ambiente global.
  afterAll(async () => {
    await app.close();
    process.env = originalEnv;
  });

  // Garante que as variáveis de ambiente necessárias para os testes estejam definidas ANTES (BEFORE) de cada teste, garantindo que a aplicação seja inicializada corretamente.
  beforeEach(() => {
    // Garante ambiente limpo e padronizado antes de cada teste
    process.env.URL_DEVELOP = "http://localhost:5173";
    process.env.PORT = "3333";
  });

  // Testa se a rota GET /teste responde com sucesso
  it("deve responder com sucesso na rota GET /teste", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/teste",
    });

    // Espera que o código de status da resposta seja 200 (OK)
    expect(response.statusCode).toBe(200);
    // Espera que o corpo da resposta seja igual a { ok: "ok" }
    expect(response.json()).toEqual({ ok: "ok" });
  });

  // Deve lançar erro se a variável de ambiente URL_DEVELOP não estiver informada
  it("deve lançar erro se URL_DEVELOP não estiver informada", async () => {
    delete process.env.URL_DEVELOP;

    // Espera que a função buildApp lance um erro com a mensagem "Informe a url do frontend."
    await expect(buildApp()).rejects.toThrow("Informe a url do frontend.");
  });

  // Deve lançar erro se a variável de ambiente PORT não estiver informada
  it("deve lançar erro se a PORT não estiver informada", async () => {
    delete process.env.PORT;

    // Espera que a função buildApp lance um erro com a mensagem "Informe uma porta para o backend."
    await expect(buildApp()).rejects.toThrow("Informe uma porta para o backend.");
  });
});