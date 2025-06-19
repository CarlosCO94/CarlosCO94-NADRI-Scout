// Football Scouting Pro - Aplicación Principal
const { useState, useEffect, useMemo } = React;

const FootballScoutingApp = () => {
    const [activeTab, setActiveTab] = useState('jugadores');
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [filters, setFilters] = useState(window.FilterUtils.getDefaultFilters());
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [csvData, setCsvData] = useState(null);

    // Cargar datos de ejemplo al inicio
    useEffect(() => {
        if (!csvData && window.SAMPLE_DATA) {
            setPlayers(window.SAMPLE_DATA);
            setFilteredPlayers(window.SAMPLE_DATA);
        }
    }, [csvData]);

    // Manejar carga de CSV
    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                complete: (results) => {
                    setCsvData(results.data);
                    const processedData = results.data.slice(1).map((row, index) => {
                        const player = {};
                        results.data[0].forEach((header, i) => {
                            player[header] = row[i];
                        });
                        return player;
                    }).filter(player => player.Player && player.Player.trim() !== '');
                    
                    setPlayers(processedData);
                    setFilteredPlayers(processedData);
                },
                header: false,
                skipEmptyLines: true
            });
        }
    };

    // Aplicar filtros
    useEffect(() => {
        const filtered = window.FilterUtils.filterPlayers(players, filters);
        setFilteredPlayers(filtered);
    }, [players, filters]);

    // Estadísticas del dashboard
    const dashboardStats = useMemo(() => {
        if (!players.length) return {};
        
        return {
            totalPlayers: players.length,
            avgAge: (players.reduce((sum, p) => sum + (parseInt(p.Age) || 0), 0) / players.length).toFixed(1),
            totalMarketValue: players.reduce((sum, p) => sum + (parseFloat(p["Market value"]) || 0), 0),
            topScorer: players.reduce((max, p) => (parseInt(p.Goals) || 0) > (parseInt(max.Goals) || 0) ? p : max, players[0])
        };
    }, [players]);

    // Componente de tarjeta de jugador simplificada
    const PlayerCard = ({ player, onClick }) => {
        const playerName = player['Full name'] || player['Player'] || 'Sin nombre';
        const team = player['Team'] || 'Sin equipo';
        const position = player['Position'] || 'N/A';
        const age = player['Age'] || 'N/A';
        const goals = player['Goals'] || 0;
        const assists = player['Assists'] || 0;
        const marketValue = parseFloat(player['Market value']) || 0;

        const formatMarketValue = (value) => {
            if (value >= 1000000) {
                return `€${(value / 1000000).toFixed(1)}M`;
            }
            return `€${value.toLocaleString()}`;
        };

        return (
            <div 
                className="player-card bg-white rounded-lg shadow-md p-4 cursor-pointer border-l-4 border-blue-500 hover:shadow-lg"
                onClick={() => onClick(player)}
            >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{playerName}</h3>
                        <p className="text-gray-600 text-sm">{team}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {position}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                        <span className="text-gray-500">Edad:</span>
                        <span className="ml-1 font-medium">{age}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">País:</span>
                        <span className="ml-1 font-medium">{player['Birth country'] || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Goles:</span>
                        <span className="ml-1 font-medium text-green-600">{goals}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Asistencias:</span>
                        <span className="ml-1 font-medium text-blue-600">{assists}</span>
                    </div>
                </div>
                
                <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600">
                        <span>Valor de mercado: </span>
                        <span className="font-bold text-green-600">
                            {formatMarketValue(marketValue)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // Componente de perfil detallado
    const PlayerProfile = ({ player, onBack }) => {
        const playerName = player['Full name'] || player['Player'] || 'Sin nombre';
        
        return (
            <div className="bg-white rounded-lg shadow-lg fade-in">
                <div className="gradient-bg text-white p-6 rounded-t-lg">
                    <button 
                        onClick={onBack}
                        className="mb-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded text-sm"
                    >
                        ← Volver a jugadores
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                            {playerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{playerName}</h1>
                            <p className="text-xl opacity-90 mb-1">{player['Team']}</p>
                            <p className="opacity-75 text-lg">{player['Position']} • {player['Age']} años</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Información Personal */}
                        <div className="stat-card p-6 rounded-lg">
                            <h3 className="font-bold text-xl mb-4 text-gray-800">👤 Información Personal</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nombre completo:</span>
                                    <span className="font-medium">{playerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Equipo:</span>
                                    <span className="font-medium">{player['Team'] || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Posición:</span>
                                    <span className="font-medium">{player['Position'] || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Edad:</span>
                                    <span className="font-medium">{player['Age'] || 'N/A'} años</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">País:</span>
                                    <span className="font-medium">{player['Birth country'] || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Altura:</span>
                                    <span className="font-medium">{player['Height'] ? `${player['Height']} cm` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Peso:</span>
                                    <span className="font-medium">{player['Weight'] ? `${player['Weight']} kg` : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Estadísticas de Rendimiento */}
                        <div className="stat-card p-6 rounded-lg">
                            <h3 className="font-bold text-xl mb-4 text-gray-800">📊 Rendimiento</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Partidos:</span>
                                    <span className="font-medium">{player['Matches played'] || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Goles:</span>
                                    <span className="font-medium text-green-600">{player['Goals'] || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Asistencias:</span>
                                    <span className="font-medium text-blue-600">{player['Assists'] || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Goles/90:</span>
                                    <span className="font-medium">{(parseFloat(player['Goals per 90']) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Asistencias/90:</span>
                                    <span className="font-medium">{(parseFloat(player['Assists per 90']) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">xG:</span>
                                    <span className="font-medium">{(parseFloat(player['xG']) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">xA:</span>
                                    <span className="font-medium">{(parseFloat(player['xA']) || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Habilidades Técnicas */}
                        <div className="stat-card p-6 rounded-lg">
                            <h3 className="font-bold text-xl mb-4 text-gray-800">⚽ Habilidades</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Precisión pases:</span>
                                    <span className="font-medium">{(parseFloat(player['Accurate passes, %']) || 0).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Duelos ganados:</span>
                                    <span className="font-medium">{(parseFloat(player['Duels won, %']) || 0).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Regates exitosos:</span>
                                    <span className="font-medium">{(parseFloat(player['Successful dribbles, %']) || 0).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pases/90:</span>
                                    <span className="font-medium">{(parseFloat(player['Passes per 90']) || 0).toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tiros/90:</span>
                                    <span className="font-medium">{(parseFloat(player['Shots per 90']) || 0).toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Valor mercado:</span>
                                    <span className="font-medium text-green-600">
                                        €{(parseFloat(player['Market value']) || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="gradient-bg text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold">Football Scouting Pro</h1>
                    <p className="text-lg opacity-90">Sistema avanzado de análisis de jugadores</p>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8">
                        {[
                            { id: 'jugadores', label: 'Jugadores', icon: '👥' },
                            { id: 'comparador', label: 'Comparador', icon: '⚖️' },
                            { id: 'cargar', label: 'Cargar CSV', icon: '📁' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'jugadores' && !selectedPlayer && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Jugadores</h2>
                            <div className="text-sm text-gray-600">
                                {filteredPlayers.length} de {players.length} jugadores
                            </div>
                        </div>
                        
                        {/* Filtros */}
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, equipo o país..."
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                                />
                                
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.position}
                                    onChange={(e) => setFilters({...filters, position: e.target.value})}
                                >
                                    <option value="all">Todas las posiciones</option>
                                    <option value="GK">Portero</option>
                                    <option value="CB">Defensa Central</option>
                                    <option value="LB">Lateral Izquierdo</option>
                                    <option value="RB">Lateral Derecho</option>
                                    <option value="CM">Centrocampista</option>
                                    <option value="LW">Extremo Izquierdo</option>
                                    <option value="RW">Extremo Derecho</option>
                                    <option value="CF">Delantero Centro</option>
                                </select>
                                
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Edad min"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                        value={filters.ageMin}
                                        onChange={(e) => setFilters({...filters, ageMin: parseInt(e.target.value) || 16})}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Edad max"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                        value={filters.ageMax}
                                        onChange={(e) => setFilters({...filters, ageMax: parseInt(e.target.value) || 40})}
                                    />
                                </div>
                                
                                <button
                                    onClick={() => setFilters(window.FilterUtils.getDefaultFilters())}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>
                        
                        {/* Lista de jugadores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPlayers.map((player, index) => (
                                <PlayerCard
                                    key={index}
                                    player={player}
                                    onClick={setSelectedPlayer}
                                />
                            ))}
                        </div>
                        
                        {filteredPlayers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No se encontraron jugadores con los filtros aplicados</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'jugadores' && selectedPlayer && (
                    <PlayerProfile 
                        player={selectedPlayer}
                        onBack={() => setSelectedPlayer(null)}
                    />
                )}

                {activeTab === 'comparador' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Comparador de Jugadores</h2>
                        {React.createElement(window.ComparisonComponent, { players: players })}
                    </div>
                )}

                {activeTab === 'cargar' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Cargar Datos CSV</h2>
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCSVUpload}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload" className="cursor-pointer">
                                    <div className="text-6xl mb-4">📁</div>
                                    <p className="text-xl font-medium text-gray-700 mb-2">
                                        Arrastra tu archivo CSV aquí o haz clic para seleccionar
                                    </p>
                                    <p className="text-gray-500">
                                        Archivo compatible con columnas de Wyscout
                                    </p>
                                </label>
                            </div>
                            
                            {csvData && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800 font-medium">
                                        ✅ Archivo cargado exitosamente: {players.length} jugadores encontrados
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// Renderizar la aplicación
ReactDOM.render(<FootballScoutingApp />, document.getElementById('root'));