import { useState, useEffect, useCallback } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from 'recharts';
import { Filter } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { GlassCard } from '../components/ui/GlassCard';
import FilterPopover from '../components/FilterPopover';
import DateInput from '../components/DateInput';
import { CASAS_APOSTAS } from '../constants/casasApostas';
import { STATUS_APOSTAS } from '../constants/statusApostas';
import api from '../lib/api';
import { useTipsters } from '../hooks/useTipsters';
import { chartTheme } from '../utils/chartTheme';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type {
  AnaliseFilters,
  AnalisePerformanceResponse,
  AnaliseQueryParams,
  AnaliseBookmakerComparison,
  AnaliseOddDistribution,
  AnaliseRoiEntry,
  AnaliseWinRatePorEsporte,
  HeatmapData,
} from '../types/analise';

const heatmapRows = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const heatmapCols = ['Manhã (06-12)', 'Tarde (12-18)', 'Noite (18-24)', 'Madrugada (00-06)'];
const defaultHeatmap: HeatmapData = {};
const defaultDistribuicaoOdds: AnaliseOddDistribution[] = [
  { faixa: '1.00-1.50', quantidade: 0 },
  { faixa: '1.51-2.00', quantidade: 0 },
  { faixa: '2.01-3.00', quantidade: 0 },
  { faixa: '3.01-5.00', quantidade: 0 },
  { faixa: '5.01+', quantidade: 0 },
];
const initialFilters: AnaliseFilters = {
  status: '',
  tipster: '',
  casa: '',
  esporte: '',
  evento: '',
  dataInicio: '',
  dataFim: '',
  oddMin: '',
  oddMax: '',
};

export default function Analise() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { tipsters } = useTipsters();
  const [pendingFilters, setPendingFilters] = useState<AnaliseFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<AnaliseFilters>(initialFilters);
  const [evolucaoRoiMensal, setEvolucaoRoiMensal] = useState<AnaliseRoiEntry[]>([]);
  const [distribuicaoOdds, setDistribuicaoOdds] = useState<AnaliseOddDistribution[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData>(defaultHeatmap);
  const [comparacaoBookmakers, setComparacaoBookmakers] = useState<AnaliseBookmakerComparison[]>([]);
  const [winRatePorEsporte, setWinRatePorEsporte] = useState<AnaliseWinRatePorEsporte[]>([]);
  const [bookmakersExpanded, setBookmakersExpanded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      try {
        const params: AnaliseQueryParams = {};

        if (appliedFilters.status && appliedFilters.status !== 'Tudo') {
          params.status = appliedFilters.status;
        }
        if (appliedFilters.tipster) {
          params.tipster = appliedFilters.tipster;
        }
        if (appliedFilters.casa) {
          params.casa = appliedFilters.casa;
        }
        if (appliedFilters.esporte) {
          params.esporte = appliedFilters.esporte;
        }
        if (appliedFilters.evento) {
          params.evento = appliedFilters.evento;
        }
        if (appliedFilters.dataInicio) {
          params.dataInicio = appliedFilters.dataInicio;
        }
        if (appliedFilters.dataFim) {
          params.dataFim = appliedFilters.dataFim;
        }
        if (appliedFilters.oddMin) {
          params.oddMin = appliedFilters.oddMin;
        }
        if (appliedFilters.oddMax) {
          params.oddMax = appliedFilters.oddMax;
        }

        const { data } = await api.get<AnalisePerformanceResponse>('/analise/performance', { params });
        if (isCancelled) return;

        setEvolucaoRoiMensal(data.evolucaoRoiMensal ?? []);
        setDistribuicaoOdds(data.distribuicaoOdds ?? []);
        setHeatmap(data.heatmap ?? defaultHeatmap);
        setComparacaoBookmakers(data.comparacaoBookmakers ?? []);
        setWinRatePorEsporte(data.winRatePorEsporte ?? []);
      } catch (error) {
        if (!isCancelled) {
          console.error('Erro ao carregar dados de performance:', error);
        }
      }
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, [appliedFilters]);

  const handleFilterChange = useCallback(
    <K extends keyof AnaliseFilters>(field: K, value: AnaliseFilters[K]) => {
      setPendingFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
    setFiltersOpen(false);
  }, [pendingFilters]);

  const handleClearFilters = useCallback(() => {
    setPendingFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFiltersOpen(false);
  }, []);

  const activeFiltersCount = Object.values(pendingFilters).filter((value) => value !== '').length;

  // Preparar dados para gráfico de ROI mensal
  const roiMensalChart = evolucaoRoiMensal.map(item => ({
    mes: new Date(item.mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    roi: item.roi
  }));

  // Preparar dados para distribuição de odds
  const oddsChart = (distribuicaoOdds.length > 0 ? distribuicaoOdds : defaultDistribuicaoOdds);

  // Função para obter cor do heatmap baseado no ROI
  const getHeatmapColor = (roi: number): string => {
    if (roi > 10) return 'var(--color-success)'; // Verde - ROI muito positivo
    if (roi > 0) return 'var(--color-warning-yellow)'; // Verde claro - ROI positivo
    if (roi > -10) return 'var(--color-warning-light)'; // Amarelo - ROI próximo de zero
    return 'var(--color-danger)'; // Vermelho - ROI negativo
  };

  const getHeatmapOpacity = (roi: number, investido: number): number => {
    if (investido === 0) return 0.1;
    const absRoi = Math.abs(roi);
    return Math.min(0.3 + (absRoi / 50) * 0.7, 1);
  };

  // Calcular estatísticas filtradas (por enquanto usando dados totais)
  const totalApostas = distribuicaoOdds.reduce((sum, item) => sum + item.quantidade, 0);
  const totalInvestido = comparacaoBookmakers.reduce((sum, item) => sum + item.investido, 0);
  const totalLucro = comparacaoBookmakers.reduce((sum, item) => sum + item.resultado, 0);
  const roiMedio = totalInvestido > 0 ? (totalLucro / totalInvestido) * 100 : 0;

  const stats = [
    { title: 'Apostas Filtradas', value: totalApostas.toString(), helper: 'Total de apostas' },
    { title: 'Investimento Filtrado', value: formatCurrency(totalInvestido), helper: 'Total investido' },
    { title: 'Lucro Filtrado', value: formatCurrency(totalLucro), helper: 'Lucro/prejuízo total' },
    { title: 'ROI Filtrado', value: formatPercent(roiMedio), helper: 'Retorno sobre investimento' }
  ];

  return (
    <div>
      <PageHeader
        title="Gráficos"
        subtitle="Visualize suas métricas e acompanhe evolução"
        actions={
          <div className="filter-trigger-wrapper">
            <button className="filter-trigger" onClick={() => setFiltersOpen((prev) => !prev)}>
              <Filter size={16} /> Filtros {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
            </button>
            <FilterPopover
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              onClear={handleClearFilters}
              footer={
                <button className="btn" onClick={handleApplyFilters}>
                  Aplicar Filtros
                </button>
              }
            >
              <div className="filters-panel filters-panel--plain filters-panel--two">
                <div className="field">
                  <label>Status</label>
                  <select 
                    value={pendingFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    style={{ color: pendingFilters.status ? 'var(--text)' : 'var(--muted)' }}
                  >
                    <option value="" disabled hidden>Selecione um status</option>
                    {STATUS_APOSTAS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Tipsters</label>
                  <select 
                    value={pendingFilters.tipster}
                    onChange={(e) => handleFilterChange('tipster', e.target.value)}
                    style={{ color: pendingFilters.tipster ? 'var(--text)' : 'var(--muted)' }}
                  >
                    <option value="" disabled hidden>Selecione…</option>
                    {tipsters.filter(t => t.ativo).map((tipster) => (
                      <option key={tipster.id} value={tipster.nome}>
                        {tipster.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Casa de Apostas</label>
                  <select 
                    value={pendingFilters.casa}
                    onChange={(e) => handleFilterChange('casa', e.target.value)}
                    style={{ color: pendingFilters.casa ? 'var(--text)' : 'var(--muted)' }}
                  >
                    <option value="" disabled hidden>Selecione a casa</option>
                    {CASAS_APOSTAS.map((casa) => (
                      <option key={casa} value={casa}>
                        {casa}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Evento, Mercado, Aposta, País ou Torneio</label>
                  <input 
                    type="text" 
                    value={pendingFilters.evento}
                    onChange={(e) => handleFilterChange('evento', e.target.value)}
                    placeholder="Digite o nome do evento, mercado ou aposta" 
                  />
                </div>
                <div className="field">
                  <label>Data do Jogo (De)</label>
                  <DateInput
                    value={pendingFilters.dataInicio}
                    onChange={(value) => handleFilterChange('dataInicio', value)}
                    placeholder="dd/mm/aaaa"
                    className="date-input-modern"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      const root = getComputedStyle(document.documentElement);
                      const bankColor = root.getPropertyValue('--bank-color').trim() || getComputedStyle(document.documentElement).getPropertyValue('--color-chart-primary').trim();
                      const bankColorLight = root.getPropertyValue('--bank-color-light').trim() || getComputedStyle(document.documentElement).getPropertyValue('--color-bg-hover').trim();
                      e.target.style.borderColor = bankColor;
                      e.target.style.boxShadow = `0 0 0 3px ${bankColorLight}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div className="field">
                  <label>Data do Jogo (Até)</label>
                  <DateInput
                    value={pendingFilters.dataFim}
                    onChange={(value) => handleFilterChange('dataFim', value)}
                    placeholder="dd/mm/aaaa"
                    className="date-input-modern"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      const root = getComputedStyle(document.documentElement);
                      const bankColor = root.getPropertyValue('--bank-color').trim() || getComputedStyle(document.documentElement).getPropertyValue('--color-chart-primary').trim();
                      const bankColorLight = root.getPropertyValue('--bank-color-light').trim() || getComputedStyle(document.documentElement).getPropertyValue('--color-bg-hover').trim();
                      e.target.style.borderColor = bankColor;
                      e.target.style.boxShadow = `0 0 0 3px ${bankColorLight}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '0.75rem', 
                    color: 'var(--muted)',
                    lineHeight: '1.4'
                  }}>
                    Se só preencher "De", será filtrado apenas nesta data. Se preencher "Até", será considerado como intervalo.
                  </p>
                </div>
                <div className="field">
                  <label>ODD</label>
                  <div className="field-inline">
                    <input 
                      type="number" 
                      value={pendingFilters.oddMin}
                      onChange={(e) => handleFilterChange('oddMin', e.target.value)}
                      placeholder="Mínimo" 
                      step="0.01"
                    />
                    <input 
                      type="number" 
                      value={pendingFilters.oddMax}
                      onChange={(e) => handleFilterChange('oddMax', e.target.value)}
                      placeholder="Máximo" 
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </FilterPopover>
          </div>
        }
      />

      <div className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} helper={stat.helper} />
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <h3 style={{ marginTop: 0 }}>Evolução do ROI Mensal</h3>
          <ResponsiveContainer width="100%" height={260}>
            {roiMensalChart.length > 0 ? (
              <LineChart data={roiMensalChart} margin={{ top: 5, right: 12, left: -6, bottom: 5 }}>
                <defs>
                  <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bank-color, var(--color-chart-primary))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--bank-color, var(--color-chart-primary))" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis 
                  dataKey="mes" 
                  stroke={chartTheme.axisStroke}
                  tick={{ ...chartTheme.axisTick }}
                  tickLine={false}
                />
                <YAxis 
                  stroke={chartTheme.axisStroke}
                  tick={{ ...chartTheme.axisTick }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', style: chartTheme.axisLabel }}
                />
                <Tooltip 
                  contentStyle={chartTheme.tooltip}
                  formatter={(value: number) => formatPercent(value)}
                  labelStyle={chartTheme.tooltipLabel}
                  itemStyle={chartTheme.tooltipItem}
                />
                <Line 
                  type="monotone" 
                  dataKey="roi" 
                  stroke="url(#roiGradient)" 
                  strokeWidth={3} 
                  dot={chartTheme.lineDot}
                  activeDot={chartTheme.lineActiveDot}
                />
              </LineChart>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              </div>
            )}
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3 style={{ marginTop: 0 }}>Distribuição de Odds</h3>
          <ResponsiveContainer width="100%" height={260}>
            {oddsChart.length > 0 && oddsChart.some(item => item.quantidade > 0) ? (
              <AreaChart data={oddsChart} margin={{ top: 5, right: 12, left: -6, bottom: 5 }}>
                <defs>
                  <linearGradient id="oddsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis 
                  dataKey="faixa" 
                  stroke={chartTheme.axisStroke}
                  tick={{ ...chartTheme.axisTick }}
                  tickLine={false}
                />
                <YAxis 
                  stroke={chartTheme.axisStroke}
                  tick={{ ...chartTheme.axisTick }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Qtd. Apostas', angle: -90, position: 'insideLeft', style: chartTheme.axisLabel }}
                />
                <Tooltip 
                  contentStyle={chartTheme.tooltip}
                  labelStyle={chartTheme.tooltipLabel}
                  itemStyle={chartTheme.tooltipItem}
                />
                <Area type="monotone" dataKey="quantidade" stroke="var(--color-success)" strokeWidth={3} fill="url(#oddsGradient)" />
              </AreaChart>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <h3 style={{ marginTop: 0 }}>Win Rate por Esporte</h3>
          {winRatePorEsporte.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart 
                data={winRatePorEsporte.slice(0, 10)} 
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.9}/>
                    <stop offset="50%" stopColor="var(--color-success-light)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-success-dark)" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
                <XAxis 
                  dataKey="esporte" 
                  stroke={chartTheme.axisStroke}
                  tick={{ ...chartTheme.axisTick }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tickLine={false}
                />
                <YAxis 
                  stroke={chartTheme.axisStroke}
                  tick={{ ...chartTheme.axisTick }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft', style: chartTheme.axisLabel }}
                />
                <Tooltip 
                  contentStyle={{ 
                    ...chartTheme.tooltip, 
                    border: '1px solid var(--color-border-success)'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'winRate') {
                      return [formatPercent(value), 'Win Rate'];
                    }
                    return [value, name === 'ganhas' ? 'Ganhas' : 'Total'];
                  }}
                  labelStyle={chartTheme.tooltipLabel}
                  itemStyle={chartTheme.tooltipItem}
                />
                <Bar 
                  dataKey="winRate" 
                  fill="url(#colorWinRate)" 
                  radius={chartTheme.barRadius}
                  animationDuration={800}
                  maxBarSize={32}
                >
                  {winRatePorEsporte.slice(0, 10).map((entry) => (
                    <Cell key={`cell-${entry.esporte}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Sem dados" description="Nenhuma aposta encontrada para os filtros." />
          )}
        </div>
        <div className="chart-card">
          <h3 style={{ marginTop: 0 }}>Heatmap de Performance</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(${heatmapCols.length}, 1fr)`,
              gap: 8,
              marginTop: 16
            }}
          >
            <div />
            {heatmapCols.map((col) => (
              <span key={col} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                {col.split(' ')[0]}
              </span>
            ))}
            {heatmapRows.map((row) => (
              <div key={row} style={{ display: 'contents' }}>
                <span key={`${row}-label`} style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {row}
                </span>
                {heatmapCols.map((col) => {
                  const cellData = heatmap[row]?.[col];
                  const roi = cellData?.roi ?? 0;
                  const investido = cellData?.investido ?? 0;
                  const color = getHeatmapColor(roi);
                  const opacity = getHeatmapOpacity(roi, investido);
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      style={{
                        height: 36,
                        borderRadius: 12,
                        background: color,
                        opacity: opacity,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: opacity > 0.5 ? 'white' : 'var(--text)',
                        cursor: investido > 0 ? 'pointer' : 'default'
                      }}
                      title={investido > 0 ? `ROI: ${formatPercent(roi)}\nInvestido: ${formatCurrency(investido)}` : ''}
                    >
                      {investido > 0 && formatPercent(roi)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ marginTop: 0 }}>Comparação de Bookmakers</h3>
            {comparacaoBookmakers.length > 0 && (
              <button
                type="button"
                className="btn ghost"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => setBookmakersExpanded(prev => !prev)}
              >
                {bookmakersExpanded ? 'Recolher' : 'Expandir'}
              </button>
            )}
          </div>
          {comparacaoBookmakers.length > 0 ? (
            <div
              style={{
                maxHeight: bookmakersExpanded ? 'none' : '360px',
                overflowY: bookmakersExpanded ? 'visible' : 'auto',
                paddingRight: '10px',
                marginTop: 8
              }}
            >
              {comparacaoBookmakers.slice(0, 50).map((bookmaker, index) => (
                <div
                  key={bookmaker.casa}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < comparacaoBookmakers.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{bookmaker.casa}</p>
                    <p className="card-desc" style={{ margin: 0, marginTop: 4 }}>
                      Investido: {formatCurrency(bookmaker.investido)} | ROI: {formatPercent(bookmaker.roi)}
                    </p>
                  </div>
                  <span style={{ fontWeight: 600, color: bookmaker.resultado >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {formatCurrency(bookmaker.resultado)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem dados" description="Adicione apostas para visualizar comparações." />
          )}
        </GlassCard>
        <GlassCard>
          <h3 style={{ marginTop: 0 }}>Histórico de Apostas</h3>
          <EmptyState title="Sem resultados" description="Nenhuma aposta encontrada para os filtros selecionados." />
        </GlassCard>
      </div>
    </div>
  );
}

