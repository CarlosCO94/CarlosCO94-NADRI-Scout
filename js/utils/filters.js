// Football Scouting Pro - Sistema de Filtros
window.FilterUtils = {
    // Función principal de filtrado
    filterPlayers: function(players, filters) {
        return players.filter(player => {
            return this.matchesSearchTerm(player, filters.searchTerm) &&
                   this.matchesPosition(player, filters.position) &&
                   this.matchesAgeRange(player, filters.ageMin, filters.ageMax) &&
                   this.matchesValueRange(player, filters.marketValueMin, filters.marketValueMax);
        });
    },

    // Filtro por término de búsqueda
    matchesSearchTerm: function(player, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') return true;
        
        const term = searchTerm.toLowerCase().trim();
        const searchableFields = [
            player['Full name'],
            player['Player'],
            player['Team'],
            player['Birth country'],
            player['Position'],
            player['Primary position'],
            player['Competition']
        ];

        return searchableFields.some(field => {
            return field && field.toLowerCase().includes(term);
        });
    },

    // Filtro por posición
    matchesPosition: function(player, positionFilter) {
        if (!positionFilter || positionFilter === 'all') return true;
        
        return player['Position'] === positionFilter || 
               player['Primary position']?.includes(positionFilter);
    },

    // Filtro por rango de edad
    matchesAgeRange: function(player, ageMin, ageMax) {
        const age = parseInt(player['Age']) || 0;
        return age >= (ageMin || 0) && age <= (ageMax || 50);
    },

    // Filtro por rango de valor de mercado
    matchesValueRange: function(player, valueMin, valueMax) {
        const value = parseFloat(player['Market value']) || 0;
        return value >= (valueMin || 0) && value <= (valueMax || 999999999);
    },

    // Crear estado de filtros por defecto
    getDefaultFilters: function() {
        return {
            searchTerm: '',
            position: 'all',
            ageMin: 16,
            ageMax: 40,
            marketValueMin: 0,
            marketValueMax: 999999999
        };
    }
};