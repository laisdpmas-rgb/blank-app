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
  nsgracas: {
    title: 'Oração a Nossa Senhora das Graças',
    text: [
      'Ó Imaculada Virgem, Mãe de Deus e nossa Mãe, ao contemplar-vos de braços abertos derramando graças sobre os que vo-las pedem, cheios de confiança na vossa poderosa intercessão, inúmeras vezes manifestada pela Medalha Milagrosa, embora reconhecendo a nossa indignidade por causa de nossas inúmeras culpas, ousamos nos aproximar de vossos pés para vos expor, durante esta oração, as nossas mais prementes necessidades.',
      '(Faça um momento de silêncio e apresente a graça que deseja alcançar.)',
      'Concedei, pois, ó Virgem da Medalha Milagrosa, este favor que confiantes vos solicitamos, para maior glória de Deus, engrandecimento do vosso nome e o bem de nossas almas. E, para melhor servirmos ao vosso Divino Filho, inspirai-nos profundo ódio ao pecado e dai-nos coragem de nos afirmar sempre verdadeiros cristãos. Amém.',
      'Ó Maria concebida sem pecado, rogai por nós que recorremos a vós. (três vezes)'
    ]
  },
  lembraivos: {
    title: 'Oração final da novena — Lembrai-vos',
    text: [
      'Lembrai-vos, ó piíssima Virgem Maria, que nunca se ouviu dizer que algum daqueles que têm recorrido à vossa proteção, implorado a vossa assistência e reclamado o vosso socorro, fosse por vós desamparado.',
      'Animado eu, pois, com igual confiança, a vós, ó Virgem entre todas singular, como a Mãe recorro, de vós me valho e, gemendo sob o peso dos meus pecados, me prostro a vossos pés.',
      'Não desprezeis as minhas súplicas, ó Mãe do Verbo de Deus humanado, mas dignai-vos de as ouvir propícias e de me alcançar o que vos rogo. Amém.'
    ]
  }
};

/* Ordem em que as orações aparecem na página "Todas as orações" */
const PRAYER_ORDER = [
  'sinal', 'espirito', 'oferecimento', 'credo', 'painosso', 'avemaria',
  'gloria', 'jaculatoria', 'salve', 'nsgracas', 'lembraivos'
];

const DAYS = [
  {
    n: 1,
    title: 'Entrega e confiança',
    verse: { text: 'Eis aqui a serva do Senhor. Faça-se em mim segundo a tua palavra.', ref: 'Lc 1,38' },
    reflection: 'Maria não sabia tudo o que viria pela frente, mas confiou. Hoje você também não precisa ter todas as respostas. Basta começar, do jeito que está, e entregar a Deus aquilo que pesa no seu coração.',
    intention: 'Peço a graça de confiar mais em Deus e de entregar em suas mãos tudo o que não consigo controlar.'
  },
  {
    n: 2,
    title: 'Paz interior',
    verse: { text: 'Deixo-vos a paz, a minha paz vos dou.', ref: 'Jo 14,27' },
    reflection: 'A paz que Jesus oferece não depende de tudo estar resolvido. Ela nasce quando paramos um pouco e lembramos que não estamos sozinhos. Respire com calma e deixe Maria acalmar o seu coração.',
    intention: 'Peço a paz interior, a serenidade nos pensamentos e o descanso para o meu coração.'
  },
  {
    n: 3,
    title: 'Família e amor',
    verse: { text: 'Sua mãe guardava todas estas coisas no coração.', ref: 'Lc 2,51' },
    reflection: 'Maria cuidou da Sagrada Família com amor simples e paciente. Toda família tem alegrias e feridas. Hoje, coloque cada pessoa da sua casa e da sua história sob o manto de Nossa Senhora.',
    intention: 'Peço pela minha família: que haja amor, diálogo, cuidado e união entre nós.'
  },
  {
    n: 4,
    title: 'Saúde e proteção',
    verse: { text: 'Vinde a mim, todos vós que estais cansados e sobrecarregados, e eu vos darei descanso.', ref: 'Mt 11,28' },
    reflection: 'Nosso corpo e nossa mente também precisam de cuidado. Nossa Senhora das Graças é Mãe atenta a quem sofre. Apresente a ela as suas dores e as de quem você ama, com simplicidade.',
    intention: 'Peço saúde do corpo, da mente e da alma, e a proteção de Deus para mim e para quem eu amo.'
  },
  {
    n: 5,
    title: 'Perdão e liberdade',
    verse: { text: 'Pai, perdoa-lhes, porque não sabem o que fazem.', ref: 'Lc 23,34' },
    reflection: 'Perdoar não é esquecer nem fingir que não doeu. É deixar que Deus cuide da ferida, para que ela não nos prenda mais. Peça a graça de perdoar e também de se perdoar.',
    intention: 'Peço a graça do perdão: perdoar quem me feriu, pedir perdão a quem feri e me libertar do que me prende.'
  },
  {
    n: 6,
    title: 'Caminhos e decisões',
    verse: { text: 'Fazei tudo o que ele vos disser.', ref: 'Jo 2,5' },
    reflection: 'Em Caná, Maria percebeu a necessidade e apontou para Jesus. Quando não sabemos que caminho seguir, ela nos ensina a ouvir o Filho. Um passo de cada vez já é suficiente.',
    intention: 'Peço luz para as minhas decisões e discernimento para escolher o caminho que agrada a Deus.'
  },
  {
    n: 7,
    title: 'Força e perseverança',
    verse: { text: 'Tudo posso naquele que me fortalece.', ref: 'Fl 4,13' },
    reflection: 'Maria permaneceu de pé junto à cruz. Perseverar não é nunca cair, é recomeçar sempre que for preciso. Se hoje está difícil, você chegou até aqui, e isso já é uma forma de fidelidade.',
    intention: 'Peço força para enfrentar as dificuldades e perseverança para não desistir do bem.'
  },
  {
    n: 8,
    title: 'Gratidão',
    verse: { text: 'A minha alma engrandece o Senhor, e o meu espírito exulta em Deus, meu Salvador.', ref: 'Lc 1,46-47' },
    reflection: 'Maria cantou as maravilhas de Deus em sua vida. Hoje, olhe com calma para o que você recebeu: pessoas, momentos, pequenas graças do dia a dia. A gratidão abre espaço para a alegria.',
    intention: 'Agradeço a Deus por todas as graças recebidas, as que percebi e as que ainda não percebi.'
  },
  {
    n: 9,
    title: 'Entrega e ação de graças',
    verse: { text: 'Dai graças ao Senhor, porque ele é bom; porque eterna é a sua misericórdia.', ref: 'Sl 136(135),1' },
    reflection: 'Chegamos ao último dia. Tudo o que foi rezado nestes dias está nas mãos de Deus, por meio de Maria. Entregue mais uma vez as suas intenções e agradeça pelo caminho percorrido.',
    intention: 'Entrego a Deus, pelas mãos de Nossa Senhora das Graças, todas as intenções desta novena, e agradeço por cada dia de oração.'
  }
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
