#!/bin/bash

set -a
source .env
set +a

docker compose exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "
DO \$\$ 
DECLARE 
    r RECORD;
BEGIN
    SET session_replication_role = replica;

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;

    SET session_replication_role = DEFAULT;
END \$\$;"