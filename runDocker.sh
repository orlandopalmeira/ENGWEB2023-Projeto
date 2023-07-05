#!/bin/bash
# Script para executar a aplicação no docker

mongodata="./mongodata" # volume do container (Docker) do mongodb 
mongodatazip="./mongodata.zip" # zip que contém a base de dados
chunks="chunks/chunk_*" # ficheiros separados que compõe o zip da base de dados (foi necessário partir o zip uma vez que o github não permite ficheiros grandes)

if [ -d "$mongodata" ]; then
    sudo echo "Directoria '$mongodata' existe."
    echo "Atenção: Se a directoria '$mongodata' tiver conteúdo indevido, a aplicação não irá funcionar conforme o esperado."
    echo "Se ocorrer algum erro, tente eliminar a directoria '$mongodata' (sudo rm -r $mongodata/) e volte a correr esta script."
else
    sudo echo "A construir o zip $mongodatazip"
    cat $chunks > "mongodata.zip"
    echo "A descompactar '$mongodatazip'."
    sudo unzip "$mongodatazip"
    echo "$mongodatazip descompactado."
    sudo rm "$mongodatazip"
    echo "$mongodatazip apagado."
fi

# Iniciar o docker
printf "\nA iniciar a aplicação no docker\n"
while true; do # executa o comando até não dar erro (tem resultado sempre)
    sudo docker-compose up -d --build
    if [ $? -eq 0 ]; then
        # sudo docker-compose up -d --build correu bem
        break
    else
        # sudo docker-compose up -d --build não correu bem
        sleep 1 # Aguarda 1 segundo antes de tentar novamente
    fi
done

# Mostra os containers em execução
sudo docker ps -a

printf "\nPara utilizar a aplicação, utilize a seguinte conta de administrador:\n"
echo "Email: admin@tribunais.gov.pt"
echo "Palavra-passe: admin"

printf "\nChegamos ao fim!\n"
echo "Para aceder à aplicação, utilize o seguinte link: http://localhost:7777/login"