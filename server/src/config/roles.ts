export const MANAGEMENT_ROLES = ["barber"];

export function isManagement(role?: string): boolean {
  if (!role) return false; // Se o role for diferente de barber, retorna falso
  
  // Normaliza o texto: remove acentos, converte para minúsculo e remove espaços
  const normalizedRole = role
    .normalize("NFD") // separa acento das letras (ex: "Á" vira "A" + "´")
    .replace(/[\u0300-\u036f]/g, "") // Remove todos os acentos que foram separados na etapa anterior
    .toLowerCase() // Converte todo o texto para letras minúsculas (ex: "CLIENTE" vira "cliente")
    .trim(); // Remove espaços em branco no início e no final da string
    
  return MANAGEMENT_ROLES.includes(normalizedRole); // retorna o role formatado
}