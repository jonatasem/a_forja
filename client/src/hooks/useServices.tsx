import { useState, useEffect, useCallback } from "react";
import { getService, type ServiceProps } from "../services/getServices";

/**
 * Hook customizado para gerenciar a listagem e os estados dos serviços da barbearia.
 */
export function useServices() {
  const [services, setServices] = useState<ServiceProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função para permitit recarregamento manual (refetch) na interface.
   */
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getService.getActiveServices();
      setServices(data);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      setError("Não foi possível carregar a lista de serviços.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * useEffect executado na montagem do componente com proteção contra vazamento de memória.
   */
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getService.getActiveServices();

        if (isMounted) {
          setServices(data);
        }
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
        if (isMounted) {
          setError("Não foi possível carregar a lista de serviços.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
}