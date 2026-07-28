/**
 * Sementes de categoria. A cada rodada o servidor sorteia uma e manda pro Groq.
 * Isso evita que o modelo caia sempre nos mesmos 3 temas de futebol.
 */
export const CATEGORIAS = [
  'futebol brasileiro',
  'futebol mundial',
  'outros esportes (volei, basquete, F1, MMA, tenis)',
  'olimpiadas e atletas historicos',
  'musica brasileira',
  'musica internacional',
  'cinema e bilheteria',
  'series e streaming',
  'novelas e TV brasileira',
  'desenhos animados e anime',
  'games e consoles',
  'internet e redes sociais brasileiras',
  'geografia do Brasil',
  'geografia mundial',
  'paises, capitais e bandeiras',
  'animais e natureza',
  'ciencia e espaco',
  'historia do Brasil',
  'historia mundial',
  'literatura e quadrinhos',
  'marcas e empresas',
  'comida e bebida',
  'carros e transportes',
  'tecnologia e aplicativos',
  'humor e comediantes brasileiros',
  'super-herois e franquias',
  'monumentos e lugares turisticos',
  'curiosidades e recordes mundiais',
];

/**
 * Rede de seguranca: se a API do Groq falhar (sem chave, sem internet, limite),
 * o jogo continua com estes temas em vez de travar.
 */
export const TEMAS_RESERVA = [
  {
    tema: 'Top 10 maiores campeoes do Brasileirao',
    top10: ['Palmeiras', 'Flamengo', 'Santos', 'Corinthians', 'Sao Paulo', 'Fluminense', 'Cruzeiro', 'Vasco da Gama', 'Internacional', 'Gremio'],
  },
  {
    tema: 'Top 10 maiores estados do Brasil em area',
    top10: ['Amazonas', 'Para', 'Mato Grosso', 'Minas Gerais', 'Bahia', 'Mato Grosso do Sul', 'Goias', 'Maranhao', 'Rio Grande do Sul', 'Tocantins'],
  },
  {
    tema: 'Top 10 paises mais populosos do mundo',
    top10: ['India', 'China', 'Estados Unidos', 'Indonesia', 'Paquistao', 'Nigeria', 'Brasil', 'Bangladesh', 'Russia', 'Mexico'],
  },
  {
    tema: 'Top 10 maiores vencedores da Copa do Mundo',
    top10: ['Brasil', 'Alemanha', 'Italia', 'Argentina', 'Franca', 'Uruguai', 'Inglaterra', 'Espanha', 'Holanda', 'Hungria'],
  },
  {
    tema: 'Top 10 planetas e corpos do Sistema Solar mais conhecidos',
    top10: ['Sol', 'Mercurio', 'Venus', 'Terra', 'Marte', 'Jupiter', 'Saturno', 'Urano', 'Netuno', 'Lua'],
  },
  {
    tema: 'Top 10 maiores cidades do Brasil em populacao',
    top10: ['Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Fortaleza', 'Salvador', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiania'],
  },
  {
    tema: 'Top 10 maiores campeoes da Libertadores',
    top10: ['Independiente', 'Boca Juniors', 'Penarol', 'River Plate', 'Estudiantes', 'Olimpia', 'Nacional', 'Sao Paulo', 'Gremio', 'Palmeiras'],
  },
  {
    tema: 'Top 10 continentes e oceanos do planeta',
    top10: ['Asia', 'Africa', 'America do Norte', 'America do Sul', 'Antartida', 'Europa', 'Oceania', 'Oceano Pacifico', 'Oceano Atlantico', 'Oceano Indico'],
  },
  {
    tema: 'Top 10 maiores rios do mundo em extensao',
    top10: ['Nilo', 'Amazonas', 'Yangtze', 'Mississippi', 'Yenisei', 'Rio Amarelo', 'Ob', 'Parana', 'Congo', 'Amur'],
  },
  {
    tema: 'Top 10 selecoes com mais titulos da Copa America',
    top10: ['Uruguai', 'Argentina', 'Brasil', 'Peru', 'Paraguai', 'Chile', 'Colombia', 'Bolivia', 'Equador', 'Venezuela'],
  },
];
