import { useState, useEffect, useCallback } from "react";
import { barberService, type Barber } from "../services/getBarbers";

/**
 * Hook customizado para gerenciar a listagem e os estados dos barbeiros.
 */
export function useBarber() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função para permitir recarregamento manual (refetch) na interface,
   * envolvida por useCallback para evitar recriações de função em memória.
   */
  const fetchBarbers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await barberService.getActiveBarbers();
      setBarbers(data);
    } catch (err) {
      console.error("Erro ao carregar barbeiros:", err);
      setError("Não foi possível carregar a lista de barbeiros.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * useEffect executado na montagem do componente.
   */
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data = await barberService.getActiveBarbers();

        // Evita atualizar o estado caso o componente tenha sido desmontado
        if (isMounted) {
          setBarbers(data);
        }
      } catch (err) {
        console.error("Erro ao carregar barbeiros:", err);
        if (isMounted) {
          setError("Não foi possível carregar a lista de barbeiros.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    // Função de limpeza (cleanup) para evitar vazamento de memória e re-renders
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    barbers,
    loading,
    error,
    refetch: fetchBarbers,
  };
}