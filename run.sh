#!/bin/bash
# Script para automatização da execução dos três serviços directamente no computador local.
# Esta script só funciona se se tiver a base de dados directamente no computador. 
# É mais aconselhável utilizar a script que arranca a aplicação no docker (./runDocker.sh)

sudo systemctl start mongod # arranca o servidor do mongodb

# Inicia o servidor de autenticação
cd ./Auth || exit

gnome-terminal --tab -- /bin/bash -c "clear; npm start; exit; exec /bin/bash"

# Inicia a API de dados
cd ../API || exit

gnome-terminal --tab -- /bin/bash -c "clear; npm start; exit; exec /bin/bash"

# Inicia o servidor de interface.
cd ../App || exit

sleep 1 # para garantir que a API já se iniciou. (O servidor de interface depende da API)
gnome-terminal --tab -- /bin/bash -c "clear; npm start; exit; exec /bin/bash"

echo "Pressione ENTER para terminar os processos da aplicação..."
read -r

echo "A terminar todos os serviços..."

sudo kill $(sudo lsof -t -i:7777) 
sudo kill $(sudo lsof -t -i:7778) 
sudo kill $(sudo lsof -t -i:7779)

echo "Terminado"