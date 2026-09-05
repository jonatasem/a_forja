import { buildApp } from "./app.js";

const start = async () => {
  try {
    const app = await buildApp();
    const port = process.env.PORT;

    await app.listen({
      port: Number(port),
      host: "0.0.0.0",
    });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();