#!/bin/bash

CYAN='\e[0;96m'
RED='\e[1;31m'
NC='\e[0m'

docker compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${CYAN}Containers have been started successfully.${NC}"
    echo ""
    sleep 1
    ./scripts/show-ports.sh
else
    echo -e "${RED}Error starting containers.${NC}"
fi