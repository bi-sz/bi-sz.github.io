window.onload = function() {
    loadHeader();
    loadFooter();
}

function loadHeader() {
    fetch('templates/fragments/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    });
}

function loadFooter() {
    fetch('templates/fragments/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    });
}
