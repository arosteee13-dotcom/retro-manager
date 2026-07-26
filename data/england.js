Database.register({
    name: 'Inglaterra',
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    leagues: [
        {
            name: 'Premier League',
            desc: 'Máxima categoría',
            teams: [
                { name: 'Manchester City', budget: '18.0M€', target: 'Ganar la Liga', rating: 90, stadium: 'Etihad Stadium', capacity: 53400, squad: [] },
                { name: 'Arsenal', budget: '14.0M€', target: 'Ganar la Liga', rating: 87, stadium: 'Emirates Stadium', capacity: 60704, squad: [] },
                { name: 'Manchester United', budget: '12.0M€', target: 'Entrar en Champions', rating: 84, stadium: 'Old Trafford', capacity: 74310, squad: [] },
                { name: 'Liverpool', budget: '10.0M€', target: 'Entrar en Champions', rating: 85, stadium: 'Anfield', capacity: 53394, squad: [] },
                { name: 'Chelsea', budget: '8.0M€', target: 'Puestos Europeos', rating: 82, stadium: 'Stamford Bridge', capacity: 41837, squad: [] }
            ]
        },
        {
            name: 'Championship',
            desc: 'Segunda división',
            teams: [
                { name: 'Leeds United', budget: '3.0M€', target: 'Ascenso directo', rating: 75, stadium: 'Elland Road', capacity: 37264, squad: [] },
                { name: 'Leicester City', budget: '2.5M€', target: 'Playoffs ascenso', rating: 73, stadium: 'King Power Stadium', capacity: 32261, squad: [] },
                { name: 'West Brom', budget: '1.8M€', target: 'Puestos altos', rating: 70, stadium: 'The Hawthorns', capacity: 27000, squad: [] }
            ]
        }
    ]
});
