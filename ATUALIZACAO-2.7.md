# Atualização 2.7

1. Substitua os arquivos do projeto pelos deste pacote. A API_URL original foi mantida.
2. Substitua Code.gs no Apps Script. Execute configurarLivro se ainda não configurou a planilha. Não apague respostas ou gabaritos.
3. Em Implantar > Gerenciar implantações > Editar, selecione Nova versão e atualize, executando como Eu e acesso Qualquer pessoa.
4. Abra controle.html: Receber respostas permite envios e oculta a revelação; Bloquear encerra envios; Liberar respostas encerra envios e revela o gabarito. Nenhum botão apaga registros.
5. O índice se atualiza a cada 15 segundos e os enigmas a cada 8 segundos. O servidor bloqueia imediatamente a gravação quando o estado é alterado.
6. Ver respostas abre respostas.html mantendo equipe e código. O servidor valida ambos e só retorna os dados dessa equipe após a liberação.

O estado é salvo por GAME_ID nas propriedades do Apps Script e sobrevive à atualização da implantação. Novas partidas começam recebendo respostas. O painel continua público, sem senha, conforme configuração anterior. As ações de controle também são públicas.

Teste real recomendado: dois celulares da mesma equipe; bloquear enquanto um enigma está aberto; conferir que não grava; liberar e consultar respostas; reabrir recebimento e confirmar que respostas existentes permanecem bloqueadas.
