#!/bin/bash

#EXECUTE ESSE SCRIPT NA RAIZ DO PROJETO

# Definições do banco de dados
CONTAINER_NAME="universe_db"
DB_NAME="academy_db"
DB_USER="user-dev"

# Arquivos a serem monitorados
DB_SQL="./database/exercises/db.sql"
UNIVERSES_SQL="./RoboticsInfrastructure/database/universes.sql"
DJANGO_AUTH_SQL="./database/django_auth.sql"

# ==============================================
# FUNÇÕES AUXILIARES
# ==============================================
error_handler() {
  echo "❌ ERRO CRÍTICO: $1"
  echo "🔍 Detalhes: $2"
  exit 1
}

run_sql_file() {
  local file_path="$1"
  local description="$2"
  
  # Verifica se arquivo existe
  if [ ! -f "$file_path" ]; then
    error_handler "Arquivo não encontrado" "$description ($file_path) não existe"
  fi

  echo "📁 Carregando: $description..."
  output=$(docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" < "$file_path" 2>&1)
  status=$?
  
  if [ $status -ne 0 ]; then
    error_handler "Falha ao executar arquivo SQL" "$output"
  fi
}

# ========== EXECUÇÃO PRINCIPAL ========== #

# Verifica se o container está rodando
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Erro: O container '$CONTAINER_NAME' não está em execução."
  exit 1
fi

# Verifica se o banco de dados existe
DB_EXISTS=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';")
if [ "$DB_EXISTS" != "1" ]; then
  echo "❌ Erro: O banco de dados '$DB_NAME' não existe no container."
  exit 1
fi

echo "✅ Container e arquivos verificados. Iniciando reset do banco..."

# Reseta o banco e aplica os novos scripts
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME <<EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
EOF

# 2. Executa os scripts SQL para recriar tabelas e dados
run_sql_file "$UNIVERSES_SQL" "universes.sql"
run_sql_file "$DB_SQL" "db.sql"
run_sql_file "$DJANGO_AUTH_SQL" "django_auth.sql"

echo "✅ Banco de dados atualizado com sucesso!"
