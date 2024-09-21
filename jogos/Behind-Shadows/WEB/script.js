const toggleButton = document.getElementById('buttonHide01');
const conteudo = document.getElementById('versions');

buttonHide01.addEventListener('click', () => {
    if (versions.style.display === "none") {
        versions.style.display = "block";
        buttonHide01.textContent = "Ocultar log de versões";
    } else {
        versions.style.display = "none";
        buttonHide01.textContent = "Mostrar log de versões";
    }
});

//sistema operacional 
/*
const button = document.querySelector('.download-button');
const buttonHover = document.querySelector('.hover-effect');
const logo = document.querySelector('.logo');
const buttonID = document.getElementById('downloadButton');

function detectarSistemaOperacional() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    if (/Win/i.test(userAgent)) {
        return "Windows";
    }

    if (/Mac/i.test(userAgent)) {
        return "MacOS";
    }

    if (/Linux/i.test(userAgent)) {
        return "Linux";
    }

    return "N";
}
var sistemaOperacional = detectarSistemaOperacional();
function atualizarSO() {
    console.log(sistemaOperacional);
    if(sistemaOperacional == "Android"){
        buttonID.textContent = "Baixar para Android";
    }
    if(sistemaOperacional == "Windows"){
        button.style.background = "linear-gradient(to right, #82bff0, #3d82dc)";
        //buttonHover.style.background = "linear-gradient(to right, #5d8aaf, #2966b6)";
        logo.src = "windows-logo.png";
        buttonID.textContent = "Baixar para Windows";
    }
}
if(sistemaOperacional == "Android"){
    button.addEventListener('mouseenter', () => {
        button.classList.add('hover-effect-android');
      });
      
      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover-effect-android');
      });
} else if(sistemaOperacional == "Windows"){
    button.addEventListener('mouseenter', () => {
        button.classList.add('hover-effect-windows');
      });
      
      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover-effect-windows');
      });
}

window.onload = function () {
    atualizarSO();
};
*/

//hide

function hide(elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        if (element.style.display === "none") {
            versions.style.display = "block";
        } else {
            element.style.display = "none";
        }
    } else {
        console.error("Elemento com ID " + elementId + " não encontrado.");
    }
}

//animação botão de download 



setInterval(() => {
    button.classList.toggle('glow');
}, 2000);


