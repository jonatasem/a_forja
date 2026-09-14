import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserService } from "../../services/User/CreateUserService.js";
import { z } from "zod";

export const createUserSchema = z.object({
  // z.string().min(1) garante que o campo seja texto e não seja enviado vazio ("")
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  phone: z.string().min(1, { message: "O telefone é obrigatório" }),
  
  // Valida se o texto possui o formato "usuario@dominio.com"
  email: z.email({ message: "Formato de e-mail inválido" }),
  
  // min(6) bloqueia senhas curtas, adicionando uma camada extra de segurança
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

// Se adicionar um campo novo no schema acima, a tipagem 'CreateUserProps' atualiza sozinha!
export type CreateUserProps = z.infer<typeof createUserSchema>;

export class CreateUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    /**
     * VALIDAÇÃO SILENCIOSA (safeParse)
     * O método .safeParse() analisa o corpo da requisição (request.body).
     * Diferente do .parse() tradicional, o safeParse NÃO derruba o seu servidor se houver erro.
     * Ele apenas retorna um objeto contendo { success: true/false } 
     */
    const result = createUserSchema.safeParse(request.body);

    /**
     * Se result.success for FALSE, significa que o usuário enviou algum dado incorreto ou omitiu campos.
     */
    if (!result.success) {
      
      /**
       * APANHAR E ORGANIZAR OS ERROS (z.flattenError)
       * O Zod gera um log estruturado por padrão. 
       * O método global z.flattenError pega esse log e limpa ele, extraindo o 'fieldErrors'.
       * O 'fieldErrors' gera um objeto limpo e direto no formato: { email: ["Mensagem de erro"] }.
       */
      const { fieldErrors } = z.flattenError(result.error);

      // Retorna o status 400 (Bad Request) enviando exatamente quais campos falharam para o front-end
      return reply.status(400).send({
        error: "Dados de requisição inválidos.",
        details: fieldErrors, 
      });
    }

    /**
     * CAPTURA DOS DADOS HIGIENIZADOS e VALIDADOS
     * Sempre pegue os dados de dentro de 'result.data' e não diretamente de 'request.body'.
     * O 'result.data' garante que apenas os campos validados entrem (ignora propriedades maliciosas extras).
     */
    const { name, phone, email, password } = result.data;

    try {
        const createUserService = new CreateUserService();
        // Executa o serviço repassando as variáveis 100% seguras e tipadas
        await createUserService.execute({ name, phone, email, password });
        
        return reply
          .status(201)
          .send({ message: "Usuário criado com sucesso." });
    } catch (error) {
      if (error instanceof Error) {
        return reply
          .status(400)
          .send({ error: error.message });
      }
      return reply
        .status(500)
        .send({ error: "Erro interno no servidor." });
    }
  } 
}