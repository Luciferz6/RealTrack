import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";

export default function DashboardExample() {
  return (
    <div style={{ padding: 32 }} className="grid grid-3">
      <GlassCard>
        <h2>Card com estilo vidro</h2>
        <p>Esse visual vem do theme + glass.css.</p>
      </GlassCard>
      <GlassCard>
        <NeonButton label="Botão Neon Roxo" />
      </GlassCard>
      <GlassCard>
        <p>Customize aqui seus gráficos, listas etc.</p>
      </GlassCard>
    </div>
  );
}

