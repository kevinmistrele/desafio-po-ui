# Processo de desenvolvimento

Registro do que foi feito, em que ordem e por quê. Atualizado a cada fase.

| Fase | Status |
|---|---|
| 0. Ambiente, projeto e tokens | ✅ Concluída (24/09) |
| 1. Estrutura e design da tela | ✅ Concluída (25/09) |
| 2. Arquitetura de pastas | ✅ Concluída (25/09) |
| 3. Componente Switch | ✅ Concluída (26/09), commit pendente |
| 4. Componente Select | 🚧 Em andamento |
| 5. Playground (conteúdo dos painéis) | ⏳ |
| 6. Testes | ⏳ |
| 7. Deploy e entrega | ⏳ |

---

## Fase 0: Ambiente, projeto e tokens (24/09)

- Projeto criado com Angular CLI 22.2 (Node 24): standalone, zoneless, OnPush por padrão.
- Prefixo `km-` nos seletores (`km-switch`, `km-select`), pra não confundir com o `<select>` nativo.
- Router removido: é uma página só, sem rotas.
- Tokens do tema default do PO UI declarados em `src/styles.css` (só os usados pelos handoffs).

**Commits:** `first commit`, `refactor: remove unused router and app files...`,
`feat: add theme tokens and base styles for UI components`.

---

## Fase 1: Estrutura e design da tela (25/09)

Antes de implementar os componentes, desenhei no Excalidraw como a tela ficaria organizada.

![Wireframe da tela](wireframe-tela.png)

### Organização

```
┌──────────────┬───────────────────────────────────────────────┐
│ Desafio PO UI│ Playground / Switch                           │
│ TOTVS        │ ┌──────────────────────────┐ ┌──────────────┐ │
│              │ │          SWITCH          │ │ Propriedades │ │
│ [ Switch ]   │ │                          │ │   / Edição   │ │
│ [ Select ]   │ │        (preview)         │ │              │ │
│              │ │                          │ │              │ │
│              │ └──────────────────────────┘ └──────────────┘ │
└──────────────┴───────────────────────────────────────────────┘
```

| Área | Função |
|---|---|
| **Menu lateral** | Troca entre os componentes (Switch / Select) |
| **Breadcrumb** | Mostra onde o usuário está (`Playground / Switch`) |
| **Preview** | O componente funcionando (ngModel e Reactive Forms) |
| **Propriedades** | Controles que alteram o componente em tempo real (pedido do PDF) |

A tela cabe inteira na janela (sem rolar a página no desktop): mudar uma propriedade e ver o
resultado acontece no mesmo campo de visão.

### Implementação da casca (`src/app/app.*`)

**Estado:** um único signal com a página ativa.
```ts
protected readonly pages: readonly Page[] = [
  { id: 'switch', label: 'Switch' },
  { id: 'select', label: 'Select' },
];
protected readonly activePage = signal(this.pages[0]);
```
O menu, o breadcrumb e o título do preview leem desse mesmo signal, então nunca ficam fora de
sincronia. O `id` tipado (`'switch' | 'select'`) impede um valor inválido.

**Menu:** `<nav>` com `<button>` nativos (foco e teclado de graça). O item ativo recebe
`aria-current="page"`, que o leitor de tela anuncia como "página atual", e o CSS usa o mesmo
atributo pra pintar o destaque.

**Layout (CSS Grid):**
- `:host` com duas colunas: menu `14rem` + área de trabalho flexível, altura `100dvh`.
- Área de trabalho com duas colunas: preview flexível + propriedades `20rem`.
- `min-height: 0` + `overflow-y: auto` nos painéis: se um conteúdo crescer, só aquele painel rola.
- Abaixo de `900px` tudo empilha e a página rola normalmente.
- Cores só dos tokens do PO UI (`--color-action-default`, `--color-brand-01-lightest`...).

**Ponto de extensão:** os dois painéis têm um comentário marcando onde entra o conteúdo de cada
componente, usando `@switch (activePage().id)`.

---

## Fase 2: Arquitetura de pastas (25/09)

Depois da tela, desenhei a organização das pastas. A primeira versão:

```
src/
  features/playground/   playground-page.ts | .html | .css
  ui/components/
    switch/  select/  Sidebar/  Cards/
```

Revisando, mantive a ideia central e ajustei três pontos.

### Decisão final

```
src/app/
  app.ts | app.html | app.css      ← casca: sidebar + breadcrumb
  ui/                              ← BIBLIOTECA: só o que o desafio entrega
    switch/   switch.ts | .html | .css | .spec.ts
    select/   select.ts | .html | .css | .spec.ts | select-option.ts
  features/playground/             ← CONSUMIDOR: a página de demo
    switch/   switch-playground.ts | .html
    select/   select-playground.ts | .html
    shared/   style-editor.ts      ← usado pelos dois playgrounds
    playground.css                 ← .panel e layout, compartilhado
```

> Ajuste feito depois da primeira reorganização: cada playground ganhou sua pasta e o que é usado
> pelos dois foi pra `shared/`, espelhando a organização de `ui/`.

### Por quê

**Biblioteca separada do consumidor (mantido da versão original).** `ui/` nunca importa nada de
`features/`. Os componentes do desafio poderiam virar uma biblioteca sem nenhuma mudança, e isso
prova que eles são reutilizáveis de verdade.

**Sidebar e Card saíram de `ui/`.** `ui/` representa o que o desafio entrega (Select e Switch).
Sidebar e Card são peças desta página específica; colocá-los ao lado passaria a ideia de quatro
componentes reutilizáveis.

**Sidebar e Card não viraram componentes.** A sidebar aparece uma vez e tem ~20 linhas no
`app.html`; um componente só adicionaria arquivo, `imports` e comunicação pai/filho pra saber a
página ativa. O card é só aparência (fundo, borda, espaçamento): uma classe CSS `.panel` resolve.
Viraria componente se ganhasse comportamento ou estrutura própria.

**Um playground por componente.** O Select tem bastante estado (editor de opções, required,
cores) e o Switch outro. Separados, cada arquivo fica pequeno e focado.

**Convenções do style guide:** pastas e arquivos em minúsculo, singular e kebab-case; nomes sem
sufixo `.component` (`switch.ts`, classe `Switch`).

---

## Fase 3: Componente Switch (concluída em 26/09)

Seguindo o guia em 10 etapas: cada etapa adiciona um pedaço e é conferida no navegador.

| Etapa | O quê | Status |
|---|---|---|
| 1 | Gerar com `npx ng g c ui/switch` | ✅ |
| 2 | Renderizar no `App` | ✅ |
| 3 | HTML estático (`<button role="switch">`, track, key, ícone) | ✅ |
| 4 | CSS base + custom properties do handoff | ✅ |
| 5 | Estado ligado/desligado (`signal`) | ✅ |
| 6 | Label e nome acessível | ✅ |
| 7 | Disabled, hover e foco | ✅ |
| 8 | Evento `checkedChange` | ✅ |
| 9 | Integração com forms (ControlValueAccessor) | ✅ |
| 10 | Bancada ngModel + formControl (disable/enable/reset) | ✅ |

### Problemas encontrados e como resolvi

**1. Console: "The component 'Switch' needs to be compiled using the JIT compiler"**
- **Causa:** o `ng serve` ficou com uma versão incompleta do `switch.ts` em cache (o erro mostrava
  `class { }` vazia). Um `ng build` do zero compilava sem erro, então o código estava certo.
- **Solução:** parar o `ng serve`, apagar a pasta `.angular/` e subir de novo.
- **Aprendizado:** quando o build limpo passa e o dev server falha, o problema é cache, não código.

**2. WebStorm: "Cannot resolve '--color-unchecked-hover' custom property"**
- **Causa:** as custom properties públicas (nomes do handoff) não são declaradas em lugar nenhum
  de propósito. Só existem se quem usa o componente definir.
- **Por que funciona mesmo assim:** `var(--color-unchecked-hover, var(--color-brand-01-lightest))`
  usa o token do tema como fallback.
- **Solução:** nenhuma no código. O aviso é da inspeção da IDE (suprimido com `/*noinspection ALL*/`).

**3. O ✓ não aparecia**
- **Causa:** o `<span>` em volta do SVG estava sem a classe `key`, e ainda não existia o bloco
  `.icon`. Um SVG com `viewBox` e sem `width` ocupa 100% do pai; o pai tinha largura 0, então o
  ícone também.
- **Solução:** `class="key"` no span e o bloco `.icon` com `width`/`height` de `1rem`.
- **Observação:** no estado desligado o ✓ fica invisível de propósito (`opacity: 0`, como no
  handoff). Ele aparece no estado ligado (etapa 5).

**4. Estados disabled não tinham efeito**
- **Causa:** as regras estavam em `.key:disabled`, `.track:disabled`, `.icon:disabled`. A
  pseudo-classe `:disabled` só existe em elementos de formulário; um `<span>` nunca fica disabled.
- **Solução:** o `:disabled` vai no `<button>` e o descendente vem depois: `.switch:disabled .key`.
  No mesmo bloco: typo em `--color_unchecked-disabled` e `color` no ícone (SVG pinta com `fill`).

**5. Hover só reagia em cima da bolinha**
- **Causa:** `.key:hover` só casa com o mouse sobre a key, não sobre a track ou o resto do botão.
- **Solução:** hover no botão, `.switch:hover:not(:disabled) .key`, que também impede hover no
  switch desabilitado.

**6. Outline aparecia no clique do mouse**
- **Causa:** `:focus` casa com qualquer foco.
- **Solução:** `:focus-visible`, que mostra o outline só na navegação por teclado.

### Conceitos que ficaram claros nesta fase

- **Por que `.track` e `.key` separados:** a key (1.5rem) é mais alta que a track (1rem). O botão é
  a caixa que envolve os dois (área de clique e outline); a key é `position: absolute` pra ficar
  por cima da track e deslizar com `translateX` sem empurrar nada.
- **`<label for>`:** o navegador repassa o clique do label pro elemento com aquele `id`, e o texto
  vira o nome acessível. Por isso o id precisa ser único (`nextId++`).
- **`input(false, { transform: booleanAttribute })`:** `<km-switch disabled>` manda string vazia,
  que é falsy; o transform converte pra `true`, igual ao `<button disabled>` nativo.
- **`output`:** o contrário do `input`, avisa o pai que algo mudou (`checkedChange`).
- **ngModel x formControl:** no ngModel o estado fica numa variável (controle pelo template); no
  formControl fica num objeto com API (`disable()`, `reset()`...). O Switch não sabe qual está em
  uso: os dois falam com ele pelo mesmo ControlValueAccessor.

### Resultado da etapa 4

Estado desligado conforme o handoff: key branca com borda escura à esquerda, track cinza, sem ✓.

---

## Pendências

- [x] Remover o bloco `pre-config-host:{ ... }` de `src/styles.css` (CSS inválido, gera warning no build)
- [x] Adicionar o `<link>` da fonte Roboto no `src/index.html`
- [x] Reorganizar as pastas para a arquitetura da fase 2 (`playground/` → `features/playground/`, sem subpastas)
- [x] Teste manual da etapa 10 do Switch (clique, label, Tab/Espaço/Enter, hover, disable/enable/reset)
- [ ] Commit da fase 1 e do Switch (separar a mudança de pastas do commit do componente)
- [ ] Decidir sobre `.vscode/` marcado como deletado no git
