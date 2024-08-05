function showCustomAlertCheck(message) {
    var modal = document.getElementById("customAlertCheck");
    var messageElement = document.getElementById("alertMessageCheck");
    messageElement.textContent = message;
    modal.style.display = "flex";
}

// Shows alert with X
function showCustomAlert(message) {
    var modal = document.getElementById("customAlert");
    var messageElement = document.getElementById("alertMessage");
    messageElement.textContent = message;
    modal.style.display = "flex";
}

// Closes custom alert with x
function closeCustomAlert() {
    var modal = document.getElementById("customAlert");
    modal.style.display = "none";
}

$(document).ready(function () {
var cart = JSON.parse(localStorage.getItem('cart')) || [];
var cartItems = $('#cart-items');
var subtotalPrice = 0;
var itemCounts = {};

// Contar items
cart.forEach(function (item) {
if (itemCounts[item.id]) {
    itemCounts[item.id].count++;
    itemCounts[item.id].price += parseFloat(item.price);
} else {
    itemCounts[item.id] = {
        count: 1,
        price: parseFloat(item.price),
        image: item.image,
        name: item.name,
        id: item.id,
    };
}
});

// Mostrar items
$.each(itemCounts, function (id, item) {
var itemHtml = `
    <div class="cart-item d-flex justify-content-between align-items-center mb-4">
        <div class="col-img">
            <img src="${item.image}" class="img-fluid rounded-3 cart-item-img" alt="${item.name}">
        </div>
        <div class="col-description">
            <h6 class="text-muted">${item.name}</h6>
            <h6 class="mb-0">Cantidad: ${item.count}</h6>
        </div>
        <div class="col-price">
            <h6 class="mb-0">MXN ${item.price.toFixed(2)}</h6>
        </div>
        <div class="col-remove text-end">
            <a href="#!" class="text-muted remove-item" data-id="${id}"><i class="fas fa-times"></i></a>
        </div>
    </div>
    <hr class="my-4">
`;
cartItems.append(itemHtml);
subtotalPrice += item.price;
});

var iva = subtotalPrice * 0.16;
var totalPrice = subtotalPrice + iva;

$('#subtotal-price').text('$ ' + subtotalPrice.toFixed(2));
$('#iva-price').text('$ ' + iva.toFixed(2));
$('#total-price').text('$ ' + totalPrice.toFixed(2));

// Remover item individual
$(document).on('click', '.remove-item', function (e) {
e.preventDefault();
var id = $(this).data('id');
cart = cart.filter(function (item) {
    return item.id != id;
});
localStorage.setItem('cart', JSON.stringify(cart));
location.reload();
});

// Vaciar carrito
$('#clear-cart').click(function () {
localStorage.removeItem('cart');
location.reload();
});

// Stripe Checkout
$('#checkout-button').click(async function () {
try {
    const enrichedCart = cart.map(item => ({
        id: item.id,
        imagen: item.image,
        nombre: item.name,
        descripcion: item.description || "Descripción del producto",
        precio: parseFloat(item.price),
    }));

    const response = await fetch('https://localhost:44313/api/Productos/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'usuarioId': localStorage.getItem('userToken')
        },
        body: JSON.stringify(enrichedCart),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Network response was not ok: ${response.statusText}. ${errorMessage}`);
    }

    const data = await response.json();
    const { sessionId } = data;

    if (!sessionId) {
        throw new Error('Missing sessionId in response');
    }

    // Limpiar carrito antes de redirigir a Stripe Checkout
    localStorage.removeItem('cart');

    // Redirigir a Stripe Checkout
    const stripe = Stripe('pk_test_51Pge8rKAWfsMXDlMM57hyaruxC8lWXVj2jZxvE65x6OTZ5TINiNp9t7B0xTxgWOpSuIKXDYG90hKWSB13RRgWIK400oY0TkvyZ');
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
        console.error('Stripe error:', error);
    }
} catch (error) {
    console.error('Checkout error:', error);
}
});
});

// Logout
function logout() {
localStorage.removeItem('userToken');
localStorage.removeItem('nombreUsuario');
alert("Sesión cerrada correctamente");
window.location.href = './index.html';
}