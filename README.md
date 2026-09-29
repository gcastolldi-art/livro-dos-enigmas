# Livro dos Enigmas v2.1

Site estático para GitHub Pages com índice direto, páginas independentes e primeira resposta por equipe registrada no Google Sheets. A ilustração da princesa guardiã serviu como referência visual; ela continua na etapa anterior da história. Os enigmas incluídos são exemplos substituíveis.

## Correção da conexão (v2.1)

O backend agora registra o ID da planilha em `configurarLivro` e usa `openById` no aplicativo web. O frontend espera até 30 segundos, repete uma consulta que exceder o prazo e distingue carregamento inválido de timeout. Não há reenvio automático de respostas.

1. Substitua `Code.gs` no editor vinculado à planilha e execute `configurarLivro` novamente. Seus códigos de equipes e respostas existentes são preservados.
2. Em **Implantar > Gerenciar implantações > Editar**, selecione **Nova versão**, **Executar como: Eu**, acesso **Qualquer pessoa**, e implante.
3. Abra a URL `/exec` diretamente em uma janela anônima. Deve aparecer `{"ok":true,"version":"2.1","message":"Conexão com a planilha funcionando."}`. Pedido de login indica uma restrição de acesso; versão diferente indica uma implantação antiga; `ok:false` traz o erro para corrigir.
4. Atualize os arquivos do site, mantendo sua `API_URL` em `js/config.js`. Use a URL publicada terminada em `/exec`, sem parâmetros e sem barra extra.
5. Se a URL do backend funciona diretamente, mas o site falha, abra o console do navegador (F12) e confira se a requisição ao Apps Script está sendo bloqueada. O retorno usa um redirecionamento para `script.googleusercontent.com`.

## 1. Atualizar a planilha e o Apps Script

1. Se já instalou a v1, abra o Apps Script vinculado à mesma planilha e substitua **todo** o `Code.gs` pelo conteúdo de `apps-script/Code.gs`. Se ainda não instalou, crie uma planilha Google e abra **Extensões > Apps Script** para colar o arquivo.
2. Salve e execute `configurarLivro` uma vez. Isso cria ou atualiza as abas **Respostas**, **Equipes**, **Enigmas** e **Gabarito** sem apagar as respostas existentes.
3. Confira os códigos na aba **Equipes**. A lista oficial de 12 equipes inclui **Turquesa, Golfinho**. Se instalou a v1, a linha antiga **Cinza** pode permanecer na aba; ela não será aceita nesta versão. A nova linha Turquesa recebe um código próprio.
4. Se já havia publicado o aplicativo web, use **Implantar > Gerenciar implantações > Editar > Nova versão**. Copie a URL `/exec`. Em uma instalação nova, use **Implantar > Nova implantação > Aplicativo da Web**, com **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**.
5. Cole a URL `/exec` entre aspas no valor `API_URL` em `js/config.js`.

Mantenha privadas as abas **Equipes** e **Gabarito**. O código de cada equipe só deve ser entregue ao grupo correspondente. O backend usa `LockService` para conferir e gravar a primeira resposta sob trava.

## 2. Configurar o gabarito

A aba **Gabarito** tem as colunas `ID do enigma`, `Tipo`, `Resposta(s) aceita(s)`, `Pontos`, `Observações`.

| Tipo | Exemplo na coluna Resposta(s) aceita(s) | Regra |
| --- | --- | --- |
| `escolha` | `labirinto` | Valor da alternativa selecionada, não seu texto visível. |
| `texto` | `livro|o livro` | Aceita qualquer opção separada por `|`; ignora maiúsculas, acentos e espaços repetidos. |
| `ordem` | `eclipse,estrela,livro` | IDs das peças na ordem correta, separados por vírgula. |
| `manual` | deixe em branco | Registra `PENDENTE` para conferência da organização. |

O gabarito piloto corresponde às perguntas piloto. Ao substituir uma pergunta, **atualize também seu gabarito antes de liberar os links**. Não coloque respostas corretas em HTML, JavaScript ou JSON do GitHub Pages.

A aba **Respostas** mostra o JSON enviado, `Resultado` (`CORRETA`, `INCORRETA` ou `PENDENTE`) e `Pontos`. A primeira resposta bloqueia a equipe mesmo se estiver incorreta. Se corrigir um gabarito após receber respostas, execute `recalcularGabarito` no Apps Script para atualizar resultados antigos. O resultado não é mostrado aos jogadores.

## 3. Criar links individuais por equipe

A página `index.html` já é o índice. O desafio anterior deve encaminhar para um URL no formato:

```text
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/#equipe=Vermelho&codigo=CODIGO-DA-ABA-EQUIPES
```

Troque o nome e o código para cada uma das 12 equipes. Para Turquesa, por exemplo, use `#equipe=Turquesa&codigo=...`. A equipe e o código seguem no fragmento `#` do endereço, que o GitHub Pages não recebe. Após validar, o site remove o fragmento da barra e mantém a sessão nesta aba do navegador. Ao abrir o link em outro celular, os integrantes da mesma equipe terão acesso independente, com o mesmo bloqueio de resposta. O campo **Jogador** da planilha será preenchido automaticamente com o mascote oficial: Fênix, Tigre, Leão, Camaleão, Águia, Tubarão, Coruja, Flamingo, Urso, Golfinho, Pantera Negra ou Pégasus.

Não divulgue esses links em uma página pública: quem tiver um link poderá responder por aquela equipe. O link da etapa anterior deve encaminhar apenas ao endereço da equipe apropriada.

## 4. Publicar e testar

Envie o conteúdo da pasta `livro-dos-enigmas/` à raiz do repositório. Em **Settings > Pages**, publique pela branch principal e pasta `/ (root)`. Os caminhos relativos funcionam no endereço `usuario.github.io/repositorio/`.

Antes de publicar, pode executar `python3 -m http.server 8000` na pasta e abrir `http://localhost:8000/#equipe=Vermelho&codigo=...`. É necessário preencher `API_URL` e implantar o Apps Script até mesmo no teste local. Teste dois celulares com a mesma equipe enviando ao mesmo tempo: apenas uma linha deve ser aceita por enigma. Confira também que uma segunda equipe consegue responder à mesma questão e que o índice mostra o estado respondido.

## 5. Adicionar um novo enigma

1. Copie uma pasta de `enigmas/` e crie o HTML e JS próprios da nova interação.
2. Defina um `data-enigma` único no HTML e inclua uma linha em `enigmas.json` com o mesmo `id`, `titulo`, `pasta`, `tipo` e `ativo:true`.
3. Na aba **Enigmas**, inclua o mesmo ID e `TRUE`. Na aba **Gabarito**, inclua o tipo, a resposta correta e os pontos. Para uma correção subjetiva, use `manual`.
4. No JS da página, importe `send` de `../../js/livro.js` e envie `{tipo:'...', valor:...}`. Novos formatos podem ter sua própria interface e usar `PENDENTE` até que a validação específica seja implementada no backend.

A ordem no JSON determina o índice, o contador `N de X` e os links Anterior/Próximo. Cada página inclui o link central **Índice** no rodapé. Para desativar, use `ativo:false` no JSON e `FALSE` na aba Enigmas. IDs antigos nunca devem ser reutilizados.

## Observações operacionais

- O código da equipe funciona como uma credencial compartilhada; não identifica a pessoa que clicou. A coluna Jogador registra o mascote, conforme solicitado.
- O Apps Script é consultado a cada oito segundos nas páginas de enigmas. O bloqueio visual pode demorar um instante, mas a trava no servidor decide qual resposta é válida.
- A v2 exige reimplantar o Apps Script. Atualizar apenas os arquivos do GitHub Pages deixa a correção automática indisponível.
- Para uma nova partida, altere `GAME_ID` em `js/config.js`, mantendo os registros de partidas anteriores na planilha.
