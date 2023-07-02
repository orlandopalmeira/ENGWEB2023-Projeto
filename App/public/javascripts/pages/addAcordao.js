// solução temporária até não arranjarmos algo melhor
const fields = [
    "Votação",
    "Decisão",
    "Meio Processual",
    "Nº do Documento",
    "Nº Convencional",
    "Texto Integral",
    "Sumário",
    "Privacidade",
    "Legislação Nacional",
    "Decisão Texto Integral",
    "Área Temática",
    "Tribunal",
    "Recorrente",
    "Recorrido 1",
    "Data de Entrada",
    "Objecto",
    "Jurisprudência Nacional",
    "Ano da Publicação",
    "Indicações Eventuais"
]

let lastID = 1
let fieldID = 1
var today = new Date().toISOString().split('T')[0];

$(document).ready(function(){
    $('#manualInputDiv').css('display', 'block')
    $('#fileInputDiv').css('display', 'none')
    $('#manualButton').prop('checked', true)
    $('#fileButton').prop('checked', false)

    $('.select2').select2({
        placeholder: 'Selecione um campo ou crie um novo',
        allowClear: false,
        tags: true
    });

    $('#dataAcordaoField').attr("max", today);
})

function fieldExists(field){
    if(field == 'Descritores' && $('#descritoresDiv').length > 0){
        return true
    }
    let res = []
    $('form input').each(function(){
        res.push($(this).attr('name'))
    })
    $('form textarea').each(function(){
        res.push($(this).attr('name'))
    })
    $('form select').each(function(){
        res.push($(this).attr('name'))
    })
    res = res.filter(elem => elem != undefined)
    return new Set(res).has(field)
}

// Abre o modal de inserção do nome do novo campo
function showNewFieldModal(){
    $('#newFieldName').html('')
    for(let field of fields.filter(elem => !fieldExists(elem))){
        $('#newFieldName').append($(`
            <option value="${field}">${field}</option>
        `))
    }
    $('#modalWarning').html('')
    $('#newFieldName').val('')
    $('#newFieldModal').modal()
}

function addDescriptor(){
    let newDesc = $(`<div class="w3-row" id="descritor${++lastID}">
        <input class="w3-col w3-input caps w3-border w3-margin-bottom" type="text" style="width: 95%" name="Descritores" placeholder="" value="" required/>
        <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeDescriptor('descritor${lastID}')">&times;</button>
    </div>`)
    $('#descritoresDiv').append(newDesc)
}

function removeDescriptor(id){
    if($('#descritoresDiv').children().length > 1){
        //* Explicação 
        //* Como é obrigatório ter, pelo menos, 1 descritor, não permito que se elimine o campo
        //* de um descritor se este for o único existente
        $(`#${id}`).remove();
    }
}

function addField(){
    let fieldName = $('#newFieldName').val()
    if(!fieldExists(fieldName)){
        if (fieldName === "Descritores"){
            $('#newFieldName').val('') // apaga o valor do campo para evitar problemas
            let newField = $(`
            <div class="w3-card w3-margin w3-padding w3-light-gray">
            <label class="w3-large">${fieldName}</label>
            <input type="hidden" id="${lastID}" value = 0/>
            <div class="w3-container" id="descritoresDiv">
                <div class="w3-row" id="descritor${lastID}">
                    <input class="w3-col w3-input caps w3-border w3-margin-bottom" type="text" style="width: 95%" name="Descritores" placeholder="Insira o novo descritor" value=""/>
                    <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeDescriptor('descritor${lastID}')">&times;</button>
                </div>
            </div>
            
            <button class="w3-margin-left w3-margin-bottom w3-rest w3-button w3-green w3-round" type="button" onclick="addDescriptor()"> Adicionar descritor</button>
            </div>
            br
            `)
            $('#newFieldsDiv').append(newField)
            $.modal.close();
        }
        else if(/^Data/.test(fieldName)){
            $('#newFieldName').val('') // apaga o valor do campo para evitar problemas
            let newField = $(`<div class="w3-card w3-margin w3-padding w3-light-gray" id="field${++fieldID}">
                <label class="w3-large">${fieldName}</label>
                <div class="w3-row" >
                    <input class="w3-col w3-input w3-border" type="date" name="${fieldName}" style="width: 95%" placeholder="Insira o valor do novo campo"/>
                    <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeField('field${fieldID}')">&times;</button>
                </div>
            </div>`)
            $('#newFieldsDiv').append(newField)
            $.modal.close();
        }
        else{
            $('#newFieldName').val('') // apaga o valor do campo para evitar problemas
            let newField = $(`<div class="w3-card w3-margin w3-padding w3-light-gray" id="field${++fieldID}">
                <label class="w3-large">${fieldName}</label>
                <div class="w3-row" >
                    <input class="w3-col w3-input w3-border" type="text" name="${fieldName}" style="width: 95%" placeholder="Insira o valor do novo campo"/>
                    <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeField('field${fieldID}')">&times;</button>
                </div>
            </div>`)
            $('#newFieldsDiv').append(newField)
            $.modal.close();
        }
    }else{
        $('#modalWarning').html(`O campo '${fieldName}' já existe neste acórdão!`)
        $('#newFieldName').val('')
    }
}

function removeField(id){
    $(`#${id}`).remove();
}

function manualInput(){
    $('#manualInputDiv').css('display', 'block')
    $('#fileInputDiv').css('display', 'none')
}

function fileInput(){
    $('#manualInputDiv').css('display', 'none')
    $('#fileInputDiv').css('display', 'block')
}

function instructionShow(){
    var x = document.getElementById("instructionDiv");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
}
