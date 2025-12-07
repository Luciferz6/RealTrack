/**
 * Formata o texto do mercado adicionando quebras de linha
 * Detecta padrões como "Jogador pontos →" e adiciona quebra de linha antes
 */
export function formatMarketDisplay(mercado: string): JSX.Element {
    if (!mercado) {
        return <>{mercado}</>;
    }

    // Padrões para detectar onde adicionar quebras de linha
    const patterns = [
        'Jogador pontos',
        'Jogador assistências',
        'Jogador rebotes',
        'Jogador ressaltos',
        'Jogador gols',
        'Jogador passes',
        'Jogador chutes',
        'Jogador acertos',
    ];

    let formatted = mercado;

    // Adiciona quebra de linha antes de cada padrão (exceto se for o início)
    patterns.forEach(pattern => {
        const regex = new RegExp(`(?<!^)(${pattern})`, 'gi');
        formatted = formatted.replace(regex, '\n$1');
    });

    // Divide por quebras de linha e renderiza
    const lines = formatted.split('\n').filter(line => line.trim());

    return (
        <>
            {lines.map((line, index) => (
                <span key={index} className="block">
                    {line.trim()}
                </span>
            ))}
        </>
    );
}
