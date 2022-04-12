USE averp;

--> SENT:

ALTER TABLE av_avaliador ADD COLUMN ativo TINYINT NOT NULL DEFAULT 1;

--> NOT SENT:

ALTER TABLE av_avaliador ADD COLUMN notas_rh TINYINT NOT NULL DEFAULT 0;
UPDATE av_avaliador SET notas_rh = 1 WHERE id_usuario IN (130, 155, 140, 184);
COMMIT;