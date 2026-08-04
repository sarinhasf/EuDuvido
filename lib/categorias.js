/**
 * Assuntos possiveis. Lista grande de proposito: com poucas opcoes o modelo
 * volta sempre pro tema mais obvio de cada uma ("futebol brasileiro" -> quase
 * sempre "maiores campeoes do Brasileirao").
 */
export const CATEGORIAS = [
  // esporte
  'futebol brasileiro (clubes)',
  'futebol brasileiro (jogadores e idolos)',
  'futebol europeu',
  'selecoes e copas',
  'volei e handebol',
  'basquete e NBA',
  'formula 1 e automobilismo',
  'lutas, boxe e MMA',
  'tenis',
  'olimpiadas e atletas historicos',
  'skate, surf e esportes radicais',
  'xadrez, poquer e jogos de estrategia',

  // cultura pop
  'musica brasileira antiga',
  'musica brasileira atual',
  'rock e metal',
  'pop internacional',
  'rap e hip hop',
  'sertanejo, forro e pagode',
  'cinema (bilheteria e classicos)',
  'cinema de animacao',
  'series e streaming',
  'novelas e TV brasileira',
  'programas de auditorio e reality shows',
  'anime e manga',
  'quadrinhos e super-herois',
  'games e consoles',
  'jogos de tabuleiro e cartas',
  'youtubers e internet brasileira',
  'memes e virais',
  'humor e comediantes brasileiros',
  'literatura brasileira',
  'literatura mundial',
  'teatro e musicais',
  'moda e grifes',

  // mundo
  'geografia do Brasil',
  'geografia mundial',
  'paises, capitais e bandeiras',
  'rios, montanhas e desertos',
  'monumentos e pontos turisticos',
  'cidades e arquitetura',
  'praias e ilhas',
  'clima e fenomenos naturais',

  // ciencia e natureza
  'animais selvagens',
  'animais domesticos e racas',
  'insetos, peixes e criaturas marinhas',
  'dinossauros e pre-historia',
  'corpo humano e medicina',
  'espaco, planetas e astronomia',
  'invencoes e descobertas',
  'quimica, fisica e matematica',
  'tecnologia e aplicativos',
  'inteligencia artificial e internet',

  // sociedade
  'historia do Brasil',
  'historia mundial',
  'mitologia e lendas',
  'religioes e tradicoes',
  'politica e governos',
  'guerras e conflitos historicos',
  'economia, marcas e empresas',
  'carros, motos e transportes',
  'avioes, navios e trens',
  'profissoes e universidades',

  // dia a dia
  'comida brasileira',
  'comida internacional',
  'doces, sobremesas e sorvetes',
  'bebidas e drinks',
  'frutas, legumes e temperos',
  'festas juninas, carnaval e datas comemorativas',
  'brinquedos e brincadeiras de infancia',
  'objetos e utensilios de casa',
  'curiosidades e recordes mundiais',
  'nomes proprios e apelidos',
];

/**
 * Angulos de ranking. Sao combinados com a categoria pra multiplicar o espaco
 * de temas: 70 categorias x 20 angulos = 1400 combinacoes possiveis, em vez
 * das 70 que a categoria sozinha daria.
 */
export const EIXOS = [
  'os maiores',
  'os menores',
  'os mais antigos',
  'os mais recentes',
  'os mais famosos',
  'os mais caros',
  'os mais rapidos',
  'os mais vendidos',
  'os mais populares no Brasil',
  'os mais premiados',
  'os que tem mais titulos ou recordes',
  'os mais perigosos',
  'os mais raros',
  'os mais comuns no dia a dia',
  'os mais visitados',
  'os primeiros da historia',
  'os classicos que todo mundo conhece',
  'os que mais aparecem na cultura pop',
  'os de maior tamanho ou peso',
  'os de maior numero ou quantidade',
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
  {
    tema: 'Top 10 maiores felinos selvagens',
    top10: ['Tigre', 'Leao', 'Onca-pintada', 'Leopardo', 'Puma', 'Leopardo-das-neves', 'Guepardo', 'Lince', 'Caracal', 'Serval'],
  },
  {
    tema: 'Top 10 maiores paises do mundo em territorio',
    top10: ['Russia', 'Canada', 'China', 'Estados Unidos', 'Brasil', 'Australia', 'India', 'Argentina', 'Cazaquistao', 'Argelia'],
  },
  {
    tema: 'Top 10 idiomas mais falados do planeta',
    top10: ['Ingles', 'Mandarim', 'Hindi', 'Espanhol', 'Frances', 'Arabe', 'Bengali', 'Portugues', 'Russo', 'Urdu'],
  },
  {
    tema: 'Top 10 montanhas mais altas do planeta',
    top10: ['Everest', 'K2', 'Kangchenjunga', 'Lhotse', 'Makalu', 'Cho Oyu', 'Dhaulagiri', 'Manaslu', 'Nanga Parbat', 'Annapurna'],
  },
  {
    tema: 'Top 10 dinossauros mais conhecidos',
    top10: ['Tiranossauro Rex', 'Velociraptor', 'Triceratops', 'Estegossauro', 'Braquiossauro', 'Espinossauro', 'Diplodoco', 'Anquilossauro', 'Alossauro', 'Iguanodonte'],
  },
  {
    tema: 'Top 10 mamiferos terrestres mais pesados',
    top10: ['Elefante-africano', 'Elefante-asiatico', 'Rinoceronte-branco', 'Hipopotamo', 'Rinoceronte-indiano', 'Girafa', 'Bufalo-africano', 'Bisao-americano', 'Alce', 'Urso-polar'],
  },
  {
    tema: 'Top 10 marcas de carro mais vendidas do mundo',
    top10: ['Toyota', 'Volkswagen', 'Ford', 'Honda', 'Hyundai', 'Nissan', 'Chevrolet', 'Kia', 'Mercedes-Benz', 'BMW'],
  },
  {
    tema: 'Top 10 esportes mais praticados no mundo',
    top10: ['Futebol', 'Criquete', 'Basquete', 'Hoquei', 'Tenis', 'Volei', 'Tenis de mesa', 'Beisebol', 'Golfe', 'Atletismo'],
  },
  {
    tema: 'Top 10 frutas mais consumidas no planeta',
    top10: ['Banana', 'Melancia', 'Maca', 'Laranja', 'Uva', 'Manga', 'Abacaxi', 'Pera', 'Pessego', 'Morango'],
  },
  {
    tema: 'Top 10 times com mais titulos da NBA',
    top10: ['Boston Celtics', 'Los Angeles Lakers', 'Golden State Warriors', 'Chicago Bulls', 'San Antonio Spurs', 'Philadelphia 76ers', 'Detroit Pistons', 'Miami Heat', 'New York Knicks', 'Houston Rockets'],
  },
  {
    tema: 'Top 10 desertos mais extensos do planeta',
    top10: ['Antartico', 'Artico', 'Saara', 'Arabico', 'Gobi', 'Kalahari', 'Patagonico', 'Siria', 'Grande Bacia', 'Chihuahua'],
  },
  {
    tema: 'Top 10 elementos quimicos mais abundantes no universo',
    top10: ['Hidrogenio', 'Helio', 'Oxigenio', 'Carbono', 'Neonio', 'Ferro', 'Nitrogenio', 'Silicio', 'Magnesio', 'Enxofre'],
  },
  {
    tema: 'Top 10 estados brasileiros com mais habitantes',
    top10: ['Sao Paulo', 'Minas Gerais', 'Rio de Janeiro', 'Bahia', 'Parana', 'Rio Grande do Sul', 'Pernambuco', 'Ceara', 'Para', 'Santa Catarina'],
  },
  {
    tema: 'Top 10 selecoes com mais presencas em Copas do Mundo',
    top10: ['Brasil', 'Alemanha', 'Italia', 'Argentina', 'Mexico', 'Espanha', 'Franca', 'Inglaterra', 'Belgica', 'Uruguai'],
  },
];
