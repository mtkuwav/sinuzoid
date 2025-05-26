#!/bin/bash

# Couleurs pour un meilleur affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}          SINUZOID - SERVICES AVAILIBLE         ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""

source .env

echo -e "${BLUE}Frontend:${NC} http://localhost:${FRONTEND_PORT}"
echo -e "${BLUE}API (FastAPI):${NC} http://localhost:${API_PORT}"
echo -e "${BLUE}Auth Service (Symfony):${NC} http://localhost:${AUTH_PORT}"
echo -e "${BLUE}Nginx:${NC} http://localhost:${NGINX_PORT}"
echo -e "${BLUE}PgAdmin:${NC} http://localhost:${PGADMIN_PORT}"
echo -e "${BLUE}PostgreSQL:${NC} localhost:${DB_PORT}"
echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  PgAdmin crendentials:${NC}"
echo -e "${GREEN}    - Email:${NC} ${PGADMIN_DEFAULT_EMAIL}"
echo -e "${GREEN}    - Password:${NC} ${PGADMIN_DEFAULT_PASSWORD}"
echo ""
echo -e "${GREEN}  Database connection:${NC}"
echo -e "${GREEN}    - Host:${NC} db (from containers) or localhost (from host)"
echo -e "${GREEN}    - Port:${NC} 5432"
echo -e "${GREEN}    - Database:${NC} ${POSTGRES_DB}"
echo -e "${GREEN}    - User:${NC} ${POSTGRES_USER}"
echo -e "${GREEN}    - Password:${NC} ${POSTGRES_PASSWORD}"
echo -e "${GREEN}==================================================${NC}"