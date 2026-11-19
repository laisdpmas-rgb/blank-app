# Minha Novena de Nossa Senhora das Graças

Acompanhante digital para rezar a Novena de Nossa Senhora das Graças durante nove dias, com o Terço Mariano completo e guiado, uma oração por tela.

Feito em HTML, CSS e JavaScript puros. Funciona sem internet depois da primeira abertura, não exige login e **não envia nenhum dado para a internet**: o progresso e as intenções ficam salvos só no aparelho (localStorage).

---

## O que tem no aplicativo

- **Tela inicial**: imagem de Nossa Senhora das Graças, progresso (“0 de 9 dias concluídos”), botão para começar ou continuar de onde parou, e acesso ao Terço, às intenções, às orações e aos ajustes.
- **Nove dias**, cada um com tema, versículo, reflexão curta, intenção do dia e um campo opcional para a intenção pessoal.
- **Modo guiado**: uma oração por tela, na ordem certa. O topo mostra sempre onde você está (Abertura · 1 · 2 · 3 · 4 · 5 · Final, e “Etapa X de Y”). Os botões são **Voltar**, **Próxima oração** e **Pausar**. O próximo passo aparece escrito no botão (“a seguir: Glória ao Pai”).
- **Terço Mariano interativo**: os mistérios são escolhidos automaticamente pelo dia da semana (seg/sáb Gozosos, ter/sex Dolorosos, qua/dom Gloriosos, qui Luminosos) e podem ser trocados à mão. Cada dezena tem o mistério com uma reflexão curta, o Pai-Nosso, o **contador de 10 Ave-Marias** (com “desfazer”), o Glória e a Jaculatória de Fátima (opcional).
- **Salvamento automático** a cada toque. Ao fechar o navegador e voltar, tudo continua do mesmo ponto, inclusive a conta das Ave-Marias.
- **Minhas intenções**: pedidos, pessoas e agradecimentos. Dá para criar, editar, excluir, filtrar e exportar tudo em um arquivo `.txt`.
- **Conclusão do dia** com a mensagem: “Você concluiu mais um dia da sua novena. Que este momento de oração fortaleça sua fé.” Não há cobranças, contagem de dias perdidos nem notificações.
- **Ajustes**: tamanho da letra (5 níveis), texto mais espaçado, aparência (automática, clara, *leitura confortável* em tom de papel, noturna), tela de oração limpa, leitura em tela cheia, manter a tela acesa durante a oração, cronômetro de oração silenciosa (1, 3, 5 ou 10 min), impressão das orações e reinício da novena com confirmação.

### Três formas de rezar cada dia

Na tela de cada dia você escolhe, e o app lembra a escolha para os próximos dias:
- **Só a novena**: Sinal da Cruz, Invocação ao Espírito Santo e as orações próprias da novena (itens 10 a 17 abaixo).
- **Novena com terço**: o terço tradicional, com as Ave-Marias, seguido da novena.
- **Novena com terço da Medalha** (também disponível no Terço Mariano avulso): igual, mas em cada uma das 10 contas de cada dezena reza-se a jaculatória “Ó Maria concebida sem pecado, rogai por nós que recorremos a vós” no lugar da Ave-Maria. É uma devoção popular, e a forma pode variar de lugar para lugar.

### Ordem das orações (novena com terço)

1. Sinal da Cruz
2. Invocação ao Espírito Santo
3. Oferecimento do Terço
4. Credo (Símbolo dos Apóstolos)
5. Pai-Nosso
6. Três Ave-Marias (fé, esperança e caridade)
7. Glória ao Pai
8. Cinco dezenas: mistério → Pai-Nosso → 10 Ave-Marias → Glória ao Pai → Jaculatória de Fátima
9. Salve-Rainha
10. Ato de contrição
11. Meditação do dia (meditação tradicional da novena da Medalha Milagrosa)
12. Súplica a Nossa Senhora (com momento de silêncio para pedir a graça)
13. Intenção do dia (com cronômetro de silêncio opcional)
14. Três Ave-Marias
15. Jaculatória da Medalha: “Ó Maria concebida sem pecado, rogai por nós que recorremos a vós”
16. Oração final
17. Sinal da Cruz

As orações estão nas versões tradicionais em português do Brasil. Cada dia tem um tema, uma reflexão curta baseada na história da Medalha Milagrosa, uma intenção e a meditação tradicional da novena. As reflexões e intenções foram escritas para este aplicativo e não são atribuídas a nenhum santo ou documento oficial. A página “Sobre” conta a história das aparições a Santa Catarina Labouré em 1830. Por tradição, a novena é rezada de 18 a 26 de novembro, antes da festa de 27 de novembro, mas pode ser rezada em qualquer época.

---

## Arquivos

```
novena/
├── index.html            página do aplicativo
├── manifest.json         dados para instalar como aplicativo (PWA)
├── sw.js                 Service Worker (funcionamento offline)
├── css/style.css         visual, temas e impressão
├── js/data.js            orações, nove dias e mistérios
├── js/app.js             telas, modo guiado, contador, intenções e salvamento
├── img/nossa-senhora.jpg ilustração de Nossa Senhora das Graças
├── icons/                ícones do aplicativo (inclusive para iPhone)
└── tests/e2e.js          testes automáticos (opcional, para desenvolvedores)
```

---

## Como abrir no computador

O jeito mais simples é usar um pequeno servidor local, porque o modo offline (Service Worker) só funciona por `http://localhost` ou `https://`.

1. Instale o [Python](https://www.python.org/downloads/), se ainda não tiver. No Mac e no Linux ele já vem instalado.
2. Abra o terminal na pasta do projeto e rode:
   ```bash
   python3 -m http.server 8000 --directory novena
   ```
3. Abra no navegador: **http://localhost:8000**

> Também dá para abrir `index.html` com dois cliques. O aplicativo funciona e salva o progresso, mas, aberto assim, não fica disponível sem internet nem pode ser instalado.

## Como abrir no celular

O celular precisa acessar o aplicativo por um endereço `https://`. O caminho mais fácil é hospedá-lo de graça (veja abaixo) e abrir o link no celular. Depois da primeira abertura, ele funciona sem internet.

## Como instalar no iPhone

1. Abra o endereço do aplicativo no **Safari**. Em outros navegadores do iPhone, a opção pode não aparecer.
2. Toque no botão **Compartilhar** (o quadrado com uma seta para cima).
3. Role a lista e toque em **Adicionar à Tela de Início**.
4. Confirme o nome (“Novena”) e toque em **Adicionar**.
5. Abra pelo ícone novo na tela. Ele abre em tela cheia, como um aplicativo, e funciona sem internet.

> No iPhone, os dados do aplicativo instalado ficam separados dos dados do Safari. Se você começou a novena no Safari e depois instalou, o progresso começa do zero no ícone. O ideal é instalar antes de começar.

## Como instalar no Android

Abra o endereço no **Chrome**, toque no menu **⋮** e escolha **Instalar aplicativo** (ou **Adicionar à tela inicial**).

---

## Como hospedar de graça

Qualquer uma destas opções serve. São só arquivos estáticos, então não há servidor nem banco de dados.

### Opção 1 — Netlify Drop (mais simples, sem conta técnica)
1. Acesse **https://app.netlify.com/drop**.
2. Arraste a pasta **`novena`** inteira para a página.
3. Pronto: você recebe um endereço `https://...netlify.app`. Crie uma conta gratuita para que o site não expire.

### Opção 2 — GitHub Pages (este repositório)
1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em *Build and deployment*, escolha **Deploy from a branch**, selecione a branch e a pasta **`/ (root)`**, e salve.
3. Depois de alguns minutos, o aplicativo estará em:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/novena/`

### Opção 3 — Cloudflare Pages ou Vercel
Crie um projeto a partir do repositório ou envie a pasta `novena` diretamente. Não há comando de build, e a pasta de saída é a própria `novena`.

> Quando atualizar algum arquivo, aumente a versão em `sw.js` (`novena-ns-gracas-v1` → `v2`) para que os celulares recebam a nova versão.

---

## Testes automáticos (opcional)

Requer Node.js e Playwright.

```bash
python3 -m http.server 8765 --directory novena &
node novena/tests/e2e.js http://localhost:8765/
```

Os testes conferem a navegação entre os nove dias, a ordem das orações, o contador de Ave-Marias, a escolha dos mistérios pelo dia da semana, o salvamento automático, a retomada depois de fechar o navegador, o diário de intenções com exportação, o reinício com confirmação, o funcionamento offline e o layout em telas de 320 px.
