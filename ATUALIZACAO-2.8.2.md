# Atualização 2.8.2

Partiu da versão 2.8.1 anexada, preservando enigmas, imagens, API_URL e códigos.

Substitua os arquivos do site e o Code.gs. No Apps Script publique uma NOVA VERSÃO da implantação existente, mantendo a URL /exec. Não é necessário executar configurarLivro para esta atualização.

Índice: uma consulta por abertura. Enigmas: usam o último status do índice, sem consultas periódicas ou consulta inicial. Envio: uma única chamada JSONP confirma a gravação diretamente. Não há tentativas automáticas repetidas. Acesso direto sem cache permite jogar, e o servidor valida equipe, bloqueio e resposta duplicada ao enviar.

Mudanças de bloqueio e respostas enviadas por outro dispositivo aparecem ao reabrir o índice. O servidor sempre impede envios após o prazo e duplicação. Em falha de rede, nenhuma confirmação local é inventada: volte ao índice para conferir. Ao tentar novamente na mesma página, o identificador do envio é reaproveitado.

A tela de controle mantém as consultas necessárias ao acompanhamento. Apps Script ainda pode demorar para iniciar; esta atualização remove tráfego e consultas extras, sem prometer eliminar a latência do serviço.
