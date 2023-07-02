let lastID = -1
let fieldID = 1

// solução temporária até não arranjarmos algo melhor
const fields = [
    "Processo",
    "Data do Acordão",
    "Juiz",
    "Descritores",
    "Tribunal",
    "Nº Convencional",
    "Nº do Documento",
    "Data de Entrada",
    "Recorrente",
    "Recorrido 1",
    "Votação",
    "Texto Integral",
    "url",
    "tribunal",
    "Legislação Nacional",
    "Legislação Comunitária",
    "Jurisprudência Nacional",
    "Meio Processual",
    "Objecto",
    "Decisão",
    "Área Temática 1",
    "Área Temática 2",
    "Nº do Volume",
    "Recorrido 2",
    "Legislação Estrangeira",
    "Referências Internacionais",
    "Referência a Doutrina",
    "Indicações Eventuais",
    "Jurisprudência Internacional",
    "Referência a Pareceres",
    "Recusa Aplicação",
    "Jurisprudência Estrangeira",
    "1ª Pág. de Publicação do Acordão",
    "Referência Publicação 1",
    "Ano da Publicação",
    "Privacidade",
    "Apêndice",
    "Data do Apêndice",
    "Página",
    "Referência Publicação 2",
    "Secção",
    "Sumário",
    "Parecer Ministério Publico",
    "Decisão Texto Integral",
    "Contencioso",
    "Peça Processual",
    "Data",
    "Nº Processo/TAF",
    "Tema",
    "Sub-Secção",
    "Disponível na JTCA",
    "Observações",
    "Área Temática",
    "Tribunal 1ª instância",
    "Juízo ou Secção",
    "Tipo de Ação",
    "Tipo de Contrato",
    "Autor",
    "Réu",
    "Data da Decisão",
    "Texto das Cláusulas Abusivas",
    "Recursos",
    "Texto Parcial",
    "Referência de Publicação",
    "Tribunal Recurso",
    "Apenso",
    "Processo no Tribunal Recurso",
    "Recurso",
    "Nº Único do Processo",
    "Referência Processo",
    "Acordão",
    "Espécie",
    "Requerente",
    "Requerido",
    "Volume dos Acordãos do T.C.",
    "Constituição",
    "Normas Apreciadas",
    "Normas Julgadas Inconst.",
    "Nº do Diário da República",
    "Série do Diário da República",
    "Data do Diário da República",
    "Página do Diário da República",
    "Normas Suscitadas",
    "Nº do Boletim do M.J.",
    "Página do Boletim do M.J.",
    "Jurisprudência Constitucional",
    "Outras Publicações",
    "Voto Vencido",
    "Página do Volume",
    "Declaração de Voto",
    "Normas Declaradas Inconst.",
    "Outra Jurisprudência",
    "Data da Decisão Sumária",
    "Doutrina",
    "Data da Reclamação",
    "Tribunal Recorrido",
    "Processo no Tribunal Recorrido",
    "Reclamações",
    "Data Dec. Recorrida"
]

$(() => {
    lastID = parseInt($('#last_id').val()) || 0
    // // Campo do tribunal com um select que permite valores personalizados
    $('.select2').select2({
        placeholder: 'Selecione um campo ou crie um novo',
        allowClear: false,
        tags: true
    });
});

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
    lastID++
    let newDesc = $(`<div class="w3-row" id="descritor${lastID}">
        <input class="w3-col w3-input w3-border w3-margin-bottom" type="text" style="width: 95%" name="Descritores" placeholder="Insira o novo descritor" value="" oninput="this.value = this.value.toUpperCase()"/>
        <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeDescriptor('descritor${lastID}')">&times;</button>
    </div>`)
    $('#descritoresDiv').append(newDesc)
}

function removeDescriptor(id){
    $(`#${id}`).remove();
}

function addField(){
    let fieldName = $('#newFieldName').val()
    if(!fieldExists(fieldName)){
        if (fieldName === "Descritores"){
            $('#newFieldName').val('') // apaga o valor do campo para evitar problemas
            let newField = $(`
            <label>${fieldName}</label>
            <input type="hidden" id="${lastID}" value = 0/>
            <div class="w3-container" id="descritoresDiv">
                <div class="w3-row" id="descritor${lastID}">
                    <input class="w3-col w3-input w3-border w3-margin-bottom" type="text" style="width: 95%" name="Descritores" placeholder="Insira o novo descritor" value="" oninput="this.value = this.value.toUpperCase()"/>
                    <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeDescriptor('descritor${lastID}')">&times;</button>
                </div>
            </div>
            
            <button class="w3-margin-left w3-margin-bottom w3-rest w3-button w3-teal w3-round" type="button" onclick="addDescriptor()"> Adicionar descritor</button>
            br
            `)
            $('#newFieldsDiv').append(newField)
            $.modal.close();
        }
        else if(/^Data/.test(fieldName)){
            $('#newFieldName').val('') // apaga o valor do campo para evitar problemas
            let newField = $(`<div id="field${++fieldID}">
                <label>${fieldName}</label>
                <div class="w3-row" >
                    <input class="w3-col w3-input w3-border" type="date" name="${fieldName}" style="width: 95%" placeholder="Insira o valor do novo campo"/>
                    <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeDescriptor('field${fieldID}')">&times;</button>
                </div>
            </div>`)
            $('#newFieldsDiv').append(newField)
            $.modal.close();
        }
        else{
            $('#newFieldName').val('') // apaga o valor do campo para evitar problemas
            let newField = $(`<div id="field${++fieldID}">
                <label>${fieldName}</label>
                <div class="w3-row" >
                    <input class="w3-col w3-input w3-border" type="text" name="${fieldName}" style="width: 95%" placeholder="Insira o valor do novo campo"/>
                    <button class="w3-margin-left w3-rest w3-button w3-red w3-round" type="button" onclick="removeDescriptor('field${fieldID}')">&times;</button>
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

