let modal = $('#modal')

$(document).ready(function () {
    $('.confirmButton').on('click', (event) => {
        event.preventDefault(); // evita submeter logo o formulário (acção por defeito de um type=submit) sem a confirmação do utilizador.
        let idAcordao = event.target.id.substring(13) // obtém o id do acórdão para se obter os diversos ids dos restantes elementos HTML (o target.id será uma string tipo "confirmButton6498494...")
        modalConfirmChangeFavourite(idAcordao)
    });
})

function postRequest(route, jsonData) {
    return fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData || "{}")
    }).then((result) => {
        if(result.status == 200)
            return result
        else
            throw result
    }).catch((err) => {
        throw err
    });
}

function getRequest(route) {
    return fetch(route)
        .then(response => {
            if(response.status == 200)
                return response
            else
                throw response
        })
        .catch(error => {
            throw error
        });
}

function modalAlert(title, description){
    modal.empty(); $.modal.close();
    modal.append($(`<h4>${title}</h4>`))
    modal.append($('<br>'))
    modal.append($(`<p>${description}</p>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin-top w3-padding w3-button w3-round w3-teal" onclick="$.modal.close()" type="button">Ok</button>`))
    modal.modal()
}

function modalConfirm(title, onclickYes, onclickNo = '$.modal.close()'){
    modal.empty(); $.modal.close();
    modal.append($(`<h4>${title}</h4>`))
    modal.append($('<br>'))
    modal.append($('<center>'))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-margin w3-red " onclick="${onclickYes}" type="button" >Eliminar</button>`))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-margin w3-blue" onclick="${onclickNo}" type="button" >Cancelar</button>`))
    modal.append($('</center>'))
    modal.modal()
}

function modalConfirmYesNo(title, onclickYes, onclickNo = '$.modal.close()'){
    modal.empty(); $.modal.close();
    modal.append($(`<h4>${title}</h4>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-margin w3-padding w3-teal" onclick="${onclickYes}" type="button" >Sim</button>`))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-margin w3-padding w3-red" onclick="${onclickNo}" type="button" >Não</button>`))
    modal.modal()
}


function enableEdition(idAcordao) {
    $(`#confirmButton${idAcordao}`).css('display', 'block')
    $(`#textArea${idAcordao}`).prop('disabled', false)
}


function modalConfirmChangeFavourite(idAcordao){
    modalConfirmYesNo('Deseja submeter as alterações efectuadas?', `submitFavouriteChanges('${idAcordao}')`)
}

function modalConfirmDeleteFavourite(idAcordao){
    modalConfirm('Tem a certeza que pretende eliminar este favorito?', `deleteFavourite('${idAcordao}')`)
}

function submitFavouriteChanges(idAcordao){
    let formData = {}
    new URLSearchParams($(`#form${idAcordao}`).serialize()).forEach((value, key) => formData[key] = value) // constrói um JSON para enviarmos o pedido (o serialize mete os dados do formulário numa query string e isto serve para a transformar num objecto)

    postRequest('/editFavourite', formData) // envia a edição ao servidor de interface
    .then((result) => {
        modalAlert('Submissão realizada!','As mudanças foram realizadas com sucesso!')
        $(`#confirmButton${idAcordao}`).css('display', 'none')
        $(`#textArea${idAcordao}`).prop('disabled', true)
    }).catch((err) => {
        modalAlert('Erro!', 'Erro na submissão! Tente de novo.')
    });
}

function deleteFavourite(idAcordao) {
    getRequest(`/deleteFavourite?idAcordao=${idAcordao}`)
    .then((result) => {
        modalAlert('Favorito eliminado!','Favorito eliminado com sucesso!')
        $(`#favourite${idAcordao}`).remove()
    }).catch((err) => {
        throw err
    });
}