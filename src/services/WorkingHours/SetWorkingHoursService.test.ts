import { SetWorkingHoursService } from './SetWorkingHoursService.js';
import { prisma } from '../../prisma/index.js';

describe('SetWorkingHoursService', () => {
  let barberId: string;

  beforeAll(async () => {
    const barber = await prisma.barber.create({
      data: {
        name: 'Barbeiro Teste',
        email: 'barbeiro.teste@email.com',
        phone: '11988887777',
        password: 'password123',
      },
    });
    barberId = barber.id;
  });

  afterAll(async () => {
    await prisma.workingHours.deleteMany({ where: { barberId } });
    await prisma.barber.delete({ where: { id: barberId } });
  });

  it('deve cadastrar o horário de trabalho com sucesso', async () => {
    const service = new SetWorkingHoursService();

    const result = await service.execute({
      barberId,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '18:00',
      breakStart: '12:00',
      breakEnd: '13:00',
    });

    expect(result).toHaveProperty('id');
    expect(result.barberId).toBe(barberId);
    expect(result.startTime).toBe('08:00');
  });

  it('deve lançar erro caso o barbeiro não exista', async () => {
    const service = new SetWorkingHoursService();

    await expect(
      service.execute({
        barberId: '60c72b2f9b1d8b2b3c4d5e6f',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '18:00',
      })
    ).rejects.toThrow('Barbeiro não encontrado.');
  });
});