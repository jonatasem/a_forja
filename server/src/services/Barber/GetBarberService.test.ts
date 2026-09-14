import { GetBarberService } from "./GetBarberService.js";
import { prisma } from "../../prisma/index.js";

// Mock da instância do Prisma
jest.mock("../../prisma/index.js", () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
        },
    },
}));

describe("GetBarberService", () => {
    let getBarberService: GetBarberService;

    beforeEach(() => {
        getBarberService = new GetBarberService();
        jest.clearAllMocks(); // Limpa chamadas anteriores entre os testes
    });

    it("deve retornar a lista de barbeiros que não estão inativos", async () => {
        // Dados simulados que o banco retornaria
        const mockBarbers = [
            { id: "1", name: "Carlos", role: "barber", status: "ativo" },
            { id: "2", name: "Ana", role: "barber", status: "ativo" },
        ];

        // Define o retorno simulado do método findMany
        (prisma.user.findMany as jest.Mock).mockResolvedValue(mockBarbers);

        const result = await getBarberService.execute();

        // Validações
        expect(result).toEqual(mockBarbers);
        expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.user.findMany).toHaveBeenCalledWith({
            where: {
                role: "barber",
                status: {
                    not: "inativo"
                }
            },
            select: {
                id: true,
                role: true,
                status: true,
                name: true,
            }
        });
    });

    it("deve repassar o erro caso o Prisma lance uma exceção", async () => {
        (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("Database error"));

        await expect(getBarberService.execute()).rejects.toThrow("Database error");
    });
});