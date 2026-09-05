import fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();

export async function buildApp() {
  const app = fastify({
    logger: false,
  });

  const urlDevelop = process.env.URL_DEVELOP;
  const port = process.env.PORT;

  if (!urlDevelop) {
    throw new Error("Informe a url do frontend.");
  }

  if (!port) {
    throw new Error("Informe uma porta para o backend.");
  }

  await app.register(cors, {
    origin: urlDevelop,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(routes);

  return app;
}