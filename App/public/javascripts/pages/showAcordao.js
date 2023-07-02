let modal = $('#modal')

$(document).ready(function () {
    $('.my-text').each((index, element) => {
        const maxHeight = '250px'
        var myText = $(element)
        var contentElement = myText.find('div')[0]
        var buttonElement = myText.find('button')[0]
        var reticenciasElement = myText.find('span')[0]

        // Check if the content overflows the container
        if (contentElement.scrollHeight > contentElement.clientHeight) {
            $(buttonElement).css('display', 'block');
            $(reticenciasElement).css('display', 'block');
        }
        else {
            $(buttonElement).css('display', 'none');
            $(reticenciasElement).css('display', 'none');
        }
        $(buttonElement).on('click', function () {
            if ($(contentElement).css('max-height') === maxHeight) {
                // Se a div estiver a mostrar tudo, faz o seguinte:
                $(contentElement).css('max-height', 'none'); // Show the full content
                $(reticenciasElement).css('display', 'none');
                $(buttonElement).text('Mostrar menos'); // Change the button text
            }
            else { //* Se a div estiver abreviada, faz o seguinte:
                $(contentElement).css('max-height', maxHeight); // Hide the excess content
                $(reticenciasElement).css('display', 'block');
                $(buttonElement).text('Mostrar mais'); // Change the button text
            }
        });
    })
});


function postRequest(route, jsonData) {
    return fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData || {})
    }).then((result) => {
        if (result.status == 200)
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
            if (response.status == 200)
                return response
            else
                throw response
        })
        .catch(error => {
            throw error
        });
}

function modalInput(idAcordao) {
    modal.empty(); $.modal.close();
    modal.append($(`<h4 class="w3-margin">Insira a descrição do favorito</h4>`))
    modal.append($(`<textarea class="w3-input w3-border" id="modalInput" placeholder="(Opcional)" style="resize: none" rows="3" type="text"></textarea>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-black" onclick="addFavourite('${idAcordao}')" type="button" >Confirmar</button>`))
    modal.modal()
}

function modalConfirmFavourite(idAcordao) {
    modal.empty(); $.modal.close();
    modal.append($(`<h4>Deseja remover o favorito?</h4>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin w3-button w3-btn w3-round w3-red w3-hover-pale-red" onclick="removeFavourite('${idAcordao}')" type="button" >Sim</button>`))
    modal.append($('<button class="w3-margin w3-button w3-btn w3-round w3-grey" onclick="$.modal.close()" type="button" >Não</button>'))
    modal.modal()
}

function modalAlert(title, description, onclickOk = '$.modal.close()') {
    modal.empty(); $.modal.close();
    modal.append($(`<h4>${title}</h4>`))
    modal.append($('<br>'))
    modal.append($(`<p>${description}</p>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-black" onclick="${onclickOk}" type="button">Ok</button>`))
    modal.modal()
}

function addFavourite(idAcordao) {
    let favourite = { 'idAcordao': idAcordao, descricao: $('#modalInput').val() }
    postRequest('/addFavourite', favourite)
        .then((result) => {
            if (result.status == 200) {
                modalAlert('Favorito criado!', 'Favorito criado com sucesso!')
                // preenche o coração para marcar como favorito
                $(`#favIcon${idAcordao}`).removeClass('fa-regular')
                $(`#favIcon${idAcordao}`).addClass('fa-solid')
                $(`#button${idAcordao}`).attr('onclick', `modalConfirmFavourite('${idAcordao}')`)
                $(`#button${idAcordao}`).attr('title', 'Remover dos favoritos')
            } else
                throw result
        }).catch((err) => {
            modalAlert('Erro!', 'Houve um erro na criação do favorito. Tente de novo.')
            throw err
        });
}

function removeFavourite(idAcordao) {
    getRequest(`/deleteFavourite?idAcordao=${idAcordao}`)
        .then((result) => {
            if (result.status == 200) {
                modalAlert('Favorito removido!', 'Favorito removido com sucesso!')
                // retira o preenchimento do coração para mostrar que já não é favorito
                $(`#favIcon${idAcordao}`).removeClass('fa-solid')
                $(`#favIcon${idAcordao}`).addClass('fa-regular')
                $(`#button${idAcordao}`).attr('onclick', `modalInput('${idAcordao}')`)
                $(`#button${idAcordao}`).attr('title', 'Adicionar aos favoritos')
            } else
                throw result
        }).catch((err) => {
            modalAlert('Erro!', 'Houve um erro na remoção do favorito. Tente de novo.')
            throw err
        });
}

function modalConfirmAcordao(idAcordao, referer) {
    modal.empty(); $.modal.close();
    modal.append($(`<h4>Deseja remover o acórdão?</h4>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin w3-button w3-btn w3-round w3-red w3-hover-pale-red" onclick="removeAcordao('${idAcordao}','${referer}')" type="button" >Sim</button>`))
    modal.append($('<button class="w3-margin w3-button w3-btn w3-round w3-grey" onclick="$.modal.close()" type="button" >Não</button>'))
    modal.modal()
}

function removeAcordao(idAcordao, referer) {
    getRequest(`/acordaos/delete/${idAcordao}`)
        .then((result) => {
            if (result.status == 200) {
                modalAlert('Acórdão removido!', 'Acórdão removido com sucesso!',`window.location = '${referer}'`)
            }
            else modalAlert('Erro!', 'Houve um erro na remoção do acórdão. Tente de novo.')
        }).catch((err) => {
            modalAlert('Erro!', 'Houve um erro na remoção do acórdão. Tente de novo.')
        });
}

function printAcordao(){
    let buttons = [] // apenas para não termos de estar a fazer o each outra vez para ver quais botões vamos fazer "trigger"
    $('.my-text').each((_,element) => { // recolhe e acciona os botões "Mostrar mais" visíveis.
        let button = $($(element).find('button')[0])
        if(button.css('display') === 'block' && button.text() === 'Mostrar mais'){
            button.trigger('click')
            buttons.push(button)
        }
    })
    $('header div').css('display', 'none');
    $('#acordaoActions').css('display', 'none');
    $('footer').css('display', 'none');
    window.print()
    $('footer').css('display', 'block');
    $('#acordaoActions').css('display', 'block');
    $('header div').css('display', 'block');
    buttons.forEach(button => button.trigger('click')) // reverte a acção feita por esta função nos botões "Mostrar mais"
}