import { useState, useCallback } from "react";
import { workLoadService } from "../services/workLoadService";

export function useWorkLoad(barberId: string, serviceIds: string[]) {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    async (selectedDate: string) => {
      setDate(selectedDate);

      // Trava de segurança: Se faltar barbeiro, data ou se nenhum serviço for selecionado
      if (!selectedDate || !barberId || serviceIds.length === 0) {
        setHours([]);
        return;
      }

      setLoading(true);

      try {
        const data = await workLoadService.listWorkLoadService(
          barberId,
          serviceIds,
          selectedDate
        );
        setHours(data);
      } catch (error) {
        console.error("Erro ao buscar carga de horários disponíveis:", error);
        setHours([]);
      } finally {
        setLoading(false);
      }
    },
    [barberId, serviceIds]
  );

  return {
    date,
    hours,
    loading,
    handleSearch,
  };
}
