#!/bin/bash

#EXECUTE ESSE SCRIPT NA RAIZ DO PROJETO

# Definições do banco de dados
CONTAINER_NAME="universe_db"
DB_NAME="academy_db"
DB_USER="user-dev"

# Arquivos a serem monitorados
DB_SQL="./database/exercises/db.sql"
UNIVERSES_SQL="./RoboticsInfrastructure/database/universes.sql"

# Verifica se o container está rodando
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Erro: O container '$CONTAINER_NAME' não está em execução."
  exit 1
fi

# Verifica se os arquivos SQL existem
if [ ! -f "$DB_SQL" ]; then
  echo "❌ Erro: Arquivo '$DB_SQL' não encontrado."
  exit 1
fi

if [ ! -f "$UNIVERSES_SQL" ]; then
  echo "❌ Erro: Arquivo '$UNIVERSES_SQL' não encontrado."
  exit 1
fi

# Verifica se o banco de dados existe
DB_EXISTS=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';")
if [ "$DB_EXISTS" != "1" ]; then
  echo "❌ Erro: O banco de dados '$DB_NAME' não existe no container."
  exit 1
fi

# ========== EXECUÇÃO PRINCIPAL ========== #

echo "✅ Container e arquivos verificados. Iniciando reset do banco..."

# Reseta o banco e aplica os novos scripts
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME <<EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
EOF

# Reexecuta os scripts SQL para recriar as tabelas e dados
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$UNIVERSES_SQL"
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$DB_SQL"

echo "✅ Banco de dados atualizado com sucesso!"
