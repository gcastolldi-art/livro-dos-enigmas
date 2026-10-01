# Livro dos Enigmas v2.5

Atualização sobre a v2.4, preservando os textos dos três enigmas existentes.

## Atualizar

1. Substitua `Code.gs` no Apps Script vinculado à planilha e execute `configurarLivro`. As respostas e códigos das equipes são preservados. O ID `sequencia-dos-sete` será incluído na aba Enigmas e seu gabarito será criado na aba Gabarito se ainda não existir.
2. Publique uma **Nova versão** da mesma implantação, executando como você e com acesso **Qualquer pessoa**. A URL `/exec` já está preservada em `js/config.js`.
3. Envie os arquivos deste ZIP à raiz do repositório GitHub. Não é necessário trocar os links individuais das equipes.

## Índice e identificação

O índice mostra **Conjurando os enigmas** e um círculo em movimento durante o carregamento. Ao concluir a consulta, aparecem os títulos e o marcador **Respondido** somente para questões já enviadas. Não há indicação do tipo de enigma nem botão Tentar novamente.

Nos cabeçalhos, a estrela colorida fica no centro e o texto à direita identifica **EQUIPE [ANIMAL]**, sem o nome da cor. Na capa, a estrela fica acima do nome do animal, ambas centralizadas. As informações de acesso continuam acompanhando os links da capa, índice e enigmas.

## Mensagens de resposta

Ao enviar uma resposta aceita nesta página, aparece somente **Resposta Enviada**, em verde e centralizada. Ao reabrir a página ou quando outro integrante já tiver respondido, aparece **A resposta já foi enviada pela equipe!**. O botão de envio é ocultado e os campos ficam bloqueados. Durante o envio permanece a barra animada com Enviando resposta...

## Enigma 04: sete números

A página `enigmas/04/index.html` tem sete caixas, para números de 0 a 99. Cada posição recebe dois dígitos, com zero à esquerda quando necessário. A gravação é uma string simples no formato:

```text
01-05-03-08-07-06-02
```

O gabarito piloto da aba Gabarito terá:

| ID | Tipo | Resposta correta | Pontos |
| --- | --- | --- | --- |
| sequencia-dos-sete | sequencia | 01-05-03-08-07-06-02 | 1 |

Substitua as pistas da página e ajuste o gabarito antes de usar na gincana. A sequência correta não está no HTML nem no JS do jogador. É possível digitar um ou dois dígitos por caixa ou colar uma sequência completa separada por hífens. Envio com campo vazio é impedido.

Para adicionar mais questões desse tipo, copie a pasta 04, use um novo ID no HTML, adicione a entrada em enigmas.json e nas abas Enigmas/Gabarito, com tipo `sequencia` e a resposta no mesmo formato.

## Controle com acesso direto

Acesse `controle.html`. O painel usa tema escuro e fontes sem serifa, abre diretamente e consulta os resultados sem pedir código. O backend também foi ajustado para esse acesso, portanto precisa da nova implantação indicada acima. A antiga aba Controle pode permanecer na planilha; seu código não é mais utilizado.

O painel mostra respostas, resultado, pontos, ordem por enigma, ordem geral e conclusão. Atualiza a cada 15 segundos ou pelo botão Atualizar. A classificação é por pontos; no empate, a equipe que concluiu todos os enigmas primeiro fica à frente. Agora o total piloto será de quatro enigmas ativos. Mantenha enigmas.json e a aba Enigmas coerentes.

## Correção e publicação

A planilha grava somente a resposta. O tipo de correção vem da aba Gabarito. Os tipos suportados são `escolha`, `texto`, `ordem`, `sequencia` e `manual`. Após alterar gabaritos, execute `recalcularGabarito` para atualizar resultados antigos; essa função pode sobrescrever pontuação ajustada manualmente.

Os links continuam no formato `index.html#equipe=Vermelha&codigo=XYZ`. Não fixe códigos nos arquivos públicos. Para uma nova partida, altere GAME_ID em js/config.js. A primeira resposta de cada equipe por questão permanece definitiva, mesmo se estiver errada.

Teste após publicar: carregamento do índice, primeira resposta, acesso por outro dispositivo, sete números e painel direto. A lógica foi verificada localmente com simulação; a integração real depende da implantação na sua conta.
