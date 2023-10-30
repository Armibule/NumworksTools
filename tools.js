const leftButton = document.getElementById("toolsCarouselLeft")
const rightButton = document.getElementById("toolsCarouselRight")
const carouselElements = document.getElementById("toolsCarouselElements")


leftButton.onclick = function() {
    carouselElements.scrollBy(-window.innerWidth/10, 0)
}
rightButton.onclick = function() {
    carouselElements.scrollBy(window.innerWidth/10, 0)
}