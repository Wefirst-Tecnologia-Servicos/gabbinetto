/*
 * Transfere as tarefas de um avaliador para outro
 * -----------------------------------------------
 * Após a transferência ser finalizada, o avaliador antigo pode ser excluído do sistema sem problemas
 * 
 */


--> Obter os IDS dos avaliadores envolvidos

SELECT * FROM usuarios WHERE usuario IN ('ELIANE', 'LEONARDO');

  --> LEONARDO (ANTIGO): 140
  --> ELIANE (NOVO): 184
  
--> Verifica se existem tarefas em que as duas pessoas sejam avaliadoras:
SELECT * 
  FROM (SELECT id_avaliacao, id_pergunta, 
               count(*) as count
          FROM av_resposta_avaliador 
         WHERE id_avaliador IN (140, 184) 
      GROUP BY id_avaliacao, id_pergunta) sub
 WHERE count > 1;
 
 
 SELECT * FROM
  (SELECT id_avaliacao, count(0) as count
     FROM av_avaliacao_avaliador 
    WHERE id_avaliador IN (140, 184)
 GROUP BY id_avaliacao) sub
 WHERE count > 1;
 
 SELECT *
   FROM (SELECT id_funcionario, count(0) as count 
           FROM av_avaliador_funcionario
          WHERE id_avaliador IN (140, 184) 
       GROUP BY id_funcionario) sub
 WHERE count > 1;
	   
 
     --> IMPORTANTE: Se houver linhas em uma das queries acima significa que existem tarefas em que as duas pessoas sejam avaliadoras.
	              -- Neste caso é preciso ver com a gabbinetto o que deve ser feito e não prossegue com os comandos.

USE averp;
SET SQL_SAFE_UPDATES = 0;
UPDATE av_avaliacao_avaliador SET id_avaliador = 184 WHERE id_avaliador = 140;
UPDATE av_resposta_avaliador SET id_avaliador = 184 WHERE id_avaliador = 140;
UPDATE av_avaliador_funcionario SET id_avaliador = 184 WHERE id_avaliador = 140;
UPDATE av_avaliador SET ve_tudo = 1 WHERE id_usuario = 184;

--> O último comando faz com que o novo avaliador possa 'Ver Tudo' no módulo