export async function routes(fastify) {
    fastify.get("/teste", async (request, reply) => {
        return { ok: "ok" };
    });
}
//# sourceMappingURL=index.js.map