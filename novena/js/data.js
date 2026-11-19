/* =========================================================
   Conteúdo da Novena: orações, nove dias e mistérios do Terço
   Versões tradicionais em português do Brasil.
   Linhas iniciadas por "V." e "R." são versículo e resposta.
   ========================================================= */
'use strict';

const PRAYERS = {
  sinal: {
    title: 'Sinal da Cruz',
    text: [
      'Pelo sinal da Santa Cruz, livrai-nos, Deus, Nosso Senhor, dos nossos inimigos.',
      'Em nome do Pai, e do Filho, e do Espírito Santo. Amém.'
    ]
  },
  espirito: {
    title: 'Invocação ao Espírito Santo',
    text: [
      'Vinde, Espírito Santo, enchei os corações dos vossos fiéis e acendei neles o fogo do vosso amor.',
      'V. Enviai o vosso Espírito e tudo será criado.',
      'R. E renovareis a face da terra.',
      'Oremos: Ó Deus, que instruístes os corações dos vossos fiéis com a luz do Espírito Santo, concedei-nos que, no mesmo Espírito, saibamos o que é reto e gozemos sempre de suas consolações. Por Cristo, Senhor nosso. Amém.'
    ]
  },
  oferecimento: {
    title: 'Oferecimento do Terço',
    text: [
      'Divino Jesus, eu vos ofereço este terço que vou rezar, contemplando os mistérios da nossa Redenção.',
      'Concedei-me, pela intercessão de Maria, vossa Mãe Santíssima, a quem me dirijo, as virtudes que me são necessárias para bem rezá-lo e a graça de ganhar as indulgências anexas a esta santa devoção. Amém.'
    ]
  },
  credo: {
    title: 'Credo (Símbolo dos Apóstolos)',
    text: [
      'Creio em Deus Pai todo-poderoso, criador do céu e da terra.',
      'E em Jesus Cristo, seu único Filho, nosso Senhor, que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado. Desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus, está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos.',
      'Creio no Espírito Santo, na santa Igreja Católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne, na vida eterna. Amém.'
    ]
  },
  painosso: {
    title: 'Pai-Nosso',
    text: [
      'Pai nosso que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade, assim na terra como no céu.',
      'O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.'
    ]
  },
  avemaria: {
    title: 'Ave-Maria',
    text: [
      'Ave Maria, cheia de graça, o Senhor é convosco; bendita sois vós entre as mulheres, e bendito é o fruto do vosso ventre, Jesus.',
      'Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora da nossa morte. Amém.'
    ]
  },
  gloria: {
    title: 'Glória ao Pai',
    text: [
      'Glória ao Pai, e ao Filho, e ao Espírito Santo.',
      'Como era no princípio, agora e sempre. Amém.'
    ]
  },
  jaculatoria: {
    title: 'Jaculatória de Fátima',
    text: [
      'Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno, levai as almas todas para o céu e socorrei principalmente as que mais precisarem.'
    ]
  },
  salve: {
    title: 'Salve-Rainha',
    text: [
      'Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve!',
      'A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas.',
      'Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei. E depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre.',
      'Ó clemente, ó piedosa, ó doce sempre Virgem Maria.',
      'V. Rogai por nós, santa Mãe de Deus.',
      'R. Para que sejamos dignos das promessas de Cristo. Amém.'
    ]
  },
  contricao: {
    title: 'Ato de contrição',
    text: [
      'Senhor meu, Jesus Cristo, Deus e Homem verdadeiro, Criador e Redentor meu, por serdes Vós quem sois, sumamente bom e digno de ser amado sobre todas as coisas, e porque Vos amo e estimo, pesa-me, Senhor, por Vos ter ofendido; e pesa-me também por ter perdido o Céu e merecido o inferno.',
      'Proponho, firmemente, com o auxílio de Vossa divina graça e pela poderosa intercessão de Vossa Mãe Santíssima, emendar-me e nunca mais Vos tornar a ofender. Espero alcançar o perdão de minhas culpas, por Vossa infinita misericórdia. Assim seja.'
    ]
  },
  suplica: {
    title: 'Súplica a Nossa Senhora',
    text: [
      'Ó Imaculada Virgem Mãe de Deus e nossa Mãe, ao contemplar-vos de braços abertos derramando graças sobre os que vos pedem, cheios de confiança na vossa poderosa intercessão, inúmeras vezes manifestada pela Medalha Milagrosa, embora reconhecendo a nossa indignidade por causa de nossas inúmeras culpas, acercamo-nos de vossos pés para vos expor, durante essa oração, as nossas mais prementes necessidades.',
      '(Momento de silêncio e de pedir a graça desejada.)',
      'Concedei, pois, ó Virgem da Medalha Milagrosa, este favor que confiantes vos solicitamos, para maior glória de Deus, engrandecimento do vosso nome, e o bem de nossas almas. E para melhor servirmos ao Vosso Divino Filho, inspirai-nos profundo ódio ao pecado e dai-nos coragem de nos afirmar sempre verdadeiros cristãos. Amém.'
    ]
  },
  jacmaria: {
    title: 'Jaculatória da Medalha Milagrosa',
    text: [
      'Ó Maria concebida sem pecado, rogai por nós que recorremos a vós!'
    ]
  },
  final: {
    title: 'Oração final',
    text: [
      'Santíssima Virgem, eu reconheço e confesso vossa Santa e Imaculada Conceição, pura e sem mancha. Ó puríssima Virgem Maria, por vossa Conceição Imaculada e gloriosa prerrogativa de Mãe de Deus, alcançai-me de vosso amado Filho a humildade, caridade, obediência, castidade, santa pureza de coração, de corpo e espírito; alcançai-me a perseverança na prática do bem, uma santa vida, uma boa morte e a graça de (pede-se uma graça) que peço com toda a confiança. Amém.'
    ]
  }
};

/* Ordem em que as orações aparecem na página "Todas as orações" */
const PRAYER_ORDER = [
  'sinal', 'espirito', 'oferecimento', 'credo', 'painosso', 'avemaria',
  'gloria', 'jaculatoria', 'salve', 'contricao', 'suplica', 'jacmaria', 'final'
];

const DAYS = [
  {
    n: 1,
    title: 'Entrega e confiança',
    verse: { text: 'Eis aqui a serva do Senhor. Faça-se em mim segundo a tua palavra.', ref: 'Lc 1,38' },
    reflection: 'Na noite de 18 para 19 de julho de 1830, em Paris, a jovem noviça Catarina Labouré foi despertada e conduzida até a capela do convento. Ali encontrou Nossa Senhora. Catarina não entendia tudo o que acontecia, mas foi. Hoje, faça como ela: venha do jeito que está e confie.',
    intention: 'Peço a graça de confiar mais em Deus e de entregar em suas mãos tudo o que não consigo controlar.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Primeira aparição',
    meditation: 'Contemplemos a Virgem Imaculada em sua primeira aparição a Santa Catarina Labouré. A piedosa noviça, guiada por seu Anjo da Guarda, é apresentada a Imaculada Senhora. Consideremos sua inefável alegria. Seremos também felizes como Santa Catarina se trabalharmos com ardor na nossa santificação. Gozaremos as delícias do Paraíso se nos privarmos dos gozos terrenos.'
  },
  {
    n: 2,
    title: 'Paz interior',
    verse: { text: 'Deixo-vos a paz, a minha paz vos dou.', ref: 'Jo 14,27' },
    reflection: 'Naquela primeira aparição, Catarina ficou ajoelhada junto de Nossa Senhora, com as mãos apoiadas em seu colo, como uma filha perto da mãe. Maria falou de tempos difíceis, mas convidou a buscar consolo aos pés do altar. A paz não depende de tudo estar calmo lá fora. Descanse um pouco perto dela.',
    intention: 'Peço a paz interior, a serenidade nos pensamentos e o descanso para o meu coração.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Lágrimas de Maria',
    meditation: 'Contemplemos Maria chorando sobre as calamidades que viriam sobre o mundo, pensando que o coração de seu Filho seria ultrajado na cruz, escarnecido, e seus filhos prediletos perseguidos. Confiemos na Virgem compassiva e também participemos do fruto de suas lágrimas.'
  },
  {
    n: 3,
    title: 'Família e amor',
    verse: { text: 'Mulher, eis aí o teu filho.', ref: 'Jo 19,26' },
    reflection: 'No verso da Medalha Milagrosa estão dois corações lado a lado: o de Jesus, coroado de espinhos, e o de Maria, atravessado por uma espada. É o amor que sofre junto e não abandona. Coloque hoje cada pessoa da sua família dentro desses dois corações.',
    intention: 'Peço pela minha família: que haja amor, diálogo, cuidado e união entre nós.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Proteção de Maria',
    meditation: 'Contemplemos Nossa Imaculada Mãe, dizendo, em suas aparições, a Santa Catarina: “Eu mesma estarei convosco: não vos perco de vista e vos concederei abundantes graças”. Sede para mim, Virgem Imaculada, o escudo e a defesa em todas as necessidades.'
  },
  {
    n: 4,
    title: 'Saúde e proteção',
    verse: { text: 'Porei inimizade entre ti e a mulher, entre a tua descendência e a descendência dela.', ref: 'Gn 3,15' },
    reflection: 'Na medalha, Nossa Senhora está de pé sobre o globo e pisa a serpente: o mal não tem a última palavra. As primeiras medalhas foram distribuídas em 1832, durante uma epidemia de cólera em Paris, e muitas pessoas recorreram a ela com fé. Entregue a Maria as suas dores e as de quem você ama.',
    intention: 'Peço saúde do corpo, da mente e da alma, e a proteção de Deus para mim e para quem eu amo.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Segunda aparição',
    meditation: 'Estando Santa Catarina Labouré em oração, a 27 de novembro de 1830, apareceu-lhe a Virgem Maria, formosíssima, esmagando a cabeça da serpente infernal. Nessa aparição, vemos seu desejo imenso de nos proteger sempre contra o inimigo de nossa salvação. Invoquemos a Imaculada Mãe com confiança e amor.'
  },
  {
    n: 5,
    title: 'Perdão e liberdade',
    verse: { text: 'Pai, perdoa-lhes, porque não sabem o que fazem.', ref: 'Lc 23,34' },
    reflection: 'Em torno da imagem da medalha está escrito: “Ó Maria concebida sem pecado, rogai por nós que recorremos a vós”. Maria, sem pecado, não se afasta de nós, pecadores: ela intercede. Muitas conversões foram atribuídas a essa medalha. Peça hoje a graça de perdoar, de pedir perdão e de se perdoar.',
    intention: 'Peço a graça do perdão: perdoar quem me feriu, pedir perdão a quem feri e me libertar do que me prende.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'As mãos de Maria',
    meditation: 'Contemplemos, hoje, Maria desprendendo de suas mãos raios luminosos. “Estes raios, disse Ela, são a figura das graças que derramo sobre todos aqueles que mas pedem e aos que trazem com fé a minha medalha”. Não desperdicemos tantas graças! Peçamos, com fervor, humildade e perseverança, pois Maria Imaculada nos alcançará.'
  },
  {
    n: 6,
    title: 'Caminhos e decisões',
    verse: { text: 'Fazei tudo o que ele vos disser.', ref: 'Jo 2,5' },
    reflection: 'No verso da medalha há a letra M unida a uma cruz. Maria está sempre ligada a Jesus e sempre aponta para Ele. Quando o caminho não estiver claro, olhe para onde ela aponta. Um passo de cada vez já é suficiente.',
    intention: 'Peço luz para as minhas decisões e discernimento para escolher o caminho que agrada a Deus.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Terceira aparição',
    meditation: 'Contemplemos Maria aparecendo a Santa Catarina, radiante de luz, cheia de bondade, rodeada de estrelas, mandando cunhar uma medalha e prometendo muitas graças a todos que a trouxerem com devoção e amor. Guardemos fervorosamente a Santa Medalha, pois, como um escudo, ela nos protegerá dos perigos.'
  },
  {
    n: 7,
    title: 'Força e perseverança',
    verse: { text: 'Tudo posso naquele que me fortalece.', ref: 'Fl 4,13' },
    reflection: 'Depois das aparições, Santa Catarina passou cerca de 46 anos em silêncio, servindo os idosos de um asilo e fazendo tarefas simples. Quase ninguém sabia que era ela a vidente da medalha. Perseverar é ser fiel nas pequenas coisas de cada dia. Se hoje está difícil, você chegou até aqui.',
    intention: 'Peço força para enfrentar as dificuldades e perseverança para não desistir do bem.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Súplica',
    meditation: 'Ó Virgem Milagrosa, Rainha Excelsa Imaculada Senhora, sede minha advogada, meu refúgio e asilo nesta terra, meu consolo nas tristezas e aflições, minha fortaleza e advogada na hora da morte.'
  },
  {
    n: 8,
    title: 'Gratidão',
    verse: { text: 'A minha alma engrandece o Senhor, e o meu espírito exulta em Deus, meu Salvador.', ref: 'Lc 1,46-47' },
    reflection: 'Catarina viu raios de luz saindo das mãos de Nossa Senhora: eram as graças derramadas sobre quem as pede. Algumas pedras dos anéis não brilhavam. Segundo o seu relato, eram as graças que as pessoas se esquecem de pedir. Agradeça hoje pelas graças recebidas, e não tenha medo de pedir.',
    intention: 'Agradeço a Deus por todas as graças recebidas, as que percebi e as que ainda não percebi.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Súplica',
    meditation: 'Ó Virgem Imaculada da Medalha Milagrosa, fazei com que esses raios luminosos que irradiam de vossas mãos virginais iluminem minha inteligência para melhor conhecer o bem e abrasem meu coração, vivos sentimentos de fé, esperança e caridade.'
  },
  {
    n: 9,
    title: 'Entrega e ação de graças',
    verse: { text: 'Apareceu no céu um grande sinal: uma mulher vestida de sol, tendo a lua debaixo dos pés e sobre a cabeça uma coroa de doze estrelas.', ref: 'Ap 12,1' },
    reflection: 'Na aparição de 27 de novembro de 1830, Nossa Senhora segurava um pequeno globo dourado e o oferecia a Deus: o mundo inteiro e cada pessoa. Hoje, entregue pelas mãos dela tudo o que foi rezado nestes nove dias, e agradeça pelo caminho percorrido.',
    intention: 'Entrego a Deus, pelas mãos de Nossa Senhora das Graças, todas as intenções desta novena, e agradeço por cada dia de oração.',
    /* Meditação tradicional da novena da Medalha Milagrosa */
    meditationTitle: 'Súplica',
    meditation: 'Ó Mãe Imaculada, fazei com que a cruz de vossa Medalha brilhe sempre diante de meus olhos, suavize as penas da vida presente e conduza-me à vida eterna.'
  }
];

/* História da devoção, para a página "Sobre Nossa Senhora das Graças" */
const ABOUT = [
  { h: 'As aparições de 1830', p: 'Em 1830, em Paris, na capela das Filhas da Caridade de São Vicente de Paulo, na Rue du Bac, Nossa Senhora apareceu à noviça Catarina Labouré. A primeira aparição foi na noite de 18 para 19 de julho. Na de 27 de novembro, Maria mostrou a ela a imagem da medalha.' },
  { h: 'A imagem da medalha', p: 'Nossa Senhora aparece de pé sobre o globo, pisando a serpente, com as mãos abertas das quais saem raios de luz, sinal das graças que ela derrama sobre quem as pede. Ao redor, a frase: “Ó Maria concebida sem pecado, rogai por nós que recorremos a vós”.' },
  { h: 'O verso da medalha', p: 'A letra M unida a uma cruz, os Sagrados Corações de Jesus e de Maria e doze estrelas ao redor.' },
  { h: 'Por que “Milagrosa”', p: 'As primeiras medalhas foram cunhadas em 1832. Por causa das muitas graças, curas e conversões atribuídas a ela, o povo passou a chamá-la de Medalha Milagrosa.' },
  { h: 'Santa Catarina Labouré', p: 'Catarina guardou silêncio sobre as aparições durante quase toda a vida e serviu os idosos com simplicidade. Morreu em 31 de dezembro de 1876 e foi canonizada em 1947.' },
  { h: 'A festa', p: 'A memória de Nossa Senhora da Medalha Milagrosa, ou Nossa Senhora das Graças, é celebrada em 27 de novembro. Por tradição, muitas pessoas rezam a novena de 18 a 26 de novembro, mas ela pode ser rezada em qualquer época do ano.' }
];


/* Mistérios do Rosário */
const MYSTERIES = {
  gozosos: {
    name: 'Mistérios Gozosos',
    singular: 'Mistério Gozoso',
    days: 'Segunda-feira e sábado',
    items: [
      { title: 'A Anunciação do Anjo a Maria', ref: 'Lc 1,26-38', reflection: 'O anjo Gabriel anuncia a Maria que ela será a Mãe do Salvador, e ela responde com um “sim” cheio de confiança. Peçamos um coração disponível para Deus.' },
      { title: 'A Visitação de Maria a Isabel', ref: 'Lc 1,39-56', reflection: 'Maria parte apressadamente para ajudar sua prima Isabel. Peçamos a graça de servir com alegria a quem precisa de nós.' },
      { title: 'O Nascimento de Jesus em Belém', ref: 'Lc 2,1-20', reflection: 'O Filho de Deus nasce pobre, numa manjedoura. Peçamos um coração simples, que encontra Deus nas pequenas coisas.' },
      { title: 'A Apresentação do Menino Jesus no Templo', ref: 'Lc 2,22-38', reflection: 'Maria e José apresentam Jesus no Templo, cumprindo a Lei do Senhor. Peçamos a graça de oferecer a Deus a nossa vida.' },
      { title: 'A Perda e o Encontro do Menino Jesus no Templo', ref: 'Lc 2,41-52', reflection: 'Depois de três dias de procura, Maria e José encontram Jesus no Templo. Peçamos a graça de buscar Jesus sempre, mesmo quando parece distante.' }
    ]
  },
  dolorosos: {
    name: 'Mistérios Dolorosos',
    singular: 'Mistério Doloroso',
    days: 'Terça-feira e sexta-feira',
    items: [
      { title: 'A Agonia de Jesus no Horto das Oliveiras', ref: 'Lc 22,39-46', reflection: 'Jesus reza ao Pai em profunda angústia e se entrega à sua vontade. Peçamos força para confiar nos momentos de aflição.' },
      { title: 'A Flagelação de Jesus', ref: 'Jo 19,1', reflection: 'Jesus é açoitado e suporta a dor em silêncio, por amor a nós. Peçamos a graça de oferecer a Deus os nossos sofrimentos.' },
      { title: 'A Coroação de Espinhos', ref: 'Mt 27,27-31', reflection: 'Jesus é coroado de espinhos e humilhado pelos soldados. Peçamos humildade e paciência diante das ofensas.' },
      { title: 'Jesus Carrega a Cruz a Caminho do Calvário', ref: 'Jo 19,17', reflection: 'Jesus carrega a cruz até o Calvário, e Maria o acompanha. Peçamos coragem para carregar as nossas cruzes de cada dia.' },
      { title: 'A Crucifixão e Morte de Jesus', ref: 'Lc 23,33-46', reflection: 'Jesus morre na cruz, entregando o seu espírito ao Pai, e nos dá Maria como Mãe. Peçamos a graça de amar até o fim.' }
    ]
  },
  gloriosos: {
    name: 'Mistérios Gloriosos',
    singular: 'Mistério Glorioso',
    days: 'Quarta-feira e domingo',
    items: [
      { title: 'A Ressurreição de Jesus', ref: 'Lc 24,1-12', reflection: 'Jesus vence a morte e ressuscita ao terceiro dia. Peçamos uma fé viva e cheia de esperança.' },
      { title: 'A Ascensão de Jesus ao Céu', ref: 'At 1,6-11', reflection: 'Jesus sobe ao céu e promete estar conosco todos os dias. Peçamos o desejo sincero do céu.' },
      { title: 'A Vinda do Espírito Santo', ref: 'At 2,1-13', reflection: 'Reunidos em oração com Maria, os apóstolos recebem o Espírito Santo. Peçamos os dons do Espírito para a nossa vida.' },
      { title: 'A Assunção de Maria ao Céu', ref: 'Tradição da Igreja', reflection: 'Ao fim de sua vida terrena, Maria é elevada ao céu em corpo e alma. Peçamos a graça de uma vida santa e de uma boa morte.' },
      { title: 'A Coroação de Maria como Rainha do Céu e da Terra', ref: 'Ap 12,1', reflection: 'Maria é coroada Rainha do céu e da terra. Peçamos confiança na sua proteção de Mãe.' }
    ]
  },
  luminosos: {
    name: 'Mistérios Luminosos',
    singular: 'Mistério Luminoso',
    days: 'Quinta-feira',
    items: [
      { title: 'O Batismo de Jesus no Rio Jordão', ref: 'Mt 3,13-17', reflection: 'No batismo de Jesus, o Pai declara: “Este é o meu Filho amado”. Peçamos a graça de viver como filhos amados de Deus.' },
      { title: 'A Autorrevelação de Jesus nas Bodas de Caná', ref: 'Jo 2,1-12', reflection: 'A pedido de Maria, Jesus transforma a água em vinho. Peçamos a graça de confiar na intercessão de Nossa Senhora.' },
      { title: 'O Anúncio do Reino de Deus com o Convite à Conversão', ref: 'Mc 1,14-15', reflection: 'Jesus anuncia que o Reino de Deus está próximo e nos convida à conversão. Peçamos um coração disposto a mudar.' },
      { title: 'A Transfiguração de Jesus', ref: 'Lc 9,28-36', reflection: 'No monte, Jesus se transfigura diante dos discípulos e o Pai diz: “Escutai-o”. Peçamos a graça de ouvir a voz de Jesus.' },
      { title: 'A Instituição da Eucaristia', ref: 'Lc 22,14-20', reflection: 'Na Última Ceia, Jesus se dá a nós no pão e no vinho. Peçamos amor e reverência pela Eucaristia.' }
    ]
  }
};

const MYSTERY_ORDER = ['gozosos', 'dolorosos', 'gloriosos', 'luminosos'];

/* Domingo = 0 ... Sábado = 6 */
const WEEKDAY_MYSTERY = ['gloriosos', 'gozosos', 'dolorosos', 'gloriosos', 'luminosos', 'dolorosos', 'gozosos'];
const WEEKDAY_NAMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

const ORDINALS = ['1º', '2º', '3º', '4º', '5º'];

const COMPLETION_MESSAGE = 'Você concluiu mais um dia da sua novena. Que este momento de oração fortaleça sua fé.';

