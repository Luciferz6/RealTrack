/**
 * Formata o texto do mercado com abreviações e formato compacto
 * Exemplo: "Jogador pontos → Flagg, Cooper 20+ (DAL) Jogador assistências → Flagg, Cooper 5+ (DAL)"
 * Se torna: "Pts 20+ • Ast 5+ → Flagg, C. (DAL)"
 */
export function formatMarketDisplay(mercado: string): JSX.Element {
    if (!mercado) {
        return <>{mercado}</>;
    }

    // Mapeamento de estatísticas para abreviações
    const statAbbreviations: Record<string, string> = {
        'pontos': 'Pts',
        'assistências': 'Ast',
        'assistencias': 'Ast',
        'rebotes': 'Rebs',
        'ressaltos': 'Rebs',
        'gols': 'Gols',
        'passes': 'Pass',
        'chutes': 'Chut',
        'acertos': 'Acer',
    };

    // Padrão: "Jogador [stat] → [Nome], [Sobrenome] [valor]+ (TEAM)"
    const playerPropPattern = /Jogador\s+(\w+)\s*→\s*([^,]+),\s*(\S+)\s+([^(]+)\(([^)]+)\)/gi;

    const matches = Array.from(mercado.matchAll(playerPropPattern));

    if (matches.length === 0) {
        // Se não encontrar o padrão, retorna o texto original
        return <>{mercado}</>;
    }

    // Extrair informações do primeiro match (assumindo que todos são do mesmo jogador)
    const firstMatch = matches[0];
    const lastName = firstMatch[2].trim();
    const firstName = firstMatch[3].trim();
    const team = firstMatch[5].trim();

    // Abreviar primeiro nome (Cooper → C.)
    const firstInitial = firstName.charAt(0).toUpperCase() + '.';

    // Coletar todas as stats
    const stats = matches.map(match => {
        const statName = match[1].toLowerCase();
        const value = match[4].trim();
        const abbrev = statAbbreviations[statName] || match[1];
        return `${abbrev} ${value}`;
    });

    // Combinar em formato compacto: "Pts 20+ • Ast 5+ • Rebs 7+ → Flagg, C. (DAL)"
    const formatted = `${stats.join(' • ')} → ${lastName}, ${firstInitial} (${team})`;

    return <>{formatted}</>;
}
