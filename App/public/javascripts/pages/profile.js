let modal = $('#modal')

$(document).ready(function () {
    // Para quando a página for recarregada os campos fiquem desativados
    $('#confirmButton').css('display', 'none')
    $(`input`).prop('disabled', true)
    $('#editButton').css('display', 'block')
    $('#cancelButton').css('display', 'none')

    $('.confirmButton').on('click', (event) => {
        event.preventDefault(); // evita submeter logo o formulário (acção por defeito de um type=submit) sem a confirmação do utilizador.
        modalConfirmChange()
    });
})

function postRequest(route, jsonData) {
    return fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData || {})
    }).then((result) => {
        if(result.status == 200)
            return result
        else
            throw result
    }).catch((err) => {
        throw err
    });
}

function enableEdition() {
    $('#confirmButton').css('display', 'block')
    $(`input`).prop('disabled', false)
    $('#editButton').css('display', 'none')
    $('#cancelButton').css('display', 'block')
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

function modalConfirmYesNo(title, onclickYes, onclickNo = '$.modal.close()'){
    modal.empty(); $.modal.close();
    modal.append($(`<h4>${title}</h4>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-margin w3-padding w3-teal" onclick="${onclickYes}" type="button" >Sim</button>`))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-margin w3-padding w3-red" onclick="${onclickNo}" type="button" >Não</button>`))
    modal.modal()
}

function modalConfirmChange(){
    modalConfirmYesNo('Deseja submeter as alterações efectuadas?', 'submitProfileChanges()')
}

function submitProfileChanges(){
    let formData = {}
    new URLSearchParams($(`#form`).serialize()).forEach((value, key) => formData[key] = value) // constrói um JSON para enviarmos o pedido (o serialize mete os dados do formulário numa query string e isto serve para a transformar num objecto)

    postRequest('/editProfile', formData) // envia a edição ao servidor de interface
    .then((result) => {
        modalAlert('Submissão realizada!','As mudanças foram realizadas com sucesso!')
        $('#confirmButton').css('display', 'none')
        $(`input`).prop('disabled', true)
        $('#editButton').css('display', 'block')
        $('#cancelButton').css('display', 'none')

    }).catch((err) => {
        if(err.status == 409){
            modalAlert('Operação Inválida!', 'O email inserido já está a ser utilizado!')
        }
        else if(err.status == 512){
            modalAlert('Operação Inválida!', 'Os campos não podem estar vazios!')
        }
    });
}