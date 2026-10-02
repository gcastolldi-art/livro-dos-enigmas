# Versão 2.8

Feita a partir da v2.7.1 enviada, preservando imagens, textos e API_URL.

1. Substitua os arquivos do projeto.
2. Substitua Code.gs e execute configurarLivro. A configuração mantém respostas, códigos, gabaritos e pontos existentes, normaliza os tipos e inclui os 13 enigmas no catálogo padrão. Gabaritos de novos enigmas ficam em branco para você completar.
3. Na aba Gabarito, configure o ID 13 com Tipo localizar e Resposta(s) aceita(s) igual a 25 (quantidade de regiões do desafio anexado). Para localizar, a coluna Pontos não controla o resultado: cada elemento vale 1 ponto, e a pontuação máxima exibida vem do gabarito.
4. Execute recalcularGabarito para atualizar respostas já gravadas.
5. Publique uma Nova versão da implantação do Apps Script.

Tipos: escolha, sequencia, ordem, texto, valor, localizar. Enigmas de campo numérico único 5,6,7,11,12 passam a valor. Maiúsculas e acentos de nomes antigos de tipo são normalizados.

Localizar aceita somente inteiro de 0 até o máximo. Exemplo: máximo 25, resposta 17 = 17 pontos e PARCIAL; 25 = 25 pontos e CORRETA; 0 = 0 pontos e INCORRETA. Valores negativos, fracionados ou acima do máximo são recusados.

Compartilhar link abre compartilhar.html: QR code gerado no navegador, endereço completo da capa index.html com equipe e código, e Voltar para o índice. Funciona em subpastas e em servidor local. Os códigos não são enviados a serviço de QR externo. Um endereço localhost só pode ser aberto no próprio computador; para outros dispositivos use endereço publicado ou IP da rede local.
