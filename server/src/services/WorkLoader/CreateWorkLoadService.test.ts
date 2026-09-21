import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { CreateWorkLoadService } from "./CreateWorkLoadService.js";
import { prisma } from "../../prisma/index.js";

describe("CreateWorkLoadService", () => {
  let createWorkLoadService: CreateWorkLoadService;

  beforeEach(() => {
    jest.restoreAllMocks();
    createWorkLoadService = new CreateWorkLoadService();
  });

  // dados simulados
  const mockPayload = {
    barberId: "barber-123",
    dayOfWeek: 1, // Segunda-feira
    startTime: "08:00",
    endTime: "18:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    userRole: "barber",
  };

  // Fluxo Principal de Sucesso
  it("deve criar um horário de trabalho com sucesso", async () => {
    // Dados de apoio para simular as respostas do banco
    const mockBarber = { id: "barber-123", name: "Barbeiro Teste", role: "barber" };
    // inclui um id para objeto completo
    const mockCreatedWorkLoad = { id: "workload-1", ...mockPayload };

    // Intercepta e simula o comportamento dos métodos do Prisma

    // Simula que o barbeiro existe
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockBarber as any);
    // Simula que NÃO há horário cadastrado para segunda-feira 
    jest.spyOn(prisma.workLoad, "findUnique").mockResolvedValue(null);          
    // Simula a criação bem-sucedida do registro
    jest.spyOn(prisma.workLoad, "create").mockResolvedValue(mockCreatedWorkLoad as any); 

    // Executa a função principal do serviço passando o payload válido
    const result = await createWorkLoadService.execute(mockPayload);

    // Valida se a busca do barbeiro foi chamada com a chave primária correta
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockPayload.barberId },
    });

    // Valida se a busca do horário existente utilizou o índice composto (barberId + dayOfWeek)
    expect(prisma.workLoad.findUnique).toHaveBeenCalledWith({
      where: {
        barberId_dayOfWeek: {
          barberId: mockPayload.barberId,
          dayOfWeek: mockPayload.dayOfWeek,
        },
      },
    });

    // Valida se a inserção no banco foi chamada com os parâmetros corretos
    expect(prisma.workLoad.create).toHaveBeenCalledWith({
      data: {
        barberId: mockPayload.barberId,
        dayOfWeek: mockPayload.dayOfWeek,
        startTime: mockPayload.startTime,
        endTime: mockPayload.endTime,
        breakStart: mockPayload.breakStart,
        breakEnd: mockPayload.breakEnd,
      },
    });

    // Valida se o retorno da função é exatamente o objeto criado no banco
    expect(result).toEqual(mockCreatedWorkLoad);
  });

  // Falha por Permissão de Usuário
  it("deve lançar um erro se a role não for de gestão/barbeiro", async () => {
    // Sobrescreve a role para simular um cliente comum tentando cadastrar o horário
    const payloadClientRole = { ...mockPayload, userRole: "client" };

    // Valida se a exceção com a mensagem de erro esperada é disparada
    await expect(createWorkLoadService.execute(payloadClientRole)).rejects.toThrow(
      "Apenas administradores ou barbeiros podem cadastrar horários."
    );
  });

  // Falha quando o Barbeiro informado não existe
  it("deve lançar um erro se o barbeiro não for encontrado no banco", async () => {
    // Intercepta a busca e simula que o ID informado não foi localizado
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

    // Valida o disparo da exceção do serviço
    await expect(createWorkLoadService.execute(mockPayload)).rejects.toThrow(
      "Barbeiro não encontrado."
    );
  });

  // Falha por duplicidade no mesmo dia da semana
  it("deve lançar um erro se já existir um horário cadastrado para aquele dia", async () => {
    const mockBarber = { id: "barber-123", name: "Barbeiro Teste", role: "barber" };
    const mockExistingWorkLoad = { id: "workload-1", ...mockPayload };

    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockBarber as any);
    
    // Simula que JÁ EXISTE um registro de horário cadastrado para esse barbeiro nessa segunda-feira
    jest.spyOn(prisma.workLoad, "findUnique").mockResolvedValue(mockExistingWorkLoad as any);

    // CRUCIAL: Espiona o método create para o Jest conseguir verificar se ele foi chamado ou não
    const createSpy = jest.spyOn(prisma.workLoad, "create");

    // Valida se o erro de duplicidade é retornado
    await expect(createWorkLoadService.execute(mockPayload)).rejects.toThrow(
      "Já existe um horário cadastrado para este dia da semana. Use a opção de atualizar."
    );

    // Garante que o método 'create' do Prisma NÃO foi executado após a falha da validação
    expect(createSpy).not.toHaveBeenCalled();
  });
});
