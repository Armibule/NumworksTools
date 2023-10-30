const loadImageButton = document.getElementById("loadImageButton")
const loadedImage = document.getElementById("loadedImage")
const loadImagePopup = document.querySelector(".loadImagePopup")

const uploadImageButton = document.getElementById("uploadImage")

const fileInput = document.createElement("input")
fileInput.type = "file"
fileInput.accept = "image/*"


const imageCanvas = document.createElement("canvas")
const imageCanvasCtx = imageCanvas.getContext("2d")


function openloadImagePopup() {
    loadImagePopup.classList.add("openedLoadImagePopup")
}
function closeloadImagePopup() {
    loadImagePopup.classList.remove("openedLoadImagePopup")
}

loadImageButton.onclick = openloadImagePopup

uploadImageButton.onclick = function() {
    fileInput.click()
}
fileInput.onchange = function(e) {
    var reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])

    console.log(e.target.files[0])
    
    reader.onload = readerEvent => {
       var content = readerEvent.target.result
       loadedImage.src = content

       loadedImage.onload = function() {
           imageCanvas.width = loadedImage.naturalWidth;
           imageCanvas.height = loadedImage.naturalHeight;
           
           imageCanvasCtx.drawImage(loadedImage, 0, 0)
           
        document.body.appendChild(imageCanvas)
       }

       
    }

   closeloadImagePopup()
}