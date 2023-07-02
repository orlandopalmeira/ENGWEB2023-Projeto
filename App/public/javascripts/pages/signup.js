$(document).ready(function(){

    // Toggling visibility of passsword
    $('.pw-hide').click(() => {
        $('.pw-hide').toggleClass("fa-eye-slash")
        $('.pw-hide').toggleClass("fa-eye")
        toggle_visibilty()
    });

    $('#formSubmit').click((event) => {
        event.preventDefault();
        let formData = {}
        new URLSearchParams($('#login-form').serialize()).forEach((value, key) => formData[key] = value) // constrói um JSON para enviarmos o pedido (o serialize mete os dados do formulário numa query string e isto serve para a transformar num objecto)

        $.ajax({
            url: '/signup',
            method: 'POST',
            data: formData,
            'success': (response) => {
                $("#modal").modal({
                    escapeClose: false,
                    clickClose: false,
                    showClose: false
                });

                setTimeout(() => {
                    window.location.href = "/home";
                }, 2500); // 2500 milissegundos = 2.5 seconds
            },
            statusCode: {
                512: function (resp) {
                    let warning = resp.responseJSON.warning
                    $('#warning').stop(false,true);
                    $('#warning').html("<p>Aviso: " + warning + "</p>");
                    $('#warning').fadeIn(110).delay(100).fadeOut(4000);
                }
              }
        })
        
    })

})

// tudo o que tiver a class .password, vai ter estes atributos alternados, a cada clique de algo com a classe .pw-hide (que será um icone de eye)
function toggle_visibilty(){
    currentType = $('.password').attr('type');
    if (currentType == "password"){
        $('.password').attr('type', 'text');
    }
    else{
        $('.password').attr('type', 'password');
    }
}
