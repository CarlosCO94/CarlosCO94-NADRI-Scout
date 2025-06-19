// Football Scouting Pro - Componente Comparador
const ComparisonComponent = ({ players }) => {
    const [basePlayer, setBasePlayer] = React.useState(null);
    const [comparisonPlayers, setComparisonPlayers] = React.useState([]);
    const [comparisonView, setComparisonView] = React.useState('table');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [activeInput, setActiveInput] = React.useState(null);
    const [selectedMetricCategory, setSelectedMetricCategory] = React.useState('attacking');
    
    const radarChartRef = React.useRef(null);
    const radarChartInstance = React.useRef(null);

    // Obtener sugerencias de autocompletado
    const getSuggestions = React.useCallback((term, excludePlayers = []) => {
        if (!term || term.length < 2) return [];
        
        const filtered = window.AutocompleteUtils.filterPlayersByName(players, term, 8)
            .filter(player => !excludePlayers.some(excluded => 
                excluded['Full name'] === player['Full name']
            ));
        
        return filtered.map(player => 
            window.AutocompleteUtils.formatPlayerOption(player, term)
        );
    }, [players]);

    // Manejar cambio en campo de búsqueda
    const handleSearchChange = (value, inputType) => {
        setSearchTerm(value);
        setActiveInput(inputType);
        
        const excludePlayers = [basePlayer, ...comparisonPlayers].filter(Boolean);
        const newSuggestions = getSuggestions(value, excludePlayers);
        setSuggestions(newSuggestions);
    };

    // Seleccionar jugador desde autocompletado
    const selectPlayerFromSuggestion = (playerOption) => {
        if (activeInput === 'base') {
            setBasePlayer(playerOption.player);
        } else if (activeInput === 'comparison' && comparisonPlayers.length < 4) {
            setComparisonPlayers(prev => [...prev, playerOption.player]);
        }
        
        setSearchTerm('');
        setSuggestions([]);
        setActiveInput(null);
    };

    // Remover jugador
    const removePlayer = (playerToRemove, isBase = false) => {
        if (isBase) {
            setBasePlayer(null);
        } else {
            setComparisonPlayers(prev => 
                prev.filter(p => p['Full name'] !== playerToRemove['Full name'])
            );
        }
    };

    // Limpiar selección
    const clearAll = () => {
        setBasePlayer(null);
        setComparisonPlayers([]);
        setSearchTerm('');
        setSuggestions([]);
        setActiveInput(null);
    };

    // Obtener métricas por categoría
    const getMetricsByCategory = (category) => {
        return window.COMPARISON_METRICS[category] || [];
    };

    // Determinar mejor valor en una métrica
    const getBestValueInRow = (metric, playersToCompare) => {
        const values = playersToCompare.map(player => 
            parseFloat(player[metric.key]) || 0
        );
        
        if (metric.type === "higher") {
            return Math.max(...values);
        } else if (metric.type === "lower") {
            return Math.min(...values);
        }
        return null;
    };

    // Formatear valor para mostrar
    const formatValue = (value, metric) => {
        const numValue = parseFloat(value) || 0;
        
        if (metric.key === "Market value") {
            return `€${numValue.toLocaleString()}`;
        } else if (metric.key.includes('%')) {
            return `${numValue.toFixed(1)}%`;
        } else {
            return numValue.toFixed(2);
        }
    };

    // Crear gráfico radar
    React.useEffect(() => {
        if (comparisonView === 'radar' && basePlayer && comparisonPlayers.length > 0 && radarChartRef.current) {
            if (radarChartInstance.current) {
                radarChartInstance.current.destroy();
            }

            const ctx = radarChartRef.current.getContext('2d');
            const allPlayers = [basePlayer, ...comparisonPlayers];
            
            // Normalizar valores para el radar
            const normalizeValue = (value, metric) => {
                const numValue = parseFloat(value) || 0;
                return Math.min((numValue / metric.max) * metric.multiplier, 100);
            };

            const datasets = allPlayers.map((player, index) => {
                const colors = [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(245, 158, 11, 0.6)'
                ];
                
                const borderColors = [
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(245, 158, 11, 1)'
                ];

                return {
                    label: player['Full name'] || player['Player'],
                    data: window.RADAR_METRICS.map(metric => 
                        normalizeValue(player[metric.key], metric)
                    ),
                    backgroundColor: colors[index],
                    borderColor: borderColors[index],
                    borderWidth: 2,
                    pointBackgroundColor: borderColors[index],
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                };
            });

            radarChartInstance.current = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: window.RADAR_METRICS.map(metric => metric.label),
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Comparación de Habilidades',
                            font: { size: 16, weight: 'bold' }
                        },
                        legend: {
                            position: 'bottom',
                            labels: { padding: 20 }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: 'rgba(0, 0, 0, 0.1)' },
                            angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                            pointLabels: { font: { size: 12 } }
                        }
                    }
                }
            });
        }

        return () => {
            if (radarChartInstance.current) {
                radarChartInstance.current.destroy();
            }
        };
    }, [comparisonView, basePlayer, comparisonPlayers]);

    // Componente de autocompletado
    const AutocompleteInput = ({ placeholder, inputType, value, onChange }) => (
        <div className="autocomplete-container">
            <input
                type="text"
                placeholder={placeholder}
                className="autocomplete-input"
                value={value}
                onChange={(e) => onChange(e.target.value, inputType)}
                onFocus={() => setActiveInput(inputType)}
            />
            
            {suggestions.length > 0 && activeInput === inputType && (
                <div className="autocomplete-dropdown">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="autocomplete-item"
                            onClick={() => selectPlayerFromSuggestion(suggestion)}
                            dangerouslySetInnerHTML={{ __html: `
                                <div class="font-medium">${suggestion.displayName}</div>
                                <div class="text-sm text-gray-500">${suggestion.subtitle}</div>
                            ` }}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    // Componente de selección de jugadores
    const PlayerSelector = ({ player, isBase, onRemove, placeholder }) => (
        <div className={`player-selector ${player ? (isBase ? 'base-player' : 'has-player') : ''}`}>
            {player ? (
                <div className="flex items-center justify-between w-full">
                    <div>
                        <div className="font-medium text-sm">
                            {player['Full name'] || player['Player']}
                        </div>
                        <div className="text-xs text-gray-500">
                            {player['Team']} • {player['Position']}
                        </div>
                    </div>
                    <button
                        onClick={() => onRemove(player, isBase)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div className="text-gray-500 text-sm text-center">
                    {placeholder}
                </div>
            )}
        </div>
    );

    const allPlayers = basePlayer && comparisonPlayers.length > 0 ? 
        [basePlayer, ...comparisonPlayers] : [];
    const currentMetrics = getMetricsByCategory(selectedMetricCategory);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Seleccionar Jugadores</h3>
                
                {/* Selector de jugador base */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Jugador Base</label>
                    {!basePlayer ? (
                        <AutocompleteInput
                            placeholder="Escribe el nombre del jugador base..."
                            inputType="base"
                            value={activeInput === 'base' ? searchTerm : ''}
                            onChange={handleSearchChange}
                        />
                    ) : (
                        <PlayerSelector
                            player={basePlayer}
                            isBase={true}
                            onRemove={removePlayer}
                        />
                    )}
                </div>

                {/* Selector de jugadores para comparar */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Jugadores a Comparar ({comparisonPlayers.length}/4)
                    </label>
                    
                    {comparisonPlayers.length < 4 && (
                        <div className="mb-3">
                            <AutocompleteInput
                                placeholder="Escribe el nombre del jugador para comparar..."
                                inputType="comparison"
                                value={activeInput === 'comparison' ? searchTerm : ''}
                                onChange={handleSearchChange}
                            />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, index) => (
                            <PlayerSelector
                                key={index}
                                player={comparisonPlayers[index]}
                                isBase={false}
                                onRemove={removePlayer}
                                placeholder={`Jugador ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Controles */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <button 
                        onClick={clearAll} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Limpiar Todo
                    </button>
                    
                    {allPlayers.length > 1 && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setComparisonView('table')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    comparisonView === 'table'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                📊 Tabla
                            </button>
                            <button
                                onClick={() => setComparisonView('radar')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    comparisonView === 'radar'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                🕸️ Radar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Vista de comparación */}
            {allPlayers.length > 1 && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    {comparisonView === 'table' && (
                        <>
                            {/* Selector de categoría de métricas */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Categoría de Métricas</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(window.COMPARISON_METRICS).map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedMetricCategory(category)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                selectedMetricCategory === category
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {category === 'attacking' && '⚽ Ofensiva'}
                                            {category === 'technical' && '🎯 Técnica'}
                                            {category === 'physical' && '💪 Física'}
                                            {category === 'market' && '💰 Mercado'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tabla de comparación */}
                            <div className="overflow-x-auto">
                                <table className="comparison-table w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left p-3">Métrica</th>
                                            <th className="text-center p-3 base-player">
                                                {basePlayer['Full name'] || basePlayer['Player']} (Base)
                                            </th>
                                            {comparisonPlayers.map((player, index) => (
                                                <th key={index} className="text-center p-3">
                                                    {player['Full name'] || player['Player']}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentMetrics.map((metric, index) => {
                                            const bestValue = getBestValueInRow(metric, allPlayers);
                                            
                                            return (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                    <td className="p-3 font-medium">{metric.label}</td>
                                                    {allPlayers.map((player, playerIndex) => {
                                                        const value = parseFloat(player[metric.key]) || 0;
                                                        const isBase = playerIndex === 0;
                                                        const isBest = value === bestValue && metric.type !== 'contextual';
                                                        
                                                        return (
                                                            <td 
                                                                key={playerIndex} 
                                                                className={`p-3 text-center ${
                                                                    isBase ? 'base-player' : ''
                                                                } ${isBest ? 'best-value' : ''}`}
                                                            >
                                                                {formatValue(value, metric)}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Leyenda */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>💡 Leyenda:</strong> Los valores destacados con ★ representan el mejor valor en cada métrica.
                                    El jugador base está resaltado en azul.
                                </p>
                            </div>
                        </>
                    )}

                    {comparisonView === 'radar' && (
                        <>
                            <h3 className="text-lg font-semibold mb-4">Comparación Visual (Radar)</h3>
                            <div className="radar-chart-container">
                                <canvas ref={radarChartRef} width="400" height="400"></canvas>
                            </div>
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>📊 Análisis:</strong> El gráfico radar muestra las habilidades clave normalizadas (0-100).
                                    Un área mayor indica mejor rendimiento general. Compara las formas para identificar fortalezas y debilidades.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Estado vacío */}
            {allPlayers.length <= 1 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚖️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Comparador de Jugadores</h3>
                    <p className="text-gray-600 mb-4">
                        Escribe el nombre de los jugadores para compararlos automáticamente
                    </p>
                    <div className="text-sm text-gray-500 mt-4">
                        <p>1. 🎯 Escribe el nombre del jugador base</p>
                        <p>2. ➕ Agrega hasta 4 jugadores para comparar</p>
                        <p>3. 📊 Ve la comparación en tabla o gráfico radar</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Hacer disponible globalmente
window.ComparisonComponent = ComparisonComponent;