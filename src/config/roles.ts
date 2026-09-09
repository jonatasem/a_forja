export const MANAGEMENT_ROLES = ["barber"];

export function isManagement(role?: string): boolean {
  if (!role) return false;
  
  // Normaliza o texto: remove acentos, converte para minúsculo e remove espaços
  const normalizedRole = role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return MANAGEMENT_ROLES.includes(normalizedRole);
}