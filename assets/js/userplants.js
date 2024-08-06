function showCustomAlertCheck(message) {
    var modal = document.getElementById("customAlertCheck");
    var messageElement = document.getElementById("alertMessageCheck");
    messageElement.textContent = message;
    modal.style.display = "flex";
}

// Muestra una alerta personalizada
function showCustomAlert(message) {
    var modal = document.getElementById("customAlert");
    var messageElement = document.getElementById("alertMessage");
    messageElement.textContent = message;
    modal.style.display = "flex";
}

// Cierra la alerta personalizada
function closeCustomAlert() {
    var modal = document.getElementById("customAlert");
    modal.style.display = "none";
}

// Alterna el menú desplegable
function toggleDropdown() {
    document.getElementById("dropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.hamburger-menu, .hamburger-menu *')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Previsualiza la imagen seleccionada
function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var output = document.getElementById('plantImage');
        output.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}

$(document).ready(function() {
    var userToken = localStorage.getItem('userToken');
    var jardinesMap = {}; // Mapa para almacenar los jardines con su ID como clave

    if (userToken) {
        // Obtener jardines del usuario
        $.ajax({
            url: 'https://localhost:44313/api/Jardines/usuario/' + userToken,
            type: 'GET',
            success: function(jardinesResponse) {
                if (jardinesResponse && jardinesResponse.length > 0) {
                    // Poblar mapa de jardines
                    jardinesResponse.forEach(function(jardin) {
                        jardinesMap[jardin.id] = jardin;
                        $('#gardenSelect').append(new Option(jardin.nombre, jardin.id));
                        $('#updatePlantGardenSelect').append(new Option(jardin.nombre, jardin.id));
                        $('#updateJardinSelect').append(new Option(jardin.nombre, jardin.id));
                    });

                    // Obtener plantas asociadas a los jardines
                    obtenerPlantas(jardinesResponse.map(jardin => jardin.id));
                } else {
                    showCustomAlert("No se encontró información de los jardines.");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al obtener información de los jardines:", jqXHR.responseText);
                showCustomAlert("Error al obtener información de los jardines: " + jqXHR.responseText);
            }
        });
    } else {
        showCustomAlert("Usuario no autenticado.");
        window.location.href = '../index.html';
    }

    function obtenerPlantas(jardinesIds) {
        $.ajax({
            url: 'https://localhost:44313/api/Plantas/jardines',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(jardinesIds),
            success: function(plantasResponse) {
                if (plantasResponse && plantasResponse.length > 0) {
                    plantasResponse.forEach(function(planta) {
                        $('#plantSelect').append(new Option(planta.nombre, planta.id));
                        $('#updatePlantSelect').append(new Option(planta.nombre, planta.id));
                    });

                    // Cargar datos de la primera planta como ejemplo
                    cargarDatosPlanta(plantasResponse[0].id);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al obtener información de las plantas:", jqXHR.responseText);
                showCustomAlert("Error al obtener información de las plantas: " + jqXHR.responseText);
            }
        });
    }

    $('#plantSelect').change(function() {
        var plantId = $(this).val();
        cargarDatosPlanta(plantId);
    });

    function cargarDatosPlanta(plantId) {
        if (plantId) {
            $.ajax({
                url: 'https://localhost:44313/api/Plantas/' + plantId,
                type: 'GET',
                success: function(planta) {
                    $('#plantName').text(planta.nombre);
                    $('#plantDescription').text(planta.descripcion);
                    $('#plantDate').text(new Date(planta.fechaPlantado).toLocaleDateString());

                    // Usa jardinesMap para obtener el jardín correcto
                    if (planta.jardin && jardinesMap[planta.jardin]) {
                        $('#gardenName').text(jardinesMap[planta.jardin].nombre);
                        $('#gardenLocation').text(jardinesMap[planta.jardin].ubicacion);
                    } else {
                        $('#gardenName').text('');
                        $('#gardenLocation').text('');
                    }

                    if (planta.foto) {
                        $('#plantImage').attr('src', 'data:image/jpeg;base64,' + planta.foto);
                    } else {
                        $('#plantImage').attr('src', '../assets/img/white.jpg');
                    }

                    // Prellenar el formulario de actualización
                    $('#updatePlantName').val(planta.nombre);
                    $('#updatePlantDescription').val(planta.descripcion);
                    $('#updatePlantDate').val(new Date(planta.fechaPlantado).toISOString().substring(0, 10));
                    $('#updatePlantGardenSelect').val(planta.jardin);
                    $('#updatePlantPhoto').val(planta.foto ? planta.foto : '');

                    // Set the plantId for the image upload
                    $('#uploadImageBtn').data('plant-id', planta.id);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Error al obtener información de la planta:", jqXHR.responseText);
                    showCustomAlert("Error al obtener información de la planta: " + jqXHR.responseText);
                }
            });
        } else {
            showCustomAlert("No se seleccionó ninguna planta.");
        }
    }
    
    $('#uploadImageBtn').click(function() {
        var fileInput = $('#plantImageUpload')[0];
        var plantId = $(this).data('plant-id');
        if (fileInput.files.length > 0 && plantId) {
            var file = fileInput.files[0];
            var formData = new FormData();
            formData.append('image', file);
            formData.append('plantId', plantId);

            $.ajax({
                url: 'https://localhost:44313/api/Plantas/uploadImage',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {
                    alert("Imagen subida correctamente");
                    $('#plantImage').attr('src', 'data:image/jpeg;base64,' + response.image);
                    $('#updatePlantPhoto').val(response.image);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Error al subir la imagen:", jqXHR.responseText);
                    showCustomAlert("Error al subir la imagen: " + jqXHR.responseText);
                }
            });
        } else {
            showCustomAlert("No se ha seleccionado una imagen o la planta no está definida.");
        }
    });

    $('#updatePlantSelect').change(function() {
        var plantId = $(this).val();
        cargarDatosPlanta(plantId);
    });

    $('#updatePlantForm').submit(function(event) {
        event.preventDefault();

        var plantId = $('#updatePlantSelect').val();
        var updatedPlant = {
            id: plantId,
            nombre: $('#updatePlantName').val(),
            descripcion: $('#updatePlantDescription').val(),
            fechaPlantado: $('#updatePlantDate').val(),
            jardin: $('#updatePlantGardenSelect').val(),
            foto: $('#updatePlantPhoto').val() // Asegura que el campo de la foto esté incluido
        };

        $.ajax({
            url: 'https://localhost:44313/api/Plantas/' + plantId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedPlant),
            success: function(response) {
                showCustomAlertCheck("Planta actualizada correctamente");
                $('#darkOverlay').hide();
                $('#updatePlantFormPopup').hide();
                setTimeout(function() {
                    location.reload();
                }, 1500);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al actualizar la planta:", jqXHR.responseText);
                showCustomAlert("Error al actualizar la planta: " + jqXHR.responseText);
            }
        });
    });

    $('#updateJardinSelect').change(function() {
        var jardinId = $(this).val();
        $.ajax({
            url: 'https://localhost:44313/api/Jardines/' + jardinId,
            type: 'GET',
            success: function(jardin) {
                $('#updateJardinName').val(jardin.nombre);
                $('#updateJardinUbicacion').val(jardin.ubicacion);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al obtener información del jardin:", jqXHR.responseText);
                showCustomAlert("Error al obtener información del jardin: " + jqXHR.responseText);
            }
        });
    });

    $('#openFormButton').click(function() {
        $('#darkOverlay').show();
        $('#addPlantFormPopup').show();
    });

    $('#closeFormButton').click(function() {
        $('#darkOverlay').hide();
        $('#addPlantFormPopup').hide();
    });

    $('#addPlantForm').submit(function(event) {
        event.preventDefault();

        var newPlant = {
            nombre: $('#newPlantName').val(),
            descripcion: $('#newPlantDescription').val(),
            cantRiegoRequerido: Math.floor(Math.random() * 3) + 1,
            fechaPlantado: $('#newPlantDate').val(),
            jardin: $('#gardenSelect').val()
        };

        $.ajax({
            url: 'https://localhost:44313/api/Plantas',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newPlant),
            success: function(response) {
                showCustomAlertCheck("Planta agregada correctamente");
                $('#darkOverlay').hide();
                $('#addPlantFormPopup').hide();
                setTimeout(function() {
                    location.reload();
                }, 1500);
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al agregar la planta:", jqXHR.responseText);
                showCustomAlert("Error al agregar la planta: " + jqXHR.responseText);
            }
        });
    });

    $('#openJardinFormButton').click(function() {
        $('#darkOverlay').show();
        $('#addJardinFormPopup').show();
    });

    $('#closeJardinFormButton').click(function() {
        $('#darkOverlay').hide();
        $('#addJardinFormPopup').hide();
    });

    $('#addJardinForm').submit(function(event) {
        event.preventDefault();
        var userId = localStorage.getItem('userToken');

        var newJardin = {
            nombre: $('#newJardinName').val(),
            ubicacion: $('#ubicacionJardin').val(),
            propietario: userId
            
        };

        $.ajax({
            url: 'https://localhost:44313/api/Jardines',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newJardin),
            success: function(response) {
                showCustomAlertCheck("Jardin agregado correctamente");
                $('#darkOverlay').hide();
                $('#addJardinFormPopup').hide();
                setTimeout(function() {
                    location.reload();
                }, 1500);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al agregar el Jardin:", jqXHR.responseText);
                alert("Error al agregar el Jardin: " + jqXHR.responseText);
            }
        });
    });

    $('#updatePlantButton').click(function() {
        $('#darkOverlay').show();
        $('#updatePlantFormPopup').show();
    });

    $('#closeUpdatePlantFormButton').click(function() {
        $('#darkOverlay').hide();
        $('#updatePlantFormPopup').hide();
    });

    $('#updateJardinButton').click(function() {
        $('#darkOverlay').show();
        $('#updateJardinFormPopup').show();
    });

    $('#closeUpdateJardinFormButton').click(function() {
        $('#darkOverlay').hide();
        $('#updateJardinFormPopup').hide();
    });

    $('#updateJardinForm').submit(function(event) {
        event.preventDefault();

        var jardinId = $('#updateJardinSelect').val();
        var updatedJardin = {
            id:jardinId,
            nombre: $('#updateJardinName').val(),
            ubicacion: $('#updateJardinUbicacion').val(),
            propietario: userToken
        };

        $.ajax({
            url: 'https://localhost:44313/api/Jardines/' + jardinId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedJardin),
            success: function(response) {
                showCustomAlertCheck("Jardin actualizado correctamente");
                $('#darkOverlay').hide();
                $('#updateJardinFormPopup').hide();
                setTimeout(function() {
                    location.reload();
                }, 1500);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al actualizar el jardin:", jqXHR.responseText);
                alert("Error al actualizar el jardin: " + jqXHR.responseText);
            }
        });
    });
});

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('nombreUsuario');
    showCustomAlertCheck("Sesión cerrada correctamente");
    setTimeout(function() {
        window.location.href = '../index';
    }, 1500);
}
