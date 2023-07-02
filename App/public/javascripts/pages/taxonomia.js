$(document).ready(function () {
    let alfabeto = $('#alfabeto');
    // Para permitir que as letras fiquem sempre visíveis evitando obrigar o utilizador a ir para o topo da página.
    $(window).on('scroll', function () {
        if ($(window).scrollTop() >= $('#header').height()) {
            alfabeto.attr('style', 'position:fixed; top: 0');
        } else {
            alfabeto.attr('style', '');
        }
    });

    $('#toTop').click((event) => {
        $("html, body").animate({
            scrollTop: 0
        }, "slow");
    })

})

function goto(letra) {
    var targetElement = document.getElementById(letra);
    if (targetElement) {
        var targetOffsetTop = targetElement.offsetTop - 2 * alfabeto.offsetHeight;

        window.scrollTo({
            top: targetOffsetTop,
            behavior: "smooth"
        });
    }
}

function toggleAccordion(id) {
    let x = $("#" + id);
    let icon = $('#icon' + id)
    if (!x.hasClass("w3-show")) {
        icon.removeClass('fa-chevron-right')
        icon.addClass('fa-angle-down')
        x.addClass("w3-show");
    } else {
        icon.removeClass('fa-angle-down')
        icon.addClass('fa-chevron-right')
        x.removeClass("w3-show");
    }
}
