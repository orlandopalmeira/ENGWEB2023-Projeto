var today = new Date().toISOString().split('T')[0];

$(document).ready(function(){
    $("#dateEndField").on('input', () => {
        let d_start = new Date($('#dateStartField').val()) || 0,
            d_end   = new Date($('#dateEndField').val())   || Infinity
        
        if(d_start > d_end) {
            $('#badDatesWarning').html('A data final deve ser posterior à data inicial!')
        }else{
            $('#badDatesWarning').html('')
        }
        $('#btnSubmit').prop('disabled', d_start > d_end)
    })
    $("#dateStartField").on('input', () => {
        let d_start = new Date($('#dateStartField').val()) || 0,
            d_end   = new Date($('#dateEndField').val())   || Infinity
        
        if(d_start > d_end) {
            $('#badDatesWarning').html('A data final deve ser posterior à data inicial!')
        }else{
            $('#badDatesWarning').html('')
        }
        $('#btnSubmit').prop('disabled', d_start > d_end)
    })
    // Tratamento da querystring no envio do formulário
    $('form').submit((event) => {
        event.preventDefault()
        let emptyInputs = []
        $('form input').each((index, element) => {
            let input = $(element)
            emptyInputs.push(input)
            if($.trim(input.val()) === ''){
                input.prop('disabled',true)
            }
        })
        event.target.submit()
        emptyInputs.forEach(input => input.prop('disabled', false))
    })
})

// Não podemos selecionar datas além da data de hoje.
$("#dateEndField").attr("max", today);
$("#dateStartField").attr("max", today);

function data_final_show(){
    $('#dateStartField').prop('required',true)
    $('#dateEndField').prop('required',true)
    $("#dateFieldStart").html("Data de início:")
    $("#dateEndDiv").css("display", "block")
}

function data_final_hide(){
    $('#dateEndField').val(today)
    $('#dateStartField').prop('required',false)
    $('#dateEndField').prop('required',false)
    $('#badDatesWarning').html('')
    $('#btnSubmit').prop('disabled', false)
    $("#dateFieldStart").html("Data do acórdão:")
    $("#dateEndDiv").css("display", "none")
}