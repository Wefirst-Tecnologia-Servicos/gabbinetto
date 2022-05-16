CREATE TABLE atv_setor (
	id_setor INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE atv_modelo (
	id_modelo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE atv_funcionario (
	id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255),
    tipo char(1) NOT NULL,
    id_setor INT NOT NULL,
    id_usuario BIGINT(20) UNSIGNED NOT NULL,
	CONSTRAINT fk_atv_setor FOREIGN KEY (id_setor) REFERENCES atv_setor(id_setor),
    CONSTRAINT fk_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE atv_tarefa (
	id_tarefa bigint unsigned primary key auto_increment, 
    alerta datetime,
    vencimento datetime NOT NULL,
    repete_tipo char(1) not null,
    repete_quantidade int unsigned not null,
    desc_execucao varchar(255),
    desc_conclusao varchar(255),
    id_modelo int not null,
    alterado_em datetime,
    alterador_por varchar(50),
    criado_em datetime not null,
    criado_por varchar(50) not null,
    aprovado_em datetime not null,
    aprovado_por varchar(50) not null,
    CONSTRAINT fk_tarefa_modelo FOREIGN KEY (id_modelo) REFERENCES atv_modelo(id_modelo)
);

create table atv_tarefa_funcionario (
	id_tarefa bigint unsigned not null,
	id_funcionario int not null,
	concluido_em datetime,
    primary key (id_tarefa, id_funcionario),
    CONSTRAINT fk_tarefa_funcionario_tarefa FOREIGN KEY (id_tarefa) REFERENCES atv_tarefa(id_tarefa),
    CONSTRAINT fk_tarefa_funcionario_funcionario FOREIGN KEY (id_funcionario) REFERENCES atv_funcionario(id_funcionario)
);

alter table atv_tarefa add column anexo_requerido tinyint not null default 0 after desc_conclusao;
alter table atv_tarefa add column anexo_nome varchar(255) null after anexo_requerido;

create table atv_parametro (
	chave char(30) not null primary key,
    descricao varchar(255) not null
);

insert into atv_parametro (chave, descricao) values ('ANEXO_PASTA', 'C:\\');

ALTER TABLE atv_tarefa_funcionario ADD COLUMN tipo CHAR(1) not null;

UPDATE atv_tarefa_funcionario 
  INNER JOIN atv_funcionario 
          ON atv_tarefa_funcionario.id_funcionario = atv_funcionario.id_funcionario
         SET atv_tarefa_funcionario.tipo = atv_funcionario.tipo;
		 
ALTER TABLE atv_tarefa ADD (
  id_proxima_tarefa bigint unsigned,
  CONSTRAINT fk_proxima_tarefa 
    FOREIGN KEY (id_proxima_tarefa) REFERENCES atv_tarefa(id_tarefa)
);

alter table modulos add column alerta_tarefa tinyint not null default 0;

ALTER TABLE atv_tarefa_funcionario
	DROP PRIMARY KEY,
	ADD PRIMARY KEY (id_tarefa, id_funcionario, tipo);

create table atv_tipo_tarefa (
	id_tipo_tarefa int auto_increment primary key,
    nome varchar(50) not null unique
);

alter table atv_tarefa add (
	id_tipo_tarefa int,
	constraint fk_tarefa_tipo foreign key (id_tipo_tarefa) references atv_tipo_tarefa(id_tipo_tarefa)
);

insert into atv_tipo_tarefa (nome) values ('A DEFINIR');

UPDATE atv_tarefa SET id_tipo_tarefa = (select max(id_tipo_tarefa) FROM atv_tipo_tarefa);

ALTER TABLE atv_tarefa MODIFY id_tipo_tarefa int not null; 

alter table atv_tarefa 
add column dia1 tinyint not null default 0,
add column dia2 tinyint not null default 0,
add column dia3 tinyint not null default 0,
add column dia4 tinyint not null default 0,
add column dia5 tinyint not null default 0,
add column dia6 tinyint not null default 0,
add column dia7 tinyint not null default 0;

alter table neg_montagem
add column porc_mont_alterado_em datetime;

ALTER TABLE atv_tarefa ADD (
  id_proxima_tarefa_2 bigint unsigned,
  id_proxima_tarefa_3 bigint unsigned,
  id_proxima_tarefa_4 bigint unsigned,
  id_proxima_tarefa_5 bigint unsigned,
  id_proxima_tarefa_6 bigint unsigned,
  id_proxima_tarefa_7 bigint unsigned,
  CONSTRAINT fk_proxima_tarefa_2 FOREIGN KEY (id_proxima_tarefa_2) REFERENCES atv_tarefa(id_tarefa),
  CONSTRAINT fk_proxima_tarefa_3 FOREIGN KEY (id_proxima_tarefa_3) REFERENCES atv_tarefa(id_tarefa),
  CONSTRAINT fk_proxima_tarefa_4 FOREIGN KEY (id_proxima_tarefa_4) REFERENCES atv_tarefa(id_tarefa),
  CONSTRAINT fk_proxima_tarefa_5 FOREIGN KEY (id_proxima_tarefa_5) REFERENCES atv_tarefa(id_tarefa),
  CONSTRAINT fk_proxima_tarefa_6 FOREIGN KEY (id_proxima_tarefa_6) REFERENCES atv_tarefa(id_tarefa),
  CONSTRAINT fk_proxima_tarefa_7 FOREIGN KEY (id_proxima_tarefa_7) REFERENCES atv_tarefa(id_tarefa)
);

-------------------- Ainda não rodou no cliente -------------------------

ALTER TABLE atv_tarefa ADD COLUMN observacao VARCHAR(255);