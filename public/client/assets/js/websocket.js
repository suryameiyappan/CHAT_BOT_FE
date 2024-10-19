const searchParams = new URLSearchParams(window.location.search);
let quoteId = searchParams.get('quoteId');
const socket = new WebSocket('ws://localhost:6009?quoteid='+quoteId);

socket.addEventListener('open', function (event) {
    console.log('WebSocket connection established.');
    setInterval(() => {
        socket.send(JSON.stringify({ quoteId: quoteId }));
    }, 3000);
});

socket.addEventListener('message', function (event) {
    let content = document.getElementById('content')
    if (event.data == 'abort') {
        swal({
            text: "The quote id is already using",
            icon: "warning",
            buttons: false,
            dangerMode: true,
            closeOnClickOutside: false,
            closeOnEsc: false
        });
        content.innerHTML = "The quote id is already using";
    }
    if (event.data == 'continue') {
        swal.close();
        content.innerHTML = "The quote id is now available";
    }
});

socket.addEventListener('close', function (event) {
    socket.send(JSON.stringify({quoteId: quoteId}));
    console.log('WebSocket connection closed.');
});