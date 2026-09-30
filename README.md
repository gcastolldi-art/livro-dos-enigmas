# Livro dos Enigmas v2.3

Versão desenvolvida a partir do ZIP v2.2 enviado, preservando os textos dos enigmas e a URL do Apps Script já configurada.

## Atualizar

1. Substitua `Code.gs` no Apps Script vinculado à sua planilha e execute `configurarLivro`. Os códigos de equipes e respostas são mantidos. A antiga coluna `Resposta JSON` passa a ser `Resposta`; registros antigos contendo tipo/valor são convertidos para texto simples.
2. A configuração cria a aba **Controle**, com o **Código do painel**. Esse código é exclusivo da organização; não publique no GitHub nem compartilhe com as equipes.
3. Publique **Nova versão** da implantação existente, executando como você e com acesso **Qualquer pessoa**. A URL `/exec` em `js/config.js` continua válida ao atualizar a mesma implantação.
4. Envie o conteúdo desta pasta à raiz do repositório GitHub. O ZIP já traz `index.html` na raiz, sem pasta adicional.

## Capa, índice e links

`index.html` mostra a capa ilustrada de couro azul e ornamentos dourados. **Abrir livro** leva a `indice.html` conservando os parâmetros. Os links da etapa anterior continuam:

```text
https://gcastolldi-art.github.io/livro-dos-enigmas/#equipe=Vermelho&codigo=CODIGO-DA-EQUIPE
```

O índice valida o acesso, retira o código da barra e guarda a sessão nesta aba. O rodapé dos enigmas aponta para `indice.html`. A indicação da equipe à direita inclui uma estrela na cor do grupo.

## Respostas e correção

Envie somente o valor: `send(selected.value)`, `send(value)` ou `send(listaDePecas)`. Por compatibilidade, a camada comum aceita `{valor: ...}` e o formato antigo, mas transmite e grava apenas a resposta. O tipo da correção vem da aba **Gabarito**, pelo ID do enigma.

Escolha e texto são gravados como texto simples. Ordenação é gravada como IDs separados por vírgula (`eclipse,estrela,livro`). Respostas estruturadas futuras podem ser gravadas como JSON sem os campos artificiais tipo/valor; tipos sem correção automática ficam `PENDENTE`.

A aba Gabarito tem: ID, Tipo, Resposta(s) aceita(s), Pontos e Observações. Tipos: `escolha`, `texto`, `ordem` ou `manual`. Alternativas aceitas podem ser separadas por `|`. A correção ignora acentos, maiúsculas e espaços repetidos. Não publique o gabarito nos arquivos do site.

Após alterar o gabarito, execute `recalcularGabarito`. Para correção manual, ajuste Resultado e Pontos na aba Respostas. O recálculo pode sobrescrever pontuações manuais.

## Painel de controle

Abra `controle.html` no site e digite o código da aba Controle. O painel mostra as respostas das 12 equipes por enigma, resultado, pontos, horário, ordem por questão e ordem geral. Também mostra a soma dos pontos, quantidade respondida e ordem de conclusão. Atualiza a cada 15 segundos enquanto a aba está visível, ou pelo botão Atualizar.

A classificação usa pontos em ordem decrescente. No empate entre equipes concluídas, vence a que registrou a última resposta primeiro. Horários idênticos são desempatados pela ordem das linhas aceitas. Uma equipe concluída fica à frente de uma incompleta com os mesmos pontos; incompletas empatadas compartilham a classificação provisória. O painel é de consulta; ajustes são feitos na planilha.

A aba **Enigmas** define quais questões entram nos totais. Mantenha os IDs e estados ativos coerentes com `enigmas.json`. Desativar uma questão altera a soma e o critério de conclusão.

## Incluir enigmas

Copie uma pasta em `enigmas/`, crie o HTML/JS da nova interação e atribua um `data-enigma` único. Inclua o mesmo ID em `enigmas.json`, na aba Enigmas (ativo TRUE) e na aba Gabarito. O JSON controla ordem, índice, contador N de X e navegação. Não reutilize IDs antigos. Novos formatos podem usar correção manual até serem implementados no backend.

## Envio e testes

Ao enviar, o botão fica desabilitado e aparece a barra animada com **Enviando resposta...**. A barra indica espera, sem inventar porcentagem. A primeira resposta bloqueia a questão mesmo se estiver errada. Nenhuma resposta é reenviada automaticamente.

Antes do evento, teste capa → índice → enigma, os três formatos, duas pessoas enviando pela mesma equipe e o painel. Confira que só uma linha é aceita por equipe/questão. A lógica foi validada localmente com simulação do Sheets; a implantação real precisa ser testada após atualizar Code.gs.

Imagem da capa criada por geração de imagens para este projeto: couro azul profundo, filigranas douradas, estrelas arcanas, medalhão de labirinto e título medieval Livro dos Enigmas. Arquivo: `assets/capa-livro.webp`.
