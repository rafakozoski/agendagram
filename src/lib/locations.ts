// Lista de estados e cidades brasileiras com bairros
export const ESTADOS: Record<string, { nome: string; cidades: Record<string, string[]> }> = {
  AC: { nome: "Acre", cidades: { "Rio Branco": ["Centro", "Bosque", "Cadeia Velha", "Conquista", "Floresta", "Habitasa", "Jardim Primavera", "Novo Horizonte", "Preventório", "São Francisco"] } },
  AL: { nome: "Alagoas", cidades: { "Maceió": ["Centro", "Farol", "Jatiúca", "Ponta Verde", "Pajuçara", "Mangabeiras", "Tabuleiro do Martins", "Benedito Bentes"], "Arapiraca": ["Centro", "Brasília", "Cacimbas", "Gordura", "São Pedro"] } },
  AP: { nome: "Amapá", cidades: { "Macapá": ["Centro", "Buritizal", "Congós", "Jesus de Nazaré", "Novo Horizonte", "Santa Rita", "Trem"] } },
  AM: { nome: "Amazonas", cidades: { "Manaus": ["Centro", "Adrianópolis", "Aleixo", "Alvorada", "Armando Mendes", "Chapada", "Cidade Nova", "Dom Pedro", "Flores", "Japiim", "Parque 10 de Novembro", "Petrópolis", "São Geraldo", "Vieiralves"] } },
  BA: { nome: "Bahia", cidades: { "Salvador": ["Barra", "Brotas", "Cabula", "Campo Grande", "Centro", "Cidade Baixa", "Federação", "Graça", "Itaigara", "Liberdade", "Nazaré", "Ondina", "Pituba", "Rio Vermelho", "Tororó", "Vitória"], "Feira de Santana": ["Centro", "Brasília", "Caseb", "Cidade Nova", "Conceição", "Kalilândia", "Papagaio", "Pampalona"] } },
  CE: { nome: "Ceará", cidades: { "Fortaleza": ["Aldeota", "Benfica", "Centro", "Cidade dos Funcionários", "Cocó", "Damas", "Dionísio Torres", "Fátima", "Guararapes", "Joaquim Távora", "Meireles", "Messejana", "Montese", "Mucuripe", "Parquelândia", "Parangaba", "Patriolino Ribeiro", "Varjota"], "Caucaia": ["Centro", "Araturi", "Jurema", "Parque Tabapuã", "Tucunduba"] } },
  DF: { nome: "Distrito Federal", cidades: { "Brasília": ["Asa Norte", "Asa Sul", "Cruzeiro", "Guará", "Lago Norte", "Lago Sul", "Noroeste", "Núcleo Bandeirante", "Park Way", "Samambaia", "Santa Maria", "Sobradinho", "Sudoeste", "Taguatinga"] } },
  ES: { nome: "Espírito Santo", cidades: { "Vitória": ["Centro", "Bento Ferreira", "Bonfim", "Goiabeiras", "Jardim Camburi", "Jardim da Penha", "Mata da Praia", "Praia do Canto", "Santa Luíza", "Santa Lúcia", "Santo Antônio"], "Vila Velha": ["Centro", "Coqueiral de Itaparica", "Itaparica", "Praia das Gaivotas", "Terra Vermelha"] } },
  GO: { nome: "Goiás", cidades: { "Goiânia": ["Centro", "Aldeota", "Bueno", "Campinas", "Cidade Jardim", "Goiânia 2", "Jardim América", "Jardim Goiás", "Marista", "Oeste", "Setor Sul", "Setor Universitário"], "Aparecida de Goiânia": ["Centro", "Andrade", "Bairro Cardoso", "Independência", "Papillon"] } },
  MA: { nome: "Maranhão", cidades: { "São Luís": ["Centro", "Anil", "Calhau", "Cohab", "Cohama", "Jaracaty", "João Paulo", "Olho D'Água", "Renascença", "São Francisco"] } },
  MT: { nome: "Mato Grosso", cidades: { "Cuiabá": ["Centro", "Araés", "Bandeirantes", "Bosque da Saúde", "Cidade Alta", "Coophema", "CPA", "Duque de Caxias", "Goiabeiras", "Jardim das Américas", "Pedra 90"] } },
  MS: { nome: "Mato Grosso do Sul", cidades: { "Campo Grande": ["Centro", "Autonomista", "Carandá Bosque", "Chácara Cachoeira", "Coronel Antonino", "Itanhangá", "Jardim dos Estados", "Monte Castelo", "Nova Lima", "Pioneiros"] } },
  MG: { nome: "Minas Gerais", cidades: { "Belo Horizonte": ["Barreiro", "Betânia", "Buritis", "Centro", "Cidade Nova", "Colégio Batista", "Contorno", "Floresta", "Funcionários", "Gutierrez", "Lourdes", "Luxemburgo", "Mangabeiras", "Padre Eustáquio", "Pampulha", "Sagrada Família", "Santa Efigênia", "Savassi", "Serra", "União"], "Uberlândia": ["Centro", "Aparecida", "Custódio Pereira", "Jardim Karaíba", "Martins", "Marta Helena", "Osvaldo Rezende", "Santa Mônica", "Tibery"] } },
  PA: { nome: "Pará", cidades: { "Belém": ["Centro", "Batista Campos", "Campina", "Cidade Velha", "Guamá", "Marco", "Nazaré", "Pedreira", "Sacramenta", "Souza", "Umarizal"] } },
  PB: { nome: "Paraíba", cidades: { "João Pessoa": ["Centro", "Altiplano", "Bessa", "Cabo Branco", "Castelo Branco", "Cristo Redentor", "Expedicionários", "Jardim Oceania", "Miramar", "Tambaú", "Tambiá", "Torre"] } },
  PR: { nome: "Paraná", cidades: { "Curitiba": ["Água Verde", "Alto da Glória", "Bacacheri", "Batel", "Boa Vista", "Boqueirão", "Cajuru", "Centro", "Centro Cívico", "CIC", "Hauer", "Jardim Social", "Juvevê", "Mercês", "Portão", "Rebouças", "Santa Felicidade", "Seminário", "Uberaba", "Xaxim"], "Londrina": ["Centro", "Cambezinho", "Gleba Palhano", "Jardins", "Palhano", "Petrópolis", "Shangri-lá"] } },
  PE: { nome: "Pernambuco", cidades: { "Recife": ["Aflitos", "Boa Viagem", "Boa Vista", "Bom Jesus", "Cabanga", "Casa Forte", "Centro", "Derby", "Espinheiro", "Graças", "Ilha do Retiro", "Ilha Joana Bezerra", "Ipsep", "Madalena", "Pina", "Santo Amaro", "Setúbal", "Tamarineira", "Zumbi"], "Caruaru": ["Centro", "Maurício de Nassau", "Rendeiras", "Roosevelt", "São Francisco"] } },
  PI: { nome: "Piauí", cidades: { "Teresina": ["Centro", "Fátima", "Ilhotas", "Ininga", "Jóquei", "Leste", "Mocambinho", "Norte", "Noivos", "São Cristóvão"] } },
  RJ: { nome: "Rio de Janeiro", cidades: { "Rio de Janeiro": ["Barra da Tijuca", "Botafogo", "Centro", "Copacabana", "Flamengo", "Gávea", "Humaitá", "Ipanema", "Jacarepaguá", "Laranjeiras", "Leblon", "Leme", "Madureira", "Méier", "Recreio dos Bandeirantes", "Santa Teresa", "São Conrado", "Tijuca", "Urca", "Vila Isabel"], "Niterói": ["Centro", "Fonseca", "Icaraí", "Ingá", "Piratininga", "São Francisco"] } },
  RN: { nome: "Rio Grande do Norte", cidades: { "Natal": ["Alecrim", "Barro Vermelho", "Capim Macio", "Centro", "Cidade Alta", "Lagoa Nova", "Petrópolis", "Ponta Negra", "Tirol"] } },
  RS: { nome: "Rio Grande do Sul", cidades: { "Porto Alegre": ["Auxiliadora", "Bela Vista", "Bom Fim", "Centro", "Cidade Baixa", "Floresta", "Boa Vista", "Jardim Lindóia", "Menino Deus", "Moinhos de Vento", "Mont'Serrat", "Petrópolis", "Praia de Belas", "Rio Branco", "Santana", "São João"], "Caxias do Sul": ["Centro", "Desvio Rizzo", "Nossa Senhora de Fátima", "São Pelegrino", "Sagrada Família"] } },
  RO: { nome: "Rondônia", cidades: { "Porto Velho": ["Centro", "Cascalheira", "Embratel", "Lagoa", "Nacional", "Nova Floresta", "Pedrinhas", "Potiguara"] } },
  RR: { nome: "Roraima", cidades: { "Boa Vista": ["Centro", "Asa Branca", "Caimbé", "Canarinho", "Caranã", "Imperial", "Jardim Primavera"] } },
  SC: { nome: "Santa Catarina", cidades: { "Florianópolis": ["Agronômica", "Barreiros", "Carianos", "Centro", "Continente", "Córrego Grande", "Ingleses", "Itacorubi", "João Paulo", "Jurerê", "Lagoa da Conceição", "Rio Tavares", "Santa Mônica", "Trindade"], "Joinville": ["América", "Anita Garibaldi", "Atiradores", "Bom Retiro", "Centro", "Glória", "Iririú", "Jardim Iririú"] } },
  SP: { nome: "São Paulo", cidades: { "São Paulo": ["Alto de Pinheiros", "Bela Vista", "Bom Retiro", "Brooklin", "Butantã", "Campo Belo", "Centro", "Consolação", "Higienópolis", "Itaim Bibi", "Jardim América", "Jardim Paulista", "Lapa", "Liberdade", "Moema", "Morumbi", "Pinheiros", "Perdizes", "Santa Cecília", "Santo André", "Santana", "Tatuapé", "Vila Mariana", "Vila Madalena", "Vila Olímpia"], "Campinas": ["Barão Geraldo", "Cambuí", "Centro", "Jardim Guanabara", "Nova Campinas", "Ponte Preta", "Taquaral", "Vívio"], "Santos": ["Boqueirão", "Centro", "Embaré", "Gonzaga", "José Menino", "Pompéia", "Ponta da Praia", "Vila Belmiro"] } },
  SE: { nome: "Sergipe", cidades: { "Aracaju": ["Centro", "Atalaia", "Coroa do Meio", "Farolândia", "Grageru", "Jabotiana", "Jardins", "Luzia", "Ponto Novo", "São Conrado", "Salgado Filho", "Suíça", "Treze de Julho"] } },
  TO: { nome: "Tocantins", cidades: { "Palmas": ["Centro", "Aureny", "Jardim Aureny I", "Jardim Aureny II", "Taquaralto", "Taquaruçu"] } },
};

// Helper para obter lista de todas as cidades únicas
export function getAllCities(): string[] {
  const cities = new Set<string>();
  Object.values(ESTADOS).forEach(estado => {
    Object.keys(estado.cidades).forEach(city => cities.add(city));
  });
  return Array.from(cities).sort();
}

// Helper para obter cidades de um estado
export function getCitiesByState(stateKey: string): string[] {
  return Object.keys(ESTADOS[stateKey]?.cidades || {}).sort();
}

// Helper para obter bairros de uma cidade
export function getNeighborhoods(stateKey: string, city: string): string[] {
  return ESTADOS[stateKey]?.cidades[city] || [];
}
