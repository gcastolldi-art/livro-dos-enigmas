# Atualização 2.6: IDs, nomes e pontos

## Instalação
1. Substitua os arquivos do site por este pacote, baseado no ZIP enviado em 01/10/2026. Seus textos, imagens e configuração de acesso foram preservados.
2. Substitua Code.gs no Apps Script vinculado à planilha.
3. Execute configurarLivro. O script mantém os códigos das equipes, as respostas e o conteúdo dos gabaritos existentes. Converte IDs antigos conhecidos para 1 a 4 e adiciona a coluna Nome do enigma. Pode ser executado novamente sem duplicar linhas.
4. Confira as abas Enigmas e Gabarito. Edite a pontuação somente na coluna Pontos da aba Gabarito. Para recalcular pontos de respostas já registradas, execute recalcularGabarito. Isso também recalcula notas que haviam sido alteradas manualmente.
5. Em Implantar > Gerenciar implantações, edite a implantação atual e selecione uma nova versão. Mantenha a mesma URL /exec.
6. Publique os arquivos do site e atualize o navegador com Ctrl+F5. Também é possível testar o site pelo servidor local.

## Estrutura
Enigmas: ID do enigma | Nome do enigma | Ativo.
Gabarito: ID do enigma | Nome do enigma | Tipo | Resposta(s) aceita(s) | Pontos | Observações.

Os IDs são números permanentes: 1, 2, 3, 4. Não renumere quando mudar a ordem do índice ou excluir um enigma. Os nomes gerados são iguais aos títulos do enigmas.json: O valor da garrafa; Uma nova Terra; A ordem dos símbolos; A senha do cofre.

Para incluir novos enigmas, use um número ainda não utilizado no JSON, no data-enigma do HTML e nas duas abas. Mantenha Nome do enigma igual a titulo. O cadastro inicial no Code.gs corresponde aos quatro enigmas do projeto enviado.

## Pontuação
A coluna Pontos do Gabarito é a fonte usada pelo servidor. O status retornado ao jogador contém somente ID, nome e pontos, nunca as respostas corretas. O JSON inclui pontos como alternativa local durante a abertura ou se o servidor não responder. Se mudar os pontos na planilha, atualize também esse valor no JSON para manter essa alternativa coerente. A consulta bem-sucedida substitui o valor do JSON pelo da planilha.

No cadastro novo, os valores iniciais seguem o exemplo: 5, 10, 12 e 1 ponto. Em planilhas existentes, os valores e gabaritos anteriores são preservados.

## Validação
Testados localmente: criação em planilha vazia, execução repetida, migração do layout anterior e do exemplo enviado, preservação de respostas e gabaritos, correção por IDs numéricos, bloqueio de respostas duplicadas, status com pontos e ranking. Integração real com Google deve ser conferida após atualizar a implantação.
