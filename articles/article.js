

var buttonToTop = document.querySelector(".articleToTop")
buttonToTop.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}