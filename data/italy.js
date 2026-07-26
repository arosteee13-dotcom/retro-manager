Database.register({
    name: 'Italia',
    icon: '🇮🇹',
    leagues: [
        {
            name: 'Serie A',
            desc: 'Máxima categoría',
            teams: [
                { name: 'Inter de Milán', budget: '12.0M€', target: 'Ganar la Liga', rating: 87, stadium: 'San Siro', capacity: 75817, squad: [] },
                { name: 'Juventus', budget: '10.0M€', target: 'Ganar la Liga', rating: 85, stadium: 'Allianz Stadium', capacity: 41507, squad: [] },
                { name: 'AC Milan', budget: '8.0M€', target: 'Entrar en Champions', rating: 83, stadium: 'San Siro', capacity: 75817, squad: [] },
                { name: 'AS Roma', budget: '5.0M€', target: 'Puestos Europeos', rating: 80, stadium: 'Stadio Olimpico', capacity: 70634, squad: [] },
                { name: 'Napoli', budget: '6.0M€', target: 'Ganar la Liga', rating: 84, stadium: 'Diego Maradona', capacity: 54726, squad: [] }
            ]
        },
        {
            name: 'Serie B',
            desc: 'Segunda división',
            teams: [
                { name: 'US Cremonese', budget: '1.5M€', target: 'Ascenso directo', rating: 68, stadium: 'Stadio Giovanni Zini', capacity: 16003, squad: [] },
                { name: 'Parma', budget: '2.0M€', target: 'Playoffs ascenso', rating: 70, stadium: 'Stadio Ennio Tardini', capacity: 27906, squad: [] }
            ]
        }
    ]
});
