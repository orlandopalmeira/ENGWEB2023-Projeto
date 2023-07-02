
let modalReturn = null;
let modal = $('#modal')

$(document).ready(() => {
    let selectSort = $('#sortParam') // select para o utilizador mudar o parâmetro
    if (selectSort.length > 0){ // o select de ordenação existe?
        var url = new URL(window.location.href); // URL actual
        var params = Object.fromEntries(url.searchParams); // query string actual em objecto
    
        // Qual o parâmetro de ordenação 
        let currentSortBy = params.sort_by || 'Data do Acordão' // campo da ordenação
        let currentOrderBy = params.order_by || 'desc' // tipo de ordenação, descendente por padrão
    
        // Através das informações da URL, determina qual o <option> do <select> é que deve estar seleccionado.
        $(`#sortParam option[value="sort_by=${currentSortBy}&order_by=${currentOrderBy}"]`).prop('selected', true)
    
        // O que faz quando o utilizador troca o parâmetro de ordenação.
        selectSort.change(() => {
            let sortRule = Object.fromEntries(new URLSearchParams(selectSort.val())) // {sort_by: Campo, order_by: asc/desc}
            // Actualiza os parâmetros de ordenação conforme o que o utilizador seleccionou
            params.sort_by = sortRule.sort_by
            params.order_by = sortRule.order_by
            // Como mudamos o parâmetro de ordenação, temos de voltar à página 1
            delete params.page
            // Redirecciona para o novo link
            window.location =  window.location.origin + window.location.pathname + "?" + $.param(params)
        })
    }
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

function setModalReturn(value = null, elementID = null) { // podemos dar directamente o valor ou dar o ID de um elemento html que contém o valor
    if(value)
        modalReturn = value
    else if(elementID)
        modalReturn = $(`#${elementID}`).val()
}

function modalInput(idAcordao){
    modal.empty(); $.modal.close();
    modal.append($(`<h4 class="w3-margin">Insira a descrição do favorito</h4>`))
    modal.append($(`<textarea class="w3-input w3-border" id="modalInput" placeholder="(Opcional)" style="resize: none" rows="3" type="text"></textarea>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-black" onclick="addFavourite('${idAcordao}')" type="button" >Confirmar</button>`))
    modal.modal()
}

function modalConfirmFavourite(idAcordao){
    modal.empty(); $.modal.close();
    modal.append($(`<h4>Deseja remover o favorito?</h4>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin w3-button w3-btn w3-round w3-red w3-hover-pale-red" onclick="removeFavourite('${idAcordao}')" type="button" >Sim</button>`))
    modal.append($('<button class="w3-margin w3-button w3-btn w3-round w3-grey" onclick="$.modal.close()" type="button" >Não</button>'))
    modal.modal()
} 

function modalAlert(title, description){
    modal.empty(); $.modal.close();
    modal.append($(`<h4>${title}</h4>`))
    modal.append($('<br>'))
    modal.append($(`<p>${description}</p>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin-top w3-button w3-round w3-black" onclick="$.modal.close()" type="button">Ok</button>`))
    modal.modal()
}

function addFavourite(idAcordao){
    let favourite = {'idAcordao': idAcordao, descricao: $('#modalInput').val()}
    postRequest('/addFavourite',favourite)
    .then((result) => {
        if(result.status == 200){
            modalAlert('Favorito criado!', 'Favorito criado com sucesso!')
            // preenche o coração para marcar como favorito
            $(`#favIcon${idAcordao}`).removeClass('fa-regular')
            $(`#favIcon${idAcordao}`).addClass('fa-solid')
            $(`#button${idAcordao}`).attr('onclick',`modalConfirmFavourite('${idAcordao}')`)
            $(`#button${idAcordao}`).attr('title','Remover dos favoritos')
        }else
            throw result
    }).catch((err) => {
        modalAlert('Erro!', 'Houve um erro na criação do favorito. Tente de novo.')
        throw err
    });
}

function removeFavourite(idAcordao){
    getRequest(`/deleteFavourite?idAcordao=${idAcordao}`)
    .then((result) => {
        if(result.status == 200){
            modalAlert('Favorito removido!', 'Favorito removido com sucesso!')
            // retira o preenchimento do coração para mostrar que já não é favorito
            $(`#favIcon${idAcordao}`).removeClass('fa-solid')
            $(`#favIcon${idAcordao}`).addClass('fa-regular')
            $(`#button${idAcordao}`).attr('onclick',`modalInput('${idAcordao}')`)
            $(`#button${idAcordao}`).attr('title','Adicionar aos favoritos')
        }else
            throw result
    }).catch((err) => {
        modalAlert('Erro!', 'Houve um erro na remoção do favorito. Tente de novo.')
        throw err
    });
}

function modalConfirmAcordao(idAcordao){
    modal.empty(); $.modal.close();
    modal.append($(`<h4>Deseja remover o acórdão?</h4>`))
    modal.append($('<br>'))
    modal.append($(`<button class="w3-margin w3-button w3-btn w3-round w3-red w3-hover-pale-red" onclick="deleteAcordao('${idAcordao}')" type="button" >Remover</button>`))
    modal.append($('<button class="w3-margin w3-button w3-btn w3-round w3-grey" onclick="$.modal.close()" type="button" >Cancelar</button>'))
    modal.modal()
}

function deleteAcordao(idAcordao) {
    getRequest(`/acordaos/delete/${idAcordao}`)
    .then((result) => {
        modalAlert('Acórdão removido!', 'Acórdão removido com sucesso!')
        $(`#card${idAcordao}`).remove()
    }).catch((err) => {
        modalAlert('Erro!', 'Houve um erro na remoção do acórdão. Tente de novo.')
        throw err
    });
}