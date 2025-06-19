// Football Scouting Pro - Sistema de Autocompletado
window.AutocompleteUtils = {
    // Función para filtrar jugadores por nombre
    filterPlayersByName: function(players, searchTerm, maxResults = 5) {
        if (!searchTerm || searchTerm.length < 2) {
            return [];
        }

        const term = searchTerm.toLowerCase().trim();
        
        // Función de scoring para ordenar resultados
        const scoreMatch = (player) => {
            const fullName = (player['Full name'] || '').toLowerCase();
            const playerName = (player['Player'] || '').toLowerCase();
            const team = (player['Team'] || '').toLowerCase();
            
            let score = 0;
            
            // Coincidencia exacta al inicio del nombre completo (máxima prioridad)
            if (fullName.startsWith(term)) {
                score += 100;
            }
            // Coincidencia exacta al inicio del nombre corto
            else if (playerName.startsWith(term)) {
                score += 90;
            }
            // Coincidencia en cualquier parte del nombre completo
            else if (fullName.includes(term)) {
                score += 70;
            }
            // Coincidencia en cualquier parte del nombre corto
            else if (playerName.includes(term)) {
                score += 60;
            }
            // Coincidencia en el equipo
            else if (team.includes(term)) {
                score += 30;
            }
            
            return score;
        };

        // Filtrar y ordenar jugadores
        const filteredPlayers = players
            .map(player => ({
                player,
                score: scoreMatch(player)
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(item => item.player);

        return filteredPlayers;
    },

    // Función para resaltar texto coincidente
    highlightMatch: function(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    },

    // Función para formatear texto de jugador en autocompletado
    formatPlayerOption: function(player, searchTerm) {
        const fullName = player['Full name'] || player['Player'] || 'Sin nombre';
        const team = player['Team'] || 'Sin equipo';
        const position = player['Position'] || 'N/A';
        
        return {
            id: player['Full name'] || player['Player'],
            fullName: fullName,
            displayName: this.highlightMatch(fullName, searchTerm),
            team: team,
            position: position,
            subtitle: `${team} • ${position}`,
            player: player
        };
    },

    // Función para encontrar jugador por nombre exacto
    findPlayerByName: function(players, playerName) {
        return players.find(player => {
            const fullName = player['Full name'] || '';
            const playerShortName = player['Player'] || '';
            
            return fullName.toLowerCase() === playerName.toLowerCase() || 
                   playerShortName.toLowerCase() === playerName.toLowerCase();
        });
    }
};