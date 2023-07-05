#!/bin/bash
# Elimina !TUDO! o que temos acerca do docker (redes, imagens, containers, etc...)

# Parar todos os containers em execução
sudo docker stop $(sudo docker ps -aq)

# Remover todos os containers
sudo docker rm $(sudo docker ps -aq)

# Remover todas as imagens
sudo docker rmi $(sudo docker images -aq)

# Remover todos os volumes
sudo docker volume rm $(sudo docker volume ls -q)

sudo docker system prune
