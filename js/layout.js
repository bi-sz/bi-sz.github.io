window.onload = function() {
    // header 요소가 존재할 때만 loadHeader2 호출
    const headerElement = document.getElementById('header');
    if (headerElement) {
        loadHeader();
    }
    loadFooter();
    
    // header2 요소가 존재할 때만 loadHeader2 호출
    const header2Element = document.getElementById('header2');
    if (header2Element) {
        loadHeader2();
    }
}

function loadHeader() {
    fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    });
}

function loadFooter() {
    fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    });
}

function loadHeader2() {
    fetch('header2.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header2').innerHTML = data;
    });
}
