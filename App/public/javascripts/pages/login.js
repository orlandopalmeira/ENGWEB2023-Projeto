$(document).ready(function(){
    $('#warning').fadeOut(4000);

    // Toggling visibility of passsword
    $('.pw-hide').click(() => {
        $('.pw-hide').toggleClass("fa-eye-slash")
        $('.pw-hide').toggleClass("fa-eye")
        toggle_visibilty()
    });
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
