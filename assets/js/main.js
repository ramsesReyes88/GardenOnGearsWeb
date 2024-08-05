function showCustomAlert(message) {
    var modal = document.getElementById("customAlert");
    var messageElement = document.getElementById("alertMessage");
    messageElement.textContent = message;
    modal.style.display = "flex";
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('cart');
    showCustomAlert("Sesión cerrada correctamente");
    setTimeout(function() {
        window.location.href = './index.html';
    }, 2000); 
}

$(document).ready(function() {
    var userName = localStorage.getItem('nombreUsuario');
    var userToken = localStorage.getItem('userToken');
    if (userName && userToken) {
        $("#join-banner").hide();
        $("#infobanner1, #infobanner2").hide();
        $("#linkPlantas, #linkPerfil, #linkLogout, #linkCarrito").removeClass('hidden');
        $("#welcome-banner").removeClass('hidden');
        $("#userName").text(userName);

       
        $.ajax({
            url: 'https://localhost:44313/api/Usuarios/' + userToken,
            type: 'GET',
            success: function(response) {
                var userImage;

                if (response.foto) {
                    userImage = 'data:image/png;base64,' + response.foto;
                } else {
                    userImage = "assets/img/noPic.png";
                }

                $("#userImage").attr('src', userImage);
            }
        });
    } else {
        $("#linkPlantas, #linkPerfil, #linkLogout, #linkCarrito").addClass('hidden');
    }
});