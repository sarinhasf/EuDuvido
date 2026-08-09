/**
 * Assuntos possiveis. A regra aqui e uma so: tem que ser coisa do DIA A DIA do
 * brasileiro - o que ele come, compra, usa, assiste e tem dentro de casa.
 *
 * Nada de historia, guerra, rei, data, capital, rio ou estatistica de nicho:
 * esses temas travam a mesa porque ninguem lembra os 10 nomes de cabeca.
 *
 * A lista e grande de proposito: com poucas opcoes o modelo volta sempre pro
 * tema mais obvio de cada uma.
 */
export const CATEGORIAS = [
  // supermercado e marcas de prateleira
  'produtos do cafe da manha',
  'marcas de produtos de limpeza',
  'marcas de biscoito e bolacha',
  'salgadinhos e snacks de pacote',
  'refrigerantes, sucos e agua',
  'marcas de cerveja e bebida gelada',
  'chocolates, bombons e barras',
  'balas, chicletes e pirulitos',
  'sorvetes e picoles',
  'leite, iogurte, queijo e requeijao',
  'cafe, achocolatado e chas',
  'arroz, feijao, macarrao e enlatados',
  'temperos, molhos e oleos da cozinha',
  'shampoo, sabonete e itens de banho',
  'creme dental, desodorante e perfumaria',
  'papel higienico, fralda e descartaveis',
  'racao e produtos de pet shop',
  'itens que a gente sempre esquece na compra do mes',

  // comida de verdade
  'pratos do almoco brasileiro',
  'comida de lanchonete e fast food',
  'sabores de pizza',
  'padaria: paes, salgados e bolos',
  'doces e sobremesas de festa',
  'petiscos de boteco',
  'churrasco: carnes e acompanhamentos',
  'frutas, verduras e legumes da feira',
  'comida de festa junina',
  'comida de rua e feira',
  'delivery e apps de comida',
  'marmita, janta rapida e comida de segunda-feira',

  // dentro de casa
  'utensilios e objetos de cozinha',
  'eletrodomesticos',
  'moveis da sala e do quarto',
  'coisas do banheiro',
  'area de servico, ferramentas e consertos',
  'a gaveta da bagunca',
  'plantas e jardinagem caseira',
  'tarefas domesticas',
  'coisas que sempre tem na geladeira',
  'itens de cama, mesa e banho',

  // lojas, marcas e dinheiro
  'redes de supermercado e atacado',
  'lojas de departamento e shopping',
  'farmacias e itens de farmacia',
  'marcas de roupa, calcado e tenis',
  'marcas de celular, TV e eletronicos',
  'bancos, cartoes e apps de pagamento',
  'marcas de carro e moto no Brasil',
  'redes de lanchonete e restaurante',
  'contas e despesas do mes',

  // rotina
  'transporte e o trajeto do dia a dia',
  'trabalho, escritorio e reuniao',
  'material escolar e vida de estudante',
  'o que tem no armario de roupa',
  'academia, caminhada e esporte de fim de semana',
  'remedios e chas caseiros pra mal-estar',
  'clima, calor, frio e chuva',
  'feriados, datas comemorativas e festas',
  'o que se faz num domingo',
  'coisas que a gente carrega na bolsa ou no bolso',

  // lazer e cultura pop acessivel
  'aplicativos e redes sociais',
  'novelas e programas de TV',
  'series e filmes que todo mundo viu',
  'desenhos animados da infancia',
  'musicas e artistas que tocam no radio',
  'sertanejo, funk, pagode e forro',
  'games e jogos de celular',
  'brinquedos e brincadeiras de infancia',
  'jogos de tabuleiro, cartas e jogos de festa',
  'youtubers, influencers e memes',
  'times e jogadores de futebol do Brasil',
  'pets e animais que todo mundo conhece',
  'praia, viagem e feriadao',
  'passeios e programas baratos',
];

/**
 * Angulos de ranking. Sao combinados com a categoria pra multiplicar o espaco
 * de temas: ~70 categorias x 20 angulos = 1400 combinacoes possiveis.
 *
 * Todos os angulos aqui sao "de mesa": dao lista que a pessoa responde de
 * cabeca, sem precisar ter estudado nada.
 */
export const EIXOS = [
  'os mais consumidos no Brasil',
  'os mais vendidos',
  'as marcas mais conhecidas',
  'os que todo mundo tem em casa',
  'os que nao podem faltar na despensa',
  'os mais caros',
  'os mais baratos',
  'os mais pedidos no delivery',
  'os preferidos das criancas',
  'os mais comuns no supermercado',
  'os que mais aparecem na mesa do brasileiro',
  'os mais usados no dia a dia',
  'os classicos que todo mundo conhece',
  'os que mais aparecem na propaganda de TV',
  'os primeiros que vem a cabeca quando se fala do assunto',
  'os que aparecem em toda festa',
  'os que mais dao trabalho',
  'os que todo mundo ja usou pelo menos uma vez',
  'os de maior tamanho ou quantidade',
  'os que sempre acabam primeiro',
];

/**
 * Rede de seguranca: se a API do Groq falhar (sem chave, sem internet, limite),
 * o jogo continua com estes temas em vez de travar.
 *
 * Mesma regra das categorias: tudo dia a dia, tudo facil de chutar.
 */
export const TEMAS_RESERVA = [
  {
    tema: 'Top 10 produtos do cafe da manha do brasileiro',
    top10: ['Pao frances', 'Cafe', 'Leite', 'Manteiga', 'Queijo', 'Presunto', 'Achocolatado', 'Bolacha', 'Suco de laranja', 'Ovo mexido'],
  },
  {
    tema: 'Top 10 marcas de produto de limpeza mais conhecidas do Brasil',
    top10: ['Ype', 'Omo', 'Veja', 'Cif', 'Pinho Sol', 'Brilhante', 'Bombril', 'Vanish', 'Mr Musculo', 'Ajax'],
  },
  {
    tema: 'Top 10 sabores de pizza mais pedidos no Brasil',
    top10: ['Mussarela', 'Calabresa', 'Portuguesa', 'Frango com catupiry', 'Quatro queijos', 'Marguerita', 'Bacon', 'Napolitana', 'Atum', 'Chocolate'],
  },
  {
    tema: 'Top 10 eletrodomesticos mais comuns nas casas brasileiras',
    top10: ['Geladeira', 'Fogao', 'Televisao', 'Microondas', 'Maquina de lavar', 'Liquidificador', 'Ventilador', 'Ferro de passar', 'Batedeira', 'Cafeteira'],
  },
  {
    tema: 'Top 10 marcas de refrigerante mais vendidas no Brasil',
    top10: ['Coca-Cola', 'Guarana Antarctica', 'Pepsi', 'Fanta', 'Sprite', 'Sukita', 'Kuat', 'Dolly', 'Schweppes', 'Itubaina'],
  },
  {
    tema: 'Top 10 salgados de padaria mais vendidos',
    top10: ['Coxinha', 'Pao de queijo', 'Esfiha', 'Empada', 'Enroladinho de salsicha', 'Kibe', 'Risoles', 'Bolinha de queijo', 'Pastel', 'Croissant'],
  },
  {
    tema: 'Top 10 aplicativos mais usados pelos brasileiros',
    top10: ['WhatsApp', 'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Google', 'Netflix', 'Spotify', 'Mercado Livre', 'iFood'],
  },
  {
    tema: 'Top 10 lanches mais pedidos numa lanchonete',
    top10: ['X-burguer', 'X-salada', 'X-bacon', 'X-tudo', 'Misto quente', 'Cachorro-quente', 'X-egg', 'X-frango', 'Bauru', 'Americano'],
  },
  {
    tema: 'Top 10 marcas de chocolate mais conhecidas no Brasil',
    top10: ['Nestle', 'Lacta', 'Garoto', 'Hersheys', 'Bis', 'Sonho de Valsa', 'Kit Kat', 'Ferrero Rocher', 'Talento', 'Diamante Negro'],
  },
  {
    tema: 'Top 10 acompanhamentos que nao podem faltar no churrasco',
    top10: ['Arroz', 'Farofa', 'Vinagrete', 'Pao de alho', 'Maionese', 'Salada', 'Mandioca', 'Queijo coalho', 'Linguica', 'Batata frita'],
  },
  {
    tema: 'Top 10 frutas mais consumidas no Brasil',
    top10: ['Banana', 'Laranja', 'Maca', 'Melancia', 'Mamao', 'Manga', 'Uva', 'Abacaxi', 'Limao', 'Morango'],
  },
  {
    tema: 'Top 10 marcas de cerveja mais vendidas no Brasil',
    top10: ['Skol', 'Brahma', 'Antarctica', 'Itaipava', 'Heineken', 'Budweiser', 'Amstel', 'Original', 'Bohemia', 'Devassa'],
  },
  {
    tema: 'Top 10 tarefas domesticas mais frequentes',
    top10: ['Lavar louca', 'Varrer a casa', 'Passar pano', 'Lavar roupa', 'Estender roupa', 'Passar roupa', 'Tirar o po', 'Limpar o banheiro', 'Arrumar a cama', 'Levar o lixo pra fora'],
  },
  {
    tema: 'Top 10 itens de higiene que todo mundo tem no banheiro',
    top10: ['Sabonete', 'Shampoo', 'Condicionador', 'Creme dental', 'Escova de dentes', 'Desodorante', 'Papel higienico', 'Toalha', 'Aparelho de barbear', 'Fio dental'],
  },
  {
    tema: 'Top 10 marcas de celular mais vendidas no Brasil',
    top10: ['Samsung', 'Motorola', 'Apple', 'Xiaomi', 'Realme', 'LG', 'Nokia', 'Asus', 'Positivo', 'Multilaser'],
  },
  {
    tema: 'Top 10 temperos mais usados na cozinha brasileira',
    top10: ['Sal', 'Alho', 'Cebola', 'Pimenta-do-reino', 'Oregano', 'Colorau', 'Cominho', 'Cheiro-verde', 'Salsinha', 'Folha de louro'],
  },
  {
    tema: 'Top 10 doces de festa de aniversario',
    top10: ['Brigadeiro', 'Beijinho', 'Cajuzinho', 'Bolo', 'Docinho de leite ninho', 'Olho de sogra', 'Bem-casado', 'Pudim', 'Gelatina', 'Casadinho'],
  },
  {
    tema: 'Top 10 redes de fast food mais conhecidas do Brasil',
    top10: ['McDonalds', 'Burger King', 'Subway', 'Bobs', 'Habibs', 'KFC', 'Giraffas', 'Spoleto', 'China in Box', 'Pizza Hut'],
  },
  {
    tema: 'Top 10 marcas de biscoito mais conhecidas no Brasil',
    top10: ['Bauducco', 'Nestle', 'Trakinas', 'Passatempo', 'Oreo', 'Piraque', 'Marilan', 'Vitarella', 'Adria', 'Isabela'],
  },
  {
    tema: 'Top 10 coisas que sempre tem na geladeira do brasileiro',
    top10: ['Leite', 'Ovos', 'Manteiga', 'Queijo', 'Presunto', 'Agua', 'Refrigerante', 'Iogurte', 'Frutas', 'Sobra de comida'],
  },
  {
    tema: 'Top 10 lojas e redes mais conhecidas do Brasil',
    top10: ['Casas Bahia', 'Magazine Luiza', 'Americanas', 'Havan', 'Renner', 'Riachuelo', 'C&A', 'Carrefour', 'Extra', 'Ponto'],
  },
  {
    tema: 'Top 10 racas de cachorro mais populares no Brasil',
    top10: ['Vira-lata', 'Shih Tzu', 'Poodle', 'Pinscher', 'Labrador', 'Golden Retriever', 'Yorkshire', 'Pug', 'Bulldog', 'Rottweiler'],
  },
  {
    tema: 'Top 10 sabores de sorvete mais pedidos',
    top10: ['Chocolate', 'Morango', 'Creme', 'Baunilha', 'Flocos', 'Napolitano', 'Doce de leite', 'Coco', 'Limao', 'Abacaxi'],
  },
  {
    tema: 'Top 10 utensilios que nao podem faltar numa cozinha',
    top10: ['Panela', 'Frigideira', 'Faca', 'Colher', 'Garfo', 'Prato', 'Copo', 'Tabua de corte', 'Escorredor', 'Abridor de lata'],
  },
  {
    tema: 'Top 10 brincadeiras de infancia mais conhecidas no Brasil',
    top10: ['Pique-esconde', 'Pique-pega', 'Amarelinha', 'Queimada', 'Cabo de guerra', 'Pular corda', 'Bolinha de gude', 'Elastico', 'Bete', 'Estatua'],
  },
  {
    tema: 'Top 10 petiscos de boteco mais pedidos',
    top10: ['Batata frita', 'Calabresa acebolada', 'Pastel', 'Bolinho de bacalhau', 'Frango a passarinho', 'Torresmo', 'Amendoim', 'Isca de peixe', 'Coxinha', 'Queijo coalho'],
  },
];
