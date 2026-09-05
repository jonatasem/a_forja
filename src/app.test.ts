import { buildApp } from "./app.js";
import type { FastifyInstance } from "fastify";

describe("Inicialização da aplicação e rotas", () => {
  let app: FastifyInstance;
  const originalEnv = process.env;

  beforeAll(async () => {
    process.env.URL_DEVELOP = "http://localhost:5173";
    process.env.PORT = "3333";

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    process.env = originalEnv; // Restaura as variáveis de ambiente originais ao final
  });

  beforeEach(() => {
    // Garante ambiente limpo e padronizado antes de cada teste
    process.env.URL_DEVELOP = "http://localhost:5173";
    process.env.PORT = "3333";
  });

  it("deve responder com sucesso na rota GET /teste", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/teste",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: "ok" });
  });

  it("deve lançar erro se URL_DEVELOP não estiver informada", async () => {
    delete process.env.URL_DEVELOP;

    await expect(buildApp()).rejects.toThrow("Informe a url do frontend.");
  });

  it("deve lançar erro se a PORT não estiver informada", async () => {
    delete process.env.PORT;

    await expect(buildApp()).rejects.toThrow("Informe uma porta para o backend.");
  });
});