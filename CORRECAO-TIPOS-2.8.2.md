# Versão 2.8.2 corrigida

1. Substitua os arquivos do site e o Code.gs.
2. Execute aplicarAtualizacao282 UMA VEZ. Ela sincroniza os tipos dos enigmas 1 a 13, coloca 10 pontos em cada um e recalcula respostas gravadas. Equipes, códigos, respostas e gabaritos existentes são preservados, exceto o gabarito antigo de localizar no ID 13, convertido para a disposição correta de montar.
3. Publique uma nova versão da implantação atual, mantendo a URL /exec.
4. Ajuste os gabaritos ainda vazios na aba Gabarito.

Para alterar a dificuldade depois, edite Pontos na aba Gabarito e execute recalcularGabarito. Não execute aplicarAtualizacao282 novamente, pois ela repõe 10 pontos. configurarLivro preserva pontuações personalizadas.

Tipos: escolha, sequencia, ordem, texto, valor, localizar, montar.
IDs 1,8,9: escolha. IDs 2,4: sequencia. ID 3: ordem. IDs 5,6,7,11,12: valor. ID 10: texto. ID 13: montar.
Montar: 24 peças mais zero, ordem correta 1 a 24 seguida de 0. Montagem concluída vale os Pontos do gabarito.
Localizar permanece disponível para novos enigmas, mas não está no catálogo ativo atual. Mantém a regra anterior de 1 ponto por elemento encontrado.

Mantidas as consultas reduzidas e confirmação direta de envio da versão 2.8.2.
