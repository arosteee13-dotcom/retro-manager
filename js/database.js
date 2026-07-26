const Database = (function () {
    const countries = [];

    return {
        register(data) {
            countries.push(data);
        },
        getCountries() {
            return countries.slice();
        },
        getLeagues(countryName) {
            const c = countries.find(function (c) { return c.name === countryName; });
            return c ? c.leagues.slice() : [];
        },
        getTeams(countryName, leagueName) {
            const c = countries.find(function (c) { return c.name === countryName; });
            if (!c) return [];
            const l = c.leagues.find(function (l) { return l.name === leagueName; });
            return l ? l.teams.slice() : [];
        }
    };
})();
