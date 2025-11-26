import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import api from '../lib/api';

export interface Perfil {
  id: string;
  nomeCompleto: string;
  email: string;
  membroDesde: string;
  statusConta: string;
  updatedAt: string;
  telegramId?: string;
  telegramUsername?: string;
  plano: {
    id: string;
    nome: string;
    preco: number;
    limiteApostasDiarias: number;
  };
}

interface PerfilContextType {
  perfil: Perfil | null;
  loading: boolean;
  erro: string | null;
  atualizarPerfil: () => Promise<void>;
}

const PerfilContext = createContext<PerfilContextType | undefined>(undefined);

export const usePerfil = () => {
  const ctx = useContext(PerfilContext);
  if (!ctx) throw new Error('usePerfil deve ser usado dentro do PerfilProvider');
  return ctx;
};

export const PerfilProvider = ({ children }: { children: ReactNode }) => {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Memoizar função para evitar re-criação e re-renders desnecessários
  const atualizarPerfil = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      // Verificar se há token antes de fazer requisição
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const { data } = await api.get<Perfil>('/perfil');
      setPerfil(data);
    } catch (err: unknown) {
      // Não mostrar erro se for 401 (não autenticado) - isso é normal em algumas páginas
      const apiError = err as { response?: { status?: number } };
      if (apiError.response?.status !== 401) {
        setErro('Erro ao carregar perfil');
        console.warn('Erro ao carregar perfil:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Só carregar perfil se estiver em uma rota que precisa (não em /telegram/*)
    if (!window.location.pathname.startsWith('/telegram/')) {
      void atualizarPerfil();
    } else {
      setLoading(false);
    }
  }, [atualizarPerfil]);

  // Memoizar valor do contexto para evitar re-renders quando valores não mudam
  const contextValue = useMemo(
    () => ({ perfil, loading, erro, atualizarPerfil }),
    [perfil, loading, erro, atualizarPerfil]
  );

  return (
    <PerfilContext.Provider value={contextValue}>
      {children}
    </PerfilContext.Provider>
  );
};
