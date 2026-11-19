/* Testes ponta a ponta do aplicativo (Playwright).
   Uso:  python3 -m http.server 8765 --directory novena   (em outro terminal)
         node novena/tests/e2e.js [http://localhost:8765/] [pasta-de-screenshots]  */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:8765/';
const SHOTS = process.argv[3] || null;
let failures = 0;
function check(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { console.log('  ✗ ' + msg); failures++; }
}

const EXPECTED_OPENING = [
  'Sinal da Cruz', 'Invocação ao Espírito Santo', 'Oferecimento do Terço',
  'Credo (Símbolo dos Apóstolos)', 'Pai-Nosso', 'Três Ave-Marias', 'Glória ao Pai'
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  const h1 = () => page.locator('h1').first().innerText();
  const primary = () => page.locator('.flow-nav .btn-primary');
  const shot = async name => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }); };

  console.log('1. Tela inicial');
  await page.goto(BASE);
  await page.waitForSelector('.home');
  check((await h1()) === 'Minha Novena de Nossa Senhora das Graças', 'título correto');
  check((await page.locator('.subtitle').innerText()).includes('Nove dias de fé, oração e entrega.'), 'subtítulo correto');
  check((await page.locator('.progress-count').innerText()).includes('0 de 9'), 'indicador 0 de 9');
  check(await page.getByText('COMEÇAR MINHA NOVENA').isVisible(), 'botão COMEÇAR MINHA NOVENA');
  check(await page.locator('.hero img').isVisible(), 'imagem de Nossa Senhora visível');
  await page.click('.about-link');
  await page.waitForFunction(() => location.hash === '#sobre' && document.querySelectorAll('.card').length === 6);
  check((await h1()) === 'Nossa Senhora das Graças' && (await page.locator('.card').count()) === 6, 'página sobre a Medalha Milagrosa');
  await page.goto(BASE);
  await page.waitForSelector('.home');
  await shot('01-home');

  console.log('2. Navegação entre os nove dias');
  const titles = ['Entrega e confiança', 'Paz interior', 'Família e amor', 'Saúde e proteção', 'Perdão e liberdade',
    'Caminhos e decisões', 'Força e perseverança', 'Gratidão', 'Entrega e ação de graças'];
  for (let i = 1; i <= 9; i++) {
    await page.goto(BASE + '#/dia/' + i);
    await page.waitForSelector('.day');
    const ok = (await h1()) === titles[i - 1]
      && await page.locator('.verse').isVisible()
      && await page.getByText('Intenção do dia').isVisible()
      && await page.locator('#personal').isVisible()
      && await page.getByText('INICIAR A ORAÇÃO').isVisible();
    check(ok, `Dia ${i}: ${titles[i - 1]} (reflexão, intenção, campo pessoal e botão)`);
  }
  await page.goto(BASE + '#/dias');
  check((await page.locator('.day-item').count()) === 9, 'lista com 9 dias');

  console.log('3. Seleção de mistérios por dia da semana');
  const map = await page.evaluate(() => {
    const out = {};
    // 2 a 8 de novembro de 2026: segunda a domingo
    for (let d = 2; d <= 8; d++) out[WEEKDAY_NAMES[new Date(2026, 10, d).getDay()]] = todaysMysterySet(new Date(2026, 10, d));
    return out;
  });
  check(map['segunda-feira'] === 'gozosos' && map['sábado'] === 'gozosos', 'segunda e sábado: Gozosos');
  check(map['terça-feira'] === 'dolorosos' && map['sexta-feira'] === 'dolorosos', 'terça e sexta: Dolorosos');
  check(map['quarta-feira'] === 'gloriosos' && map['domingo'] === 'gloriosos', 'quarta e domingo: Gloriosos');
  check(map['quinta-feira'] === 'luminosos', 'quinta: Luminosos');
  await page.goto(BASE + '#/dia/1');
  const todaySet = await page.evaluate(() => todaysMysterySet());
  check((await page.locator('#mset').inputValue()) === todaySet, `seletor já vem com os mistérios de hoje (${todaySet})`);
  await page.selectOption('#mset', 'luminosos');
  check((await page.locator('#mset').inputValue()) === 'luminosos', 'troca manual de mistérios');

  console.log('4. Intenção pessoal com salvamento automático');
  await page.fill('#personal', 'Pela saúde da minha mãe');
  await page.waitForTimeout(700);
  await page.reload();
  await page.waitForSelector('.day');
  check((await page.locator('#personal').inputValue()) === 'Pela saúde da minha mãe', 'intenção pessoal mantida após recarregar');
  await page.selectOption('#mset', 'luminosos');
  await shot('02-dia');

  console.log('5. Sequência correta das orações');
  await page.getByText('INICIAR A ORAÇÃO').click();
  await page.waitForSelector('.flow');
  const seen = [];
  for (let i = 0; i < 7; i++) {
    seen.push(await h1());
    if (i === 0) await shot('03-sinal');
    if (await page.locator('[data-action="count"]').count()) {
      for (let k = 0; k < 3; k++) await page.locator('[data-action="count"]').click();
      check((await page.locator('.bead.done').count()) === 3, 'três Ave-Marias contadas');
    }
    await primary().click();
  }
  check(JSON.stringify(seen) === JSON.stringify(EXPECTED_OPENING), 'abertura: ' + seen.join(' → '));
  check((await page.locator('.eyebrow').textContent()).includes('1º Mistério Luminoso'), 'primeira dezena com os mistérios escolhidos');
  check((await h1()) === 'O Batismo de Jesus no Rio Jordão', '1º mistério luminoso correto');
  await shot('04-misterio');
  await primary().click();
  check((await h1()) === 'Pai-Nosso', 'Pai-Nosso da dezena');
  await primary().click();

  console.log('6. Contador das Ave-Marias');
  check((await h1()) === 'Dez Ave-Marias', 'tela das dez Ave-Marias');
  check((await page.locator('.bead').count()) === 10, '10 contas visíveis');
  for (let k = 0; k < 4; k++) await page.locator('[data-action="count"]').click();
  check((await page.locator('.count-status').innerText()) === 'Ave-Maria 5 de 10', 'após 4 toques: Ave-Maria 5 de 10');
  await shot('05-contador');
  await page.locator('[data-action="undo-count"]').click();
  check((await page.locator('.bead.done').count()) === 3, 'desfazer volta uma conta');
  await page.locator('[data-action="count"]').click();

  console.log('7. Retomada após fechar o navegador');
  const storage = await context.storageState();
  await page.close();
  const context2 = await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: storage, acceptDownloads: true });
  const p2 = await context2.newPage();
  p2.on('pageerror', e => errors.push(e.message));
  await p2.goto(BASE);
  await p2.waitForSelector('.home');
  check(await p2.getByText('CONTINUAR DE ONDE PAREI').isVisible(), 'botão CONTINUAR DE ONDE PAREI');
  check((await p2.locator('[data-action="resume"] small').innerText()).includes('Dia 1'), 'mostra onde parou');
  await p2.getByText('CONTINUAR DE ONDE PAREI').click();
  await p2.waitForSelector('.flow');
  check((await p2.locator('h1').first().innerText()) === 'Dez Ave-Marias', 'voltou para a mesma etapa');
  check((await p2.locator('.bead.done').count()) === 4, 'contagem da dezena preservada (4)');
  for (let k = 0; k < 6; k++) await p2.locator('[data-action="count"]').click();
  check((await p2.locator('.count-status').innerText()) === 'Dezena completa', 'ao completar 10: Dezena completa');
  check((await p2.locator('.flow-nav .btn-primary').innerText()).includes('PRÓXIMA ORAÇÃO'), 'apresenta a próxima etapa');
  check((await p2.locator('.flow-nav .btn-primary small').innerText()).includes('Glória ao Pai'), 'a seguir: Glória ao Pai');

  console.log('8. Pausar e voltar');
  await p2.locator('[data-action="pause"]').click();
  await p2.waitForSelector('.home');
  await p2.locator('[data-action="resume"]').click();
  await p2.waitForSelector('.flow');
  await p2.locator('[data-action="prev"]').click();
  check((await p2.locator('h1').first().innerText()) === 'Pai-Nosso', 'botão Voltar retorna ao Pai-Nosso');
  await p2.locator('.flow-nav .btn-primary').click();
  check((await p2.locator('.bead.done').count()) === 10, 'dezena continua completa ao avançar de novo');

  console.log('9. Concluindo o dia (restante da sequência)');
  const rest = [];
  for (let guard = 0; guard < 80; guard++) {
    if (!(await p2.locator('.flow').count())) break;
    const t = await p2.locator('h1').first().innerText();
    rest.push(t);
    while (await p2.locator('[data-action="count"]').count()) await p2.locator('[data-action="count"]').click();
    const label = await p2.locator('.flow-nav .btn-primary').innerText();
    await p2.locator('.flow-nav .btn-primary').click();
    if (label.includes('CONCLUIR')) break;
  }
  const expectedTail = ['Salve-Rainha', 'Ato de contrição', 'Meditação do dia · Primeira aparição', 'Súplica a Nossa Senhora', 'Intenção do dia', 'Três Ave-Marias', 'Jaculatória da Medalha Milagrosa', 'Oração final', 'Sinal da Cruz'];
  check(JSON.stringify(rest.slice(-9)) === JSON.stringify(expectedTail), 'encerramento: ' + rest.slice(-9).join(' → '));
  check(rest.filter(t => t === 'Dez Ave-Marias').length === 5, 'cinco dezenas no total');
  check(rest.filter(t => t === 'Jaculatória de Fátima').length === 5, 'jaculatória após cada dezena');
  await p2.waitForSelector('.done-page');
  check((await p2.locator('.done-message').first().innerText()) === 'Você concluiu mais um dia da sua novena. Que este momento de oração fortaleça sua fé.', 'mensagem de conclusão exata');
  if (SHOTS) await p2.screenshot({ path: `${SHOTS}/06-concluido.png` });
  await p2.goto(BASE);
  check((await p2.locator('.progress-count').innerText()).includes('1 de 9'), 'início mostra 1 de 9');

  console.log('10. Jaculatória opcional');
  await p2.goto(BASE + '#/ajustes');
  await p2.locator('[data-key="jaculatoria"]').click();
  const withoutJac = await p2.evaluate(() => buildSteps({ mode: 'novena', day: 2, set: 'gozosos' }).filter(isVisible).length);
  const total = await p2.evaluate(() => buildSteps({ mode: 'novena', day: 2, set: 'gozosos' }).length);
  check(total - withoutJac === 5, 'desativar a jaculatória remove 5 etapas');
  await p2.locator('[data-key="jaculatoria"]').click();

  console.log('11. Diário de intenções');
  await p2.goto(BASE + '#/intencoes');
  await p2.fill('#new-int', 'Que eu encontre um novo trabalho');
  await p2.locator('[data-action="add-int"]').click();
  await p2.locator('[data-action="new-type"][data-value="pessoa"]').click();
  await p2.fill('#new-int', 'Maria, minha avó');
  await p2.locator('[data-action="add-int"]').click();
  await p2.locator('[data-action="new-type"][data-value="agradecimento"]').click();
  await p2.fill('#new-int', 'Pela minha família');
  await p2.locator('[data-action="add-int"]').click();
  check((await p2.locator('.int-item').count()) === 3, 'três intenções criadas');
  await p2.locator('[data-action="edit-int"]').first().click();
  await p2.locator('.int-item.editing textarea').fill('Pela minha família e amigos');
  await p2.locator('[data-action="save-edit"]').click();
  check(await p2.getByText('Pela minha família e amigos').isVisible(), 'intenção editada');
  await p2.locator('[data-action="filter-int"][data-value="pessoa"]').click();
  check((await p2.locator('.int-item').count()) === 1, 'filtro por pessoas');
  await p2.locator('[data-action="filter-int"][data-value="todos"]').click();
  await p2.locator('[data-action="del-int"]').last().click();
  await p2.locator('[data-confirm="yes"]').click();
  check((await p2.locator('.int-item').count()) === 2, 'intenção excluída com confirmação');
  if (SHOTS) await p2.screenshot({ path: `${SHOTS}/07-intencoes.png` });
  const [download] = await Promise.all([p2.waitForEvent('download'), p2.locator('[data-action="export-int"]').click()]);
  const fs = require('fs');
  const txt = fs.readFileSync(await download.path(), 'utf8');
  check(download.suggestedFilename().startsWith('minhas-intencoes-') && txt.includes('Maria, minha avó') && txt.includes('Pela saúde da minha mãe'), 'exportação em arquivo .txt');
  await p2.reload();
  check((await p2.locator('.int-item').count()) === 2, 'intenções mantidas após recarregar');

  console.log('12. Terço avulso, ajustes e impressão');
  await p2.goto(BASE + '#/terco');
  await p2.locator('[data-action="start-terco"]').click();
  await p2.waitForSelector('.flow');
  check((await p2.locator('.flow-context').innerText()).startsWith('Terço'), 'terço avulso inicia');
  await p2.locator('[data-action="open-display"]').click();
  await p2.locator('[data-action="font-up"]').click();
  await p2.locator('[data-action="theme"][data-value="dark"]').click();
  check((await p2.evaluate(() => document.documentElement.dataset.appTheme)) === 'dark', 'modo noturno');
  if (SHOTS) await p2.screenshot({ path: `${SHOTS}/08-noturno-ajustes.png` });
  await p2.locator('[data-action="close-modal"]').click();
  if (SHOTS) await p2.screenshot({ path: `${SHOTS}/09-noturno.png` });
  await p2.goto(BASE + '#/ajustes');
  await p2.locator('[data-action="theme"][data-value="light"]').click();
  await p2.goto(BASE + '#/oracoes');
  const allText = await p2.locator('main').innerText();
  check(['Salve, Rainha', 'Creio em Deus Pai', 'Senhor meu, Jesus Cristo', 'Santíssima Virgem, eu reconheço', 'Ó meu Jesus', 'Ó Imaculada Virgem', 'Vinde, Espírito Santo', 'Divino Jesus'].every(s => allText.includes(s)), 'página de orações completa');

  console.log('13. Reiniciar a novena (com confirmação)');
  await p2.goto(BASE + '#/ajustes');
  await p2.locator('[data-action="reset-novena"]').click();
  await p2.locator('[data-confirm="no"]').click();
  await p2.goto(BASE);
  check((await p2.locator('.progress-count').innerText()).includes('1 de 9'), 'cancelar mantém o progresso');
  await p2.goto(BASE + '#/ajustes');
  await p2.locator('[data-action="reset-novena"]').click();
  await p2.locator('[data-confirm="yes"]').click();
  await p2.waitForSelector('.home');
  check((await p2.locator('.progress-count').innerText()).includes('0 de 9'), 'confirmar zera a novena');

  console.log('14. Funcionamento offline');
  await p2.goto(BASE);
  await p2.evaluate(() => navigator.serviceWorker.ready);
  await p2.reload();
  await p2.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context2.setOffline(true);
  await p2.reload();
  await p2.waitForSelector('.home');
  check((await p2.locator('h1').first().innerText()).includes('Nossa Senhora das Graças'), 'abre sem internet');
  await p2.goto(BASE + '#/oracoes');
  check(await p2.getByText('Salve, Rainha').first().isVisible(), 'orações disponíveis offline');
  const imgOk = await p2.evaluate(() => { const i = document.createElement('img'); i.src = 'img/nossa-senhora.jpg'; return new Promise(r => { i.onload = () => r(true); i.onerror = () => r(false); }); });
  check(imgOk, 'imagem disponível offline');
  await context2.setOffline(false);

  console.log('15. Telas pequenas (320 px)');
  await p2.setViewportSize({ width: 320, height: 568 });
  for (const r of ['', 'dias', 'dia/4', 'terco', 'intencoes', 'oracoes', 'ajustes', 'silencio', 'ajuda', 'sobre']) {
    await p2.goto(BASE + '#/' + r);
    await p2.waitForTimeout(80);
    const over = await p2.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(over <= 0, `sem rolagem horizontal em #/${r}`);
  }
  await p2.goto(BASE + '#/dia/1');
  await p2.locator('[data-action="start-day"]').click();
  for (let k = 0; k < 7; k++) await p2.locator('.flow-nav .btn-primary').click();
  for (let k = 0; k < 2; k++) await p2.locator('.flow-nav .btn-primary').click();
  const over = await p2.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(over <= 0, 'contador sem rolagem horizontal em 320 px');
  const btnVisible = await p2.locator('.flow-nav .btn-primary').isVisible();
  check(btnVisible, 'botão principal visível em 320 px');
  if (SHOTS) await p2.screenshot({ path: `${SHOTS}/10-pequeno-contador.png` });

  check(errors.length === 0, 'nenhum erro de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(failures ? `\n${failures} falha(s).` : '\nTodos os testes passaram.');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
