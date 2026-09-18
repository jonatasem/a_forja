import { useState, useCallback } from "react";
import { availableHoursService } from "../services/getAvailableHours";

export function useAvailableHours(barberId: string, serviceIds: string[]) {
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
        const data = await availableHoursService.getAvailableHours(
          barberId,
          serviceIds,
          selectedDate
        );
        setHours(data);
      } catch (error) {
        console.error("Erro ao buscar horários disponíveis:", error);
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