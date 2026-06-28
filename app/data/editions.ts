/* ─── Content block types ──────────────────────────────────────── */

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'bold-italic'; text: string }
  | { type: 'link'; text: string; href: string }

export type ContentBlock =
  | { type: 'edition-banner'; newsletterName: string; subtitle?: string; accentColor?: string }
  | { type: 'sponsor'; label: string; brandName: string; logoText?: string }
  | { type: 'intro-card'; nodes: InlineNode[][] }
  | { type: 'streak-cta'; text: string }
  | { type: 'section-label'; label: string }
  | { type: 'heading'; nodes: InlineNode[] }
  | { type: 'paragraph'; nodes: InlineNode[] }
  | { type: 'blockquote'; nodes: InlineNode[] }
  | { type: 'image'; src: string; alt: string; caption: string; width?: number; height?: number }
  | { type: 'photo-grid'; images: { src: string; alt: string }[]; caption: string }
  | { type: 'info-card'; items: { emoji: string; nodes: InlineNode[] }[] }
  | { type: 'bullet-list'; items: InlineNode[][] }
  | { type: 'numbered-list'; items: InlineNode[][] }
  | { type: 'video'; videoId: string; title: string; thumbnail?: string }
  | { type: 'big-quote'; quote: string; attribution: string }
  | { type: 'section-divider' }
  | { type: 'newspaper-cover'; src: string; alt: string }
  | { type: 'agenda-card'; src: string; alt: string }
  | { type: 'footer-desc'; title: string; nodes: InlineNode[][] }
  | { type: 'tns-logo' }

/* ─── Category definitions ─────────────────────────────────────── */

export type Category = {
  slug: string
  label: string
  dotColor: string
  hasReadingProgress: boolean
}

export const CATEGORIES: Category[] = [
  { slug: 'the-news',     label: 'the news',     dotColor: '#F97316', hasReadingProgress: true  },
  { slug: 'night',        label: 'night',         dotColor: '#1E3A5F', hasReadingProgress: false },
  { slug: 'tempo-de-copa',label: 'tempo de copa', dotColor: '#16A34A', hasReadingProgress: false },
  { slug: 'money',        label: 'money',         dotColor: '#0891B2', hasReadingProgress: false },
  { slug: 'health',       label: 'health',        dotColor: '#2563EB', hasReadingProgress: false },
  { slug: 'business',     label: 'business',      dotColor: '#9333EA', hasReadingProgress: false },
  { slug: 'trends',       label: 'trends',        dotColor: '#EF4444', hasReadingProgress: false },
  { slug: 'around',       label: 'around',        dotColor: '#78716C', hasReadingProgress: false },
  { slug: 'travel',       label: 'travel',        dotColor: '#94A3B8', hasReadingProgress: false },
  { slug: 'cult',         label: 'cult',          dotColor: '#DC2626', hasReadingProgress: false },
  { slug: 'better-work',  label: 'better work',   dotColor: '#3B82F6', hasReadingProgress: false },
  { slug: 'rising',       label: 'rising',        dotColor: '#C4B5FD', hasReadingProgress: false },
]

/* ─── Edition type ─────────────────────────────────────────────── */

export type Edition = {
  categorySlug: string
  date: string
  readOnlineUrl?: string
  blocks: ContentBlock[]
}

export type QuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
}

export type Quiz = {
  categorySlug: string
  title: string
  questions: QuizQuestion[]
}

/* ─── Helper ───────────────────────────────────────────────────── */

const t = (text: string): InlineNode => ({ type: 'text', text })
const b = (text: string): InlineNode => ({ type: 'bold', text })
const i = (text: string): InlineNode => ({ type: 'italic', text })
const bi = (text: string): InlineNode => ({ type: 'bold-italic', text })
const lnk = (text: string, href: string): InlineNode => ({ type: 'link', text, href })

/* ─── Editions data ────────────────────────────────────────────── */

export const EDITIONS: Edition[] = [
  /* ── the news (Sunday's edition) ──────────────────────────────── */
  {
    categorySlug: 'the-news',
    date: '28 de junho de 2026',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: "SUNDAY'S",
        accentColor: '#F97316',
      },
      {
        type: 'sponsor',
        label: 'POWERED BY',
        brandName: 'wellhub',
      },
      {
        type: 'intro-card',
        nodes: [
          [t('Bom domingo! Esta é a edição especial de domingo do '), b('the news'), t(' — mais leve, mais curiosa e com tudo o que você precisa saber antes do almoço em família.')],
          [t('Hoje você vai entender o que está acontecendo na '), b('Copa do Mundo'), t(', no '), b('mercado'), t(' e nas '), b('tendências'), t(' que estão moldando o mundo.')],
        ],
      },
      {
        type: 'streak-cta',
        text: 'JÁ REGISTROU SUA LEITURA HOJE? CLIQUE AQUI E MANTENHA SUA SEQUÊNCIA!',
      },
      { type: 'section-label', label: 'BIG STORY' },
      {
        type: 'heading',
        nodes: [t('A moda que virou identidade')],
      },
      {
        type: 'paragraph',
        nodes: [t('Há alguns anos, usar a camiseta de uma marca era apenas um sinal de poder aquisitivo. Hoje, a lógica mudou completamente. A roupa que você veste comunica com quem você se '), b('identifica'), t(', não quanto você '), b('gastou'), t('.')],
      },
      {
        type: 'paragraph',
        nodes: [
          t('Um restaurante californiano com estrela Michelin lançou um moletom que esgotou em minutos e virou item de colecionador. '),
          lnk('Bell\'s Kitchen', '#'),
          t(', o estabelecimento em questão, nunca gastou um centavo em publicidade tradicional — mas tem fila de espera de 3 meses.'),
        ],
      },
      {
        type: 'blockquote',
        nodes: [b('No fim das contas, a camiseta com o logo gigante de uma grife tradicional perdeu espaço para o moletom daquela cafeteria hypada'), t(' ou do seu criador de conteúdo favorito. O topo do guarda-roupa agora pertence a quem consegue gerar conexão real.')],
      },
      {
        type: 'paragraph',
        nodes: [i('É como você usando o moletom do the news…risos.')],
      },
      { type: 'section-label', label: 'COPA DO MUNDO' },
      {
        type: 'heading',
        nodes: [t('Vai começar o mata-mata')],
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=720&q=80',
        alt: 'Jogadores do Brasil comemorando gol na Copa do Mundo',
        caption: '(Imagem: REUTERS | Dylan Martinez)',
        width: 720,
        height: 480,
      },
      {
        type: 'paragraph',
        nodes: [
          b('Hoje começa oficialmente a fase dos 16avos de final na Copa do Mundo.'),
          t(' Para você que está perdido, como nessa edição há muito mais times jogando, a fase de grupos mudou e uma rodada extra de mata-mata precisou ser criada antes das oitavas de final.'),
        ],
      },
      {
        type: 'bullet-list',
        items: [
          [b('Quem se classifica:'), t(' Os 2 primeiros colocados de cada um dos 12 grupos (totalizando 24 seleções) + os 8 melhores terceiros colocados no geral.')],
          [t('Juntando os 24 classificados diretos com os 8 melhores terceiros, temos exatamente '), b('32 seleções'), t('. Elas se enfrentam em jogos únicos eliminatórios (16 partidas).')],
        ],
      },
      {
        type: 'paragraph',
        nodes: [
          t('O jogo que abre essa rodada é Canadá x África do Sul, a partir das 16h. '),
          bi('Amanhã, é a vez da nossa Seleção que pega o Japão, às 14h.'),
        ],
      },
      {
        type: 'sponsor',
        label: 'APRESENTADO POR WELLHUB',
        brandName: 'wellhub',
      },
      {
        type: 'heading',
        nodes: [t('Esses são os colaboradores mais antigos do the news')],
      },
      {
        type: 'photo-grid',
        images: [
          { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', alt: 'Du — 4 anos e 6 meses' },
          { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80', alt: 'Bia — 3 anos e 11 meses' },
          { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80', alt: 'Tchela — 3 anos e 4 meses' },
        ],
        caption: 'Du (4a 6m) · Bia (3a 11m) · Tchela (3a 4m)',
      },
      {
        type: 'paragraph',
        nodes: [t('No mundo do trabalho, isso já é considerado um relacionamento sério. Mas, brincadeiras à parte, o que será que os fez escolher continuar no the news por tanto tempo?')],
      },
      {
        type: 'blockquote',
        nodes: [
          t('Segundo o ROI do Bem-Estar 2026, desenvolvido pelo '),
          b('Wellhub'),
          t(', '),
          b('88% das empresas dizem que reter os melhores talentos é prioridade para 2026'),
          t(' — ainda mais com a IA aumentando a disputa por profissionais de alta performance.'),
        ],
      },
      { type: 'section-label', label: 'MANCHETES' },
      {
        type: 'heading',
        nodes: [t('Manchetes desse domingo')],
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=720&q=80',
        alt: 'Destroços de prédio colapsado',
        caption: '(Imagem: Federico Parra | AFP)',
        width: 720,
        height: 480,
      },
      {
        type: 'bullet-list',
        items: [
          [t('🇻🇪 '), b('Pior em 100 anos.'), t(' O número de mortos pelos terremotos gêmeos que arrasaram o norte da Venezuela '), lnk('subiu para 1.430, além de mais de 3.000 feridos e milhares de desabrigados.', '#'), t(' O Escritório de Ajuda Humanitária da ONU estima que haja mais de 50 mil desaparecidos sob os escombros.')],
          [t('📺 '), b('Ainda na mira.'), t(' O Conar recomendou a '), lnk('suspensão imediata das propagandas de casas de apostas feitas por influenciadores da CazéTV.', '#')],
          [t('⚖️ '), b('Penduricalhos liberados.'), t(' O STF '), lnk('formou maioria para liberar o pagamento de adicionais e gratificações', '#'), t(' — os famosos penduricalhos — recebidos por juízes antes de regras que restringiam esses bônus.')],
          [t('🇦🇷 '), b('Crise em Buenos Aires.'), t(' O chefe de gabinete do presidente argentino Javier Milei '), lnk('renunciou ao cargo após ser alvo de graves acusações de enriquecimento ilícito.', '#')],
        ],
      },
      { type: 'section-label', label: 'TRENDING' },
      {
        type: 'heading',
        nodes: [t('A pausa mais comentada da Copa do Mundo')],
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=720&q=80',
        alt: 'Jogador jogando água sobre si mesmo durante pausa de hidratação',
        caption: '(Imagem: Lynne Sladky | AP)',
        width: 720,
        height: 480,
      },
      {
        type: 'paragraph',
        nodes: [
          t('Tem algo acontecendo na Copa que está tirando alguns torcedores do sério, e não tem nada a ver com cartões vermelhos ou a "famosa cera" dos jogadores. '),
          b('E sim, as duas pausas para hidratação que acontecem durante as partidas.'),
        ],
      },
      {
        type: 'blockquote',
        nodes: [b('Mas foi nesse espaço curto de 3 minutos'), t(' que o mercado publicitário viu a oportunidade perfeita para brilhar.')],
      },
      {
        type: 'bullet-list',
        items: [
          [t('Ela pagou entre '), b('US$ 400 milhões e US$ 500 milhões'), t(' pelos direitos de transmissão de todo o torneio e, só os comerciais exibidos durante as pausas de hidratação, vão render à emissora entre '), b('US$ 250 milhões e US$ 600 milhões'), t('.')],
          [t('Basicamente, marcas como Nike, Adidas e Coca-Cola vão pagar a conta inteira do torneio para a Fox apenas nesses minutinhos de intervalo.')],
        ],
      },
      {
        type: 'video',
        videoId: 'dQw4w9WgXcQ',
        title: 'Como prever o futuro transformou ela em bilionária aos 29 anos?',
      },
      { type: 'section-label', label: 'TO TRAVEL' },
      {
        type: 'heading',
        nodes: [t('The News Travel — Fora do Radar Edition')],
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=720&q=80',
        alt: 'Trem passando por paisagem montanhosa',
        caption: '(Imagem: The News Travel #008 — Fora do Radar Edition)',
        width: 720,
        height: 640,
      },
      {
        type: 'paragraph',
        nodes: [
          t('Quando recebemos mensagens pedindo indicações de lugares para conhecer ao redor do Brasil, sempre há o risco de não abrangermos todas as pluralidades que o país tem para entregar. '),
          lnk('Clique aqui para continuar lendo.', '#'),
        ],
      },
      { type: 'section-label', label: 'TO WATCH & TO READ' },
      {
        type: 'heading',
        nodes: [t('Rivals — Hulu on Disney+')],
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=720&q=80',
        alt: 'Poster da série Rivals no Hulu',
        caption: '(Imagem: Disney+)',
        width: 720,
        height: 400,
      },
      {
        type: 'info-card',
        items: [
          { emoji: '👨‍🍳', nodes: [t('De vendedor de molhos de porta em porta a chef com milhões de seguidores.')] },
          { emoji: '📱', nodes: [t('De amigos de infância em São Gonçalo a nomes fortes da creator economy.')] },
          { emoji: '🎸', nodes: [t('De CEO da Osklen aos 28 anos a líder da Rock World.')] },
        ],
      },
      {
        type: 'paragraph',
        nodes: [
          t('No '),
          b('seis&seis'),
          t(', Cheff Otto, Tet Trem & Hugo Grillo, Luis Justo e outros 30 palestrantes vão contar, ao vivo, o que ainda nos torna únicos. '),
          lnk('Garanta seu lugar clicando aqui.', '#'),
        ],
      },
      { type: 'section-label', label: 'BIG STORY' },
      {
        type: 'heading',
        nodes: [t('O que uma marca precisa para ser inesquecível?')],
      },
      {
        type: 'paragraph',
        nodes: [
          t('A resposta que ninguém quer ouvir — mas que os dados mostram — é '),
          b('coragem de ser real'),
          t('. Não o "real" performático das campanhas de responsabilidade social. O real que faz a marca abrir mão de uma venda para não trair seus valores.'),
        ],
      },
      {
        type: 'blockquote',
        nodes: [
          t('A pergunta que fica é mais incômoda do que qualquer métrica: '),
          lnk('se a sua empresa deixasse de existir amanhã, alguém sentiria falta?', '#'),
        ],
      },
      { type: 'section-label', label: 'RODAPÉ' },
      {
        type: 'footer-desc',
        title: "SUNDAY'S (the news)",
        nodes: [
          [t('A edição de domingo do seu jornal favorito. Nunca seja chato ou desinteressante — ainda mais no almoço de família. Com essa leitura, você terá sempre algo a acrescentar no almoço de logo mais.')],
          [b('Sentiu falta do termômetro?'), t(' É proposital. Domingo vai ser sempre diferente dos dias comuns da semana.')],
          [t('Se inscrever é grátis e cancelar a assinatura também.')],
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── night ─────────────────────────────────────────────────────── */
  {
    categorySlug: 'night',
    date: '28 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'NIGHT',
        accentColor: '#1E3A5F',
      },
      {
        type: 'sponsor',
        label: 'POWERED BY',
        brandName: 'WESTWING',
      },
      { type: 'section-label', label: 'BOA NOITE' },
      {
        type: 'paragraph',
        nodes: [
          b('O Rei Charles resolveu abrir a carteira.'),
          t(' Pela primeira vez na história da monarquia britânica, um rei revelou quanto paga de imposto: '),
          b('£12,9 milhões'),
          t(' só em 2024-2025, colocando Charles entre os 100 maiores contribuintes do Reino Unido.'),
        ],
      },
      {
        type: 'paragraph',
        nodes: [
          t('Tal pai, tal filho… O príncipe William declarou '),
          b('£7,76 milhões'),
          t(' no mesmo período. Juntos, eles repassaram mais de '),
          b('£50 milhões'),
          t(' à Receita Federal britânica desde 2022 — e olha que isso é só o imposto. Imagina quanto gastam em chá.'),
        ],
      },
      {
        type: 'blockquote',
        nodes: [t('A decisão de tornar público o valor dos impostos é uma tentativa de melhorar a imagem da família real após anos de escândalos — de '), b('Harry & Meghan'), t(' aos problemas de saúde do próprio Charles.')],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── tempo de copa ─────────────────────────────────────────────── */
  {
    categorySlug: 'tempo-de-copa',
    date: '28 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'newspaper-cover',
        src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=720&q=80',
        alt: 'TEMPO DE COPA — Edição #28 — Mais um show africano',
      },
      {
        type: 'agenda-card',
        src: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=720&q=80',
        alt: 'Chaveamento mata-mata Copa do Mundo 2026',
      },
      {
        type: 'sponsor',
        label: 'ASSINE JÁ',
        brandName: 'ESTADÃO',
      },
      { type: 'section-label', label: 'BIG STORY' },
      {
        type: 'heading',
        nodes: [t('Mais um show africano')],
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=720&q=80',
        alt: 'Seleção africana comemorando classificação',
        caption: '(Imagem: Reuters | AFP)',
        width: 720,
        height: 480,
      },
      {
        type: 'paragraph',
        nodes: [
          t('A RD Congo tornou-se o '),
          b('11º país africano diferente a avançar da fase de grupos'),
          t(' em Mundiais e um dos cinco que conseguiram esse feito pela primeira vez justamente nesta edição.'),
        ],
      },
      {
        type: 'heading',
        nodes: [t('Ele não para de marcar')],
      },
      {
        type: 'paragraph',
        nodes: [
          t('Mesmo saindo do banco de reservas, Lionel Messi não deixou de balançar as redes na vitória argentina sobre a Jordânia por 3 a 1. Com o gol de falta, o camisa #10 hermano se tornou o primeiro jogador a marcar ao menos um gol em sete jogos consecutivos de Copa do Mundo. '),
          lnk('Aprofunde', '#'),
        ],
      },
      {
        type: 'big-quote',
        quote: 'Antigamente o (Brasil) era forte, mas e agora? Tenho a imagem de que a França é forte. A Argentina também. Sobre o Brasil, não tenho ouvido muito ultimamente.',
        attribution: 'Kento Shiogai, atacante do Japão, ao ser perguntado por jornalistas qual era a primeira imagem que lhe vinha à cabeça ao pensar na seleção brasileira.',
      },
      { type: 'section-label', label: 'AROUND THE WEB' },
      {
        type: 'numbered-list',
        items: [
          [lnk('As 10 camisas mais feias da Copa do Mundo, de acordo com o The Athletic', '#')],
          [lnk('A primeira vez que você vai ver um gol com assistência da bandeirinha de escanteio', '#')],
          [lnk('A linda fala de Rúben Neves sobre sua relação com Diogo Jota', '#')],
          [lnk('Áudio vazado explica o gol anulado da Colômbia contra Portugal', '#')],
          [lnk('O mar de torcedores argentinos em Dallas', '#')],
        ],
      },
      {
        type: 'footer-desc',
        title: 'TEMPO DE COPA',
        nodes: [
          [t('A newsletter diária do the news, em parceria com o Estadão, para o ponto alto do futebol mundial: a Copa do Mundo. '), b('Todos os dias de Copa, às 09:09 da manhã, na sua caixa de entrada.')],
          [t('É tempo de sorrir. É tempo de torcer. É tempo de Brasil. É TEMPO DE COPA.')],
          [t('até amanhã!')],
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── money ─────────────────────────────────────────────────────── */
  {
    categorySlug: 'money',
    date: '26 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'MONEY',
        accentColor: '#0891B2',
      },
      {
        type: 'sponsor',
        label: 'POWERED BY',
        brandName: 'Revolut',
      },
      {
        type: 'heading',
        nodes: [t('Good morning, Brasil.')],
      },
      {
        type: 'paragraph',
        nodes: [
          t('O Ibovespa fechou em alta nesta quinta-feira, chegando a superar a marca dos 173 mil pontos na máxima do dia. Enquanto o mercado repercutia os novos números da inflação doméstica, os holofotes ficaram com a '),
          b('Braskem'),
          t(', cujas ações desabaram após a petroquímica recorrer à Justiça para obter proteção temporária contra a cobrança de credores.'),
        ],
      },
      {
        type: 'blockquote',
        nodes: [
          t('O '),
          b('IPCA-15'),
          t(' registrou alta de 0,41% em junho, mostrando uma desaceleração em relação ao mês anterior. O número ficou ligeiramente abaixo da expectativa do mercado (0,44%), o que deve dar algum alívio ao Banco Central na próxima reunião do Copom.'),
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── health ─────────────────────────────────────────────────────── */
  {
    categorySlug: 'health',
    date: '27 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'HEALTH',
        accentColor: '#2563EB',
      },
      {
        type: 'sponsor',
        label: 'POWERED BY',
        brandName: 'Zenklub',
      },
      { type: 'section-label', label: 'BOM DIA' },
      {
        type: 'paragraph',
        nodes: [
          b('Dormir mal é um problema de saúde pública.'),
          t(' Uma em cada três pessoas no Brasil não dorme o suficiente — e os efeitos vão muito além do cansaço. Falta de sono crônica aumenta o risco de diabetes tipo 2, doenças cardíacas e até Alzheimer.'),
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── business ───────────────────────────────────────────────────── */
  {
    categorySlug: 'business',
    date: '25 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'BUSINESS',
        accentColor: '#9333EA',
      },
      {
        type: 'sponsor',
        label: 'POWERED BY',
        brandName: 'NEOOH',
      },
      { type: 'section-label', label: 'BOA TARDE' },
      {
        type: 'paragraph',
        nodes: [
          t('Você sabia que o perfil do '),
          b('Microsoft Windows'),
          t(' só segue uma pessoa no TikTok? Trata-se de uma comediante famosa por "zoar" logos de marcas e '),
          lnk('criar suas próprias versões engraçadas', '#'),
          t('. A interação rendeu um viral: o clássico logo do Windows ganhou uma versão com o rosto dela e '),
          b('até estampou uma loja em Nova York'),
          t(' ('),
          lnk('veja aqui', '#'),
          t(').'),
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── trends ─────────────────────────────────────────────────────── */
  {
    categorySlug: 'trends',
    date: '22 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'TRENDS',
        accentColor: '#EF4444',
      },
      { type: 'section-label', label: 'BOM DIA' },
      {
        type: 'photo-grid',
        images: [
          { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80', alt: 'Tendência de moda' },
          { src: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=300&q=80', alt: 'Relógio Rolex de polo' },
          { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80', alt: 'Madonna ABSOLUT ICON' },
        ],
        caption: 'As tendências da semana em moda, design e comportamento',
      },
      {
        type: 'paragraph',
        nodes: [t('já acordou vendo a fotinho de alguém em Cannes? boa semana para aqueles que estão em Cannes, ou só vendo todo mundo em Cannes pelo feed.')],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── around ─────────────────────────────────────────────────────── */
  {
    categorySlug: 'around',
    date: '18 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'AROUND',
        accentColor: '#78716C',
      },
      {
        type: 'sponsor',
        label: 'POWERED BY',
        brandName: 'NOVOTEL',
      },
      {
        type: 'big-quote',
        quote: 'Seja você mesmo; todos os outros já existem.',
        attribution: 'Oscar Wilde',
      },
      { type: 'section-label', label: 'YOU MIGHT LIKE THIS' },
      {
        type: 'bullet-list',
        items: [
          [t('🌍 '), lnk('este novo spot', '#'), t(', que une café, design e música no mesmo ambiente.')],
          [t('📖 '), lnk('este livro', '#'), t(', que mostra que boas ideias raramente surgem do nada e como referências são verdadeiros combustíveis criativos.')],
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── travel ─────────────────────────────────────────────────────── */
  {
    categorySlug: 'travel',
    date: '25 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'TRAVEL',
        accentColor: '#94A3B8',
      },
      {
        type: 'sponsor',
        label: 'EM PARCERIA COM',
        brandName: 'Wise',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=720&q=80',
        alt: '5 paisagens brasileiras que desafiam a imaginação',
        caption: 'The News Travel #033 — 5 Paisagens Brasileiras que Desafiam',
        width: 720,
        height: 640,
      },
      {
        type: 'paragraph',
        nodes: [
          t('Separamos alguns dos '),
          b('destinos menos conhecidos'),
          t(' do Brasil que te fazem questionar por que alguém pagaria uma fortuna para conhecer Santorini quando temos isso aqui.'),
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── cult ───────────────────────────────────────────────────────── */
  {
    categorySlug: 'cult',
    date: '27 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'CULT',
        accentColor: '#DC2626',
      },
      { type: 'section-label', label: 'BOA TARDE' },
      {
        type: 'paragraph',
        nodes: [
          b('O cinema de arte está cheio.'),
          t(' Pela primeira vez em anos, os festivais de cinema independente registram crescimento de público — e o perfil do espectador mudou. Mais jovem, mais diverso, mais disposto a 2h30 de silêncio incômodo.'),
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── better work ────────────────────────────────────────────────── */
  {
    categorySlug: 'better-work',
    date: '22 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'the news',
        subtitle: 'BETTER WORK PRO',
        accentColor: '#3B82F6',
      },
      {
        type: 'paragraph',
        nodes: [
          t('Boas-vindas às novas 344 pessoas que se inscreveram na better work na última semana! Agora, somos '),
          b('122.706 futuros&novos líderes'),
          t(' construindo a maior comunidade de carreira do Brasil.'),
        ],
      },
      { type: 'section-label', label: '👋 BOA NOITE.' },
      {
        type: 'paragraph',
        nodes: [
          { type: 'link', text: 'A capa da newsletter mudou, mas é só hoje e a notícia é boa: 1x por mês, você vai receber uma edição completa da nossa versão Pro! Aproveite a leitura 😉', href: '#' },
        ],
      },
      { type: 'tns-logo' },
    ],
  },

  /* ── rising ─────────────────────────────────────────────────────── */
  {
    categorySlug: 'rising',
    date: '25 de junho de 2026',
    readOnlineUrl: '#',
    blocks: [
      {
        type: 'edition-banner',
        newsletterName: 'rising',
        subtitle: undefined,
        accentColor: '#C4B5FD',
      },
      { type: 'section-label', label: 'BOM DIA' },
      {
        type: 'heading',
        nodes: [{ type: 'italic', text: 'recordar é viver.' }],
      },
      {
        type: 'paragraph',
        nodes: [t('ter memórias, boas ou ruins, é sinônimo de ter vivido com presença. aquilo que você guarda vai tecendo a trama da sua personalidade. portanto, o que lembra e a forma como lembra são pontos-chave daquilo que se tornou e daquilo que ainda quer ser.')],
      },
      { type: 'tns-logo' },
    ],
  },
]

/* ─── Quiz data ────────────────────────────────────────────────── */

export const QUIZZES: Quiz[] = [
  {
    categorySlug: 'the-news',
    title: "quiz do dia - sunday's edition (28/06)",
    questions: [
      {
        question: 'qual restaurante californiano com estrela Michelin lançou um moletom que virou raridade?',
        options: ["Trader Joe's", "Max & Helen's", "Bell's", 'CazéTV'],
        correctIndex: 2,
      },
      {
        question: 'qual é o número de países africanos que avançaram de fase nesta Copa do Mundo?',
        options: ['7', '8', '9', '10'],
        correctIndex: 2,
      },
      {
        question: 'qual emissora está lucrando com comerciais durante as pausas de hidratação?',
        options: ['NBC', 'Fox', 'ABC', 'ESPN'],
        correctIndex: 1,
      },
      {
        question: 'qual empresa fez de Luana Lopes Lara a mais jovem bilionária self-made do mundo?',
        options: ['Meta', 'Amazon', 'SpaceX', 'Kalshi'],
        correctIndex: 3,
      },
      {
        question: 'quanto o Rei Charles III declarou de imposto em 2024-2025?',
        options: ['£8,5 milhões', '£10,2 milhões', '£12,9 milhões', '£15,4 milhões'],
        correctIndex: 2,
      },
    ],
  },
]

/* ─── Helpers ──────────────────────────────────────────────────── */

export function getEdition(slug: string): Edition | undefined {
  return EDITIONS.find((e) => e.categorySlug === slug)
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getQuiz(slug: string): Quiz | undefined {
  return QUIZZES.find((q) => q.categorySlug === slug)
}
