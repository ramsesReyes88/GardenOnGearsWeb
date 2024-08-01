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

$(document).ready(function() {
    var userToken = localStorage.getItem('userToken');
    if (userToken) {
        $.ajax({
            url: 'https://localhost:44313/api/Jardines/usuario/' + userToken,
            type: 'GET',
            success: function(jardinesResponse) {
                if (jardinesResponse && jardinesResponse.length > 0) {
                    var jardinesIds = jardinesResponse.map(jardin => jardin.id);
                    var jardin = jardinesResponse[0]; // Assuming the first garden is the relevant one

                    
                    jardinesResponse.forEach(function(jardin) {
                        $('#gardenSelect').append(new Option(jardin.nombre, jardin.id));
                        $('#updateJardinSelect').append(new Option(jardin.nombre, jardin.id));
                    });
                    $('#gardenName').text(jardin.nombre);
                    $('#gardenLocation').text(jardin.ubicacion);

                    $.ajax({
                        url: 'https://localhost:44313/api/Plantas/jardines',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(jardinesIds),
                        success: function(plantasResponse) {
                            if (plantasResponse && plantasResponse.length > 0) {
                                // Populate plant select dropdown
                                plantasResponse.forEach(function(planta) {
                                    $('#plantSelect').append(new Option(planta.nombre, planta.id));
                                    $('#updatePlantSelect').append(new Option(planta.nombre, planta.id));
                                });

                                var planta = plantasResponse[0]; // Display the first plant as an example
                                $('#plantName').text(planta.nombre);
                                $('#plantDescription').text(planta.descripcion);
                                $('#plantWatering').text(planta.cantRiegoRequerido + ' veces al Día');
                                $('#plantDate').text(new Date(planta.fechaPlantado).toLocaleDateString());

                                // Display image if exists
                                if (planta.foto) {
                                    $('#plantImage').attr('src', 'data:image/jpeg;base64,' + planta.foto);
                                }

                                // Set the plantId for the image upload
                                $('#uploadImageBtn').data('plant-id', planta.id);
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.error("Error al obtener información de las plantas:", jqXHR.responseText);
                            alert("Error al obtener información de las plantas: " + jqXHR.responseText);
                        }
                    });
                } else {
                    alert("No se encontró información de los jardines.");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al obtener información de los jardines:", jqXHR.responseText);
                alert("Error al obtener información de los jardines: " + jqXHR.responseText);
            }
        });
    } else {
        alert("Usuario no autenticado.");
        window.location.href = '../index.html';
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
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Error al subir la imagen:", jqXHR.responseText);
                    alert("Error al subir la imagen: " + jqXHR.responseText);
                }
            });
        } else {
            alert("No se ha seleccionado una imagen o la planta no está definida.");
        }
    });

    $('#plantSelect').change(function() {
        var plantId = $(this).val();
        $.ajax({
            url: 'https://localhost:44313/api/Plantas/' + plantId,
            type: 'GET',
            success: function(planta) {
                $('#plantName').text(planta.nombre);
                $('#plantDescription').text(planta.descripcion);
                $('#plantWatering').text(planta.cantRiegoRequerido + ' veces al Día');
                $('#plantDate').text(new Date(planta.fechaPlantado).toLocaleDateString());

                // Display image if exists
                if (planta.foto) {
                    $('#plantImage').attr('src', 'data:image/jpeg;base64,' + planta.foto);
                } else {
                    $('#plantImage').attr('src', '');
                }

                // Set the plantId for the image upload
                $('#uploadImageBtn').data('plant-id', planta.id);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al obtener información de la planta:", jqXHR.responseText);
                alert("Error al obtener información de la planta: " + jqXHR.responseText);
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
                alert("Planta agregada correctamente");
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al agregar la planta:", jqXHR.responseText);
                alert("Error al agregar la planta: " + jqXHR.responseText);
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
                alert("Jardin agregado correctamente");
                location.reload();
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

    $('#updatePlantForm').submit(function(event) {
        event.preventDefault();

        var plantId = $('#updatePlantSelect').val();
        var jardinId = $('#gardenSelect').val(); 
        var updatedPlant = {
            id: plantId,
            nombre: $('#updatePlantName').val(),
            descripcion: $('#updatePlantDescription').val(),
            fechaPlantado: $('#updatePlantDate').val(),
            jardin: jardinId 
        };

        $.ajax({
            url: 'https://localhost:44313/api/Plantas/' + plantId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedPlant),
            success: function(response) {
                alert("Planta actualizada correctamente");
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al actualizar la planta:", jqXHR.responseText);
                alert("Error al actualizar la planta: " + jqXHR.responseText);
            }
        });
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
        var userId = localStorage.getItem('userToken'); // Clave foránea propietario
        var updatedJardin = {
            id: jardinId,
            nombre: $('#updateJardinName').val(),
            ubicacion: $('#updateJardinUbicacion').val(),
            propietario: userId // Incluyendo la clave foránea propietario
        };

        $.ajax({
            url: 'https://localhost:44313/api/Jardines/' + jardinId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedJardin),
            success: function(response) {
                alert("Jardin actualizado correctamente");
                location.reload();
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
    alert("Sesión cerrada correctamente");
    window.location.href = '../index.html';
}
