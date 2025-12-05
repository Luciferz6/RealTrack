import { useCallback, useEffect, useState } from 'react';

interface UseChartContainerOptions {
  minHeight?: number;
  minWidth?: number;
}

interface ChartContainerDimensions {
  width: number;
  height: number;
}

/**
 * Observa o container de um gráfico e só libera o render quando ele possui dimensões válidas.
 * Evita warnings do Recharts quando o container está oculto ou com tamanho zero.
 */
export function useChartContainer(options: UseChartContainerOptions = {}) {
  const { minHeight = 120, minWidth = 120 } = options;
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [hasSize, setHasSize] = useState(false);
  const [dimensions, setDimensions] = useState<ChartContainerDimensions>({ width: 0, height: 0 });

  const containerRef = useCallback((element: HTMLDivElement | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    const element = node;
    if (!element) {
      setHasSize(false);
      setDimensions({ width: 0, height: 0 });
      return;
    }

    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      const rect = element.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      setHasSize(true);
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
      setHasSize(width >= minWidth && height >= minHeight);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [node, minHeight, minWidth]);

  return { containerRef, hasSize, dimensions };
}

export type UseChartContainerResult = ReturnType<typeof useChartContainer>;
