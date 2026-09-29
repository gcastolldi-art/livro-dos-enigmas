# Livro dos Enigmas

Projeto inicial para GitHub Pages com capa, índice automático, três enigmas piloto e respostas no Google Sheets. A imagem da guardiã foi usada com autorização como prólogo. O projeto não contém gabarito público: respostas são registradas para conferência na planilha.

## 1. Preparar o Google Sheets

1. Crie uma planilha Google chamada `Livro dos Enigmas - Respostas`.
2. Abra **Extensões > Apps Script**. Substitua o conteúdo de `Code.gs` pelo conteúdo de `apps-script/Code.gs` deste pacote.
3. Salve e execute `configurarLivro` uma vez. Autorize as permissões solicitadas pelo Google.
4. Volte à planilha. A aba **Equipes** traz os códigos individuais. Entregue cada código apenas ao grupo correspondente. Não publique a planilha nem esses códigos no GitHub.
5. Em **Implantar > Nova implantação > Aplicativo da Web**, configure **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**. Copie a URL terminada em `/exec`.
6. Cole essa URL entre aspas em `js/config.js`, no valor `API_URL`. Não coloque códigos de equipes nesse arquivo.

O acesso público ao aplicativo web é necessário para que os celulares enviem respostas sem login Google. A equipe é identificada por seu código compartilhado. O Apps Script usa uma trava ao verificar e gravar para aceitar somente a primeira resposta de cada combinação partida + equipe + enigma. A planilha é a fonte definitiva; o estado mostrado no celular é uma consulta periódica.

## 2. Testar antes de publicar

1. Inicie um servidor estático na raiz do projeto: `python3 -m http.server 8000`.
2. Acesse `http://localhost:8000/` (não abra os arquivos por `file://`, pois o navegador precisa carregar `enigmas.json`).
3. Entre com nome, equipe e código da aba Equipes. Envie uma resposta.
4. Confira uma linha nova na aba Respostas. Com outro navegador ou celular usando o mesmo código, tente responder o mesmo enigma. O segundo envio deve ser rejeitado e a página deve mostrar o bloqueio.
5. Repita com duas pessoas enviando ao mesmo tempo. Em seguida, teste duas equipes diferentes na mesma questão.

## 3. Publicar no GitHub Pages

Envie o conteúdo desta pasta para a raiz de um repositório GitHub. Em **Settings > Pages > Build and deployment**, selecione **Deploy from a branch**, a branch principal e a pasta `/ (root)`. O site será publicado no endereço indicado pelo GitHub. Todos os caminhos de imagens, CSS e JS são relativos e funcionam também em repositórios de projeto (`usuario.github.io/nome-do-repositorio/`).

O arquivo `apps-script/Code.gs` pode permanecer no repositório porque não contém os códigos das equipes. A planilha deve continuar privada. Para uma nova edição do jogo, altere `GAME_ID` em `js/config.js`; assim os registros de partidas anteriores permanecem separados.

## 4. Adicionar ou remover enigmas

1. Copie uma das pastas em `enigmas/` para uma nova pasta numérica ou com nome único.
2. Troque `data-enigma` no `body` da página e crie uma entrada correspondente em `enigmas.json` com o mesmo `id`, além de `titulo`, `pasta`, `tipo` e `ativo`.
3. Na planilha, inclua o novo ID na aba **Enigmas**, coluna A, e `TRUE` na coluna B. Não execute `configurarLivro` para essa inclusão.
4. Desenvolva a interação própria no `enigma.js`. Ao enviar, use `send({tipo:'nome-do-tipo',valor:...})` importado de `../../js/livro.js`.
5. Para retirar um enigma do índice, defina `ativo:false` no JSON e `FALSE` na aba Enigmas. Nunca reutilize o ID de um enigma para outro desafio.

O índice e o contador `N de X` são gerados de `enigmas.json`. O rodapé Anterior/Próximo também segue essa ordem. Respostas já enviadas continuam na planilha mesmo após desativar uma página.

## Limites e decisões para a próxima versão

- Os três enigmas são **páginas piloto** e devem ser substituídos pelas perguntas definitivas. A imagem anexada já compõe a capa.
- O código é compartilhado entre integrantes da equipe. Quem conhecer esse código poderá enviar uma resposta pela equipe; distribuição e sigilo ficam com a organização.
- A primeira resposta recebida bloqueia a questão, independentemente de estar certa. Não há gabarito ou pontuação automática nesta base.
- O Apps Script informa o bloqueio em consultas periódicas. Quem estiver digitando em outro celular poderá ver a mensagem alguns segundos depois; a trava do servidor decide qual envio vale.
- Em perda de rede após o clique, não envie de novo às cegas: a interface consulta o servidor e só confirma o que foi gravado. Consulte a aba Respostas se a conexão continuar falhando.
- A consulta é feita por JSONP e exige o código da equipe. Este modelo é adequado para uma gincana recreativa com códigos distribuídos; para autenticação forte, placar ao vivo intenso ou muitos acessos simultâneos, migre o serviço de respostas para um backend próprio com banco transacional.
