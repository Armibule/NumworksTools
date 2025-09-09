const loadImageButton = document.getElementById("loadImageButton")
const imageLink = document.getElementById("imageLink")
const imageLinkInput = document.getElementById("imageLinkInput");

const loadedImage = document.getElementById("loadedImage")
const loadImagePopup = document.querySelector(".loadImagePopup")

const uploadImageButton = document.getElementById("uploadImage")

const imageCanvas = document.getElementById("previewCanvas")
const imageCanvasCtx = imageCanvas.getContext("2d")
imageCanvas.width = 100
imageCanvas.height = 100


const copyCodeButton = document.getElementById("copyCodeButton")
const decoderLinkButton = document.getElementById("decoderLinkButton")
const numworksLinkButton = document.getElementById("numworksLinkButton")
const helpLinkButton = document.getElementById("helpLinkButton")

const connectButton = document.getElementById("connectButton")
const transferButton = document.getElementById("transferButton")


// result fields
const resultStorage = document.getElementById("resultStorage")
const resultWidth = document.getElementById("resultWidth")
const resultHeight = document.getElementById("resultHeight")

// inputting files
const fileInput = document.createElement("input")
fileInput.type = "file"
fileInput.accept = "image/*"

var code = "";

// Setup parameters and listeners
// 1 is not possible
var scale = 2;

// in bits, minimum is 2, max is 8
var colorFoldPower = 5;
var colorFold = 2**colorFoldPower;

const MODE_COLOR = "colors";
const MODE_GRAYSCALE = "grayscale";
const MODE_BLACKWHITE = "blackwhite";
var imageMode = MODE_COLOR;

const resolutionInput = document.getElementById("resolutionInput");
const colorsInput = document.getElementById("colorsInput");
const imageModeInput = document.getElementById("imageMode");
resolutionInput.oninput = () => {
    scale = 6 - resolutionInput.value;
    if (code.length > 0) {
        updateImage();
    }
}
colorsInput.oninput = () => {
    colorFoldPower = 7-colorsInput.value;
    colorFold = 2**colorFoldPower;
    if (code.length > 0) {
        updateImage();
    }
}
imageModeInput.oninput = () => {
    imageMode = imageModeInput.value;
    if (code.length > 0) {
        updateImage();
    }
}
resolutionInput.oninput()
colorsInput.oninput()
imageModeInput.oninput()


function openloadImagePopup() {
    loadImagePopup.classList.add("openedLoadImagePopup")
    uploadImageButton.style.display = "inherit"
    imageLink.style.display = "inherit"
    imageLinkInput.style.display = "none"
}
function closeloadImagePopup() {
    loadImagePopup.classList.remove("openedLoadImagePopup")
}

loadImageButton.onclick = openloadImagePopup
document.addEventListener("click", (event) => {
    if (event.target == loadImagePopup) {
        // is the background of the popup
        closeloadImagePopup()
    }
})

uploadImageButton.onclick = function() {
    fileInput.click()
}
imageLink.onclick = function() {
    uploadImageButton.style.display = "none"
    imageLink.style.display = "none"
    imageLinkInput.style.display = "block"
}


function animateButton(btn) {
    btn.style.animation = "copyButton 1s ease-out"
    setTimeout(() => {
        btn.style.animation = ""
    }, 1100)
}
copyCodeButton.onclick = function() {
    navigator.clipboard.writeText(code)
    animateButton(copyCodeButton)
}
transferButton.onclick = async function() {
    if (fileInput.files.length == 0) {
        return;
    }

    imageName = fileInput.files[0].name;
    filename = "";
    for (let i = 0 ; i < imageName.length ; i++) {
        let l = imageName[i];
        if (l == ".") {
            break;
        } else {
            filename += l;
        }
    }
    filename += ".py"
    
    console.log("Transfer : ", filename)
    

    var storage = await calculator.backupStorage();

    console.log(storage)
    storage.records.push({"name": "test", "type": "py", "autoImport": true/*, position: 0*/, "code": "print('Hello World!')\n"});
    console.log(storage)
    await calculator.installStorage(storage, function() {
        console.log("Transfer réussi")
        animateButton(transferButton);
    });
}


function setPixel(x, y, color) {
    imageCanvasCtx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
    imageCanvasCtx.fillRect(x, y, 1, 1)
}


function foldValue(value) {
    // return Math.round(value/colorFold)*colorFold
    return Math.round(value / colorFold);
}
function unfoldValue(value) {
    return value * colorFold;
}
var transparencyColor = [255, 255, 255];
function getRGB(data, width, x, y, isGrayscale, blackWhite) {
    var index = (y*width + x)*4;

    if (data[index+3] == 0) {
        return [foldValue(transparencyColor[0]), foldValue(transparencyColor[1]), foldValue(transparencyColor[2])]
    }

    let r = data[index];
    let g = data[index+1];
    let b = data[index+2];

    if (isGrayscale) {
        let l = foldValue(parseInt(r*.299 + g*.587 + b*.114));
        return [l, l, l];
    } else if (blackWhite) {
        index = (y*width + (x+1))*4;
        let r2 = data[index];
        let g2 = data[index+1];
        let b2 = data[index+2];
        index = ((y+1)*width + x)*4;
        let r3 = data[index];
        let g3 = data[index+1];
        let b3 = data[index+2];
        if (r + g + b > (r2 + g2 + b2 + r3 + g3 + b3 + 127)/2.3) {
            return [foldValue(255), foldValue(255), foldValue(255)]
        } else {
            return [foldValue(0), foldValue(0), foldValue(0)]
        }
    } else {
        return [foldValue(r), foldValue(g), foldValue(b)];
    }
}
function RGBToNumber(color) {
    return color[0]*65_025 + color[1]*255 + color[2]
}

// not fully implemented
/*function pixelsToCode(data, width, height) {
    result = "data="

    for (y=0 ; y<height ; y++) {
        result += "("
        for (x=0 ; x<width ; x++) {
            var color = getRGB(data, width, x, y, isGreyScale)

            result += `(${color[0]},${color[1]},${color[2]}),`
        }
        result += "),"
    }
    console.log(result.length)
    return result
}*/


//const indexesLabels = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,;:!/*-+.-_={}[]()<>@$&%^|\"áâäéêëíîïñśóõöúûüÿ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼┤ÁÂÀ©╣║↕7╝¢¥┐└┴┬├─┼Ã╚ÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒ"
const indexesLabels = `{zEDGFA@CBMLONIHKJUTWVQPSR]_^YX[Z%̈$'&! #"-,/.̄)(+*=<?>;:
    ¢¡®­¬«©±°§¦¥¤£edgfa\`cbmlonihkjutwvqpsr}\|~yx`

    /*# s="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,;:!/*-+._={}[]()<>@$&%^|\"☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕¶§▬↨↑↓→←∟↔▲▼┤©╣║╝¢¥┐└┴┬├─┼╚ı┘┌█▄¦▀ß"
s="".join([chr(i) for i in range(256)])
s="""¡¢£¤¥¦§̈©«¬­®̄°±%$'&! #"-,/.)(+*54761032=<?>98;:
edgfa`cbmlonihkjutwvqpsr}|~yx{zEDGFA@CBMLONIHKJUTWVQPSR]\_^YX[Z"""*/

function pixelsToCodeIndexed(data, width, height, partitionLength) {
    if (indexesLabels.length < partitionLength || partitionLength <= 0) {
        throw Exception(`Bad partitionLength value: ${partitionLength}`)
    }

    let isGrayscale;
    if (imageMode == MODE_GRAYSCALE) {
        isGrayscale = true;
    } else {
        isGrayscale = false;
    }
    let isBlackwhite;
    if (imageMode == MODE_BLACKWHITE) {
        isBlackwhite = true;
    } else {
        isBlackwhite = false;
    }

    const indexed = {} // colorKey : [color, label]
    var indexedCount = 0

    function colorToKey(col) {
        return `${col[0]},${col[1]},${col[2]}`
    }
    
    for (y=0 ; y<height ; y++) {
        for (x=0 ; x<width ; x++) {
            color = getRGB(data, width, x, y, isGrayscale, isBlackwhite)
            key = colorToKey(color)
            if (!(key in indexed)) {
                // console.log(color[0]*colorFold, color[1]*colorFold, color[2]*colorFold)

                indexed[key] = [color, indexesLabels[indexedCount]] // TODO: chose most important colors
                indexedCount += 1
                if (indexedCount >= partitionLength) {
                    break
                }
            }
        }
        if (indexedCount >= partitionLength) {
            break
        }
    }

    // console.log(indexed)
    console.log(indexedCount)

    var pixels = "";
    var label = "";
    var lastLabel = "";
    var repetitionCount = 0;
    var color;
    for (y=0 ; y<height ; y++) {
        for (x=0 ; x<width ; x++) {
            color = getRGB(data, width, x, y, isGrayscale, isBlackwhite)

            values = indexed[colorToKey(color)]

            if (values == undefined) {
                [color, label] = Object.values(indexed)[0] // TODO: implement a way to use the more appropriate color
            } else {
                label = values[1]
            }

            // emulate drawing
            setPixel(x, y, [unfoldValue(color[0]), unfoldValue(color[1]), unfoldValue(color[2])])

            if (lastLabel == label) {
                repetitionCount += 1
            } else {
                if (repetitionCount > 1) {
                    pixels += repetitionCount
                }
                pixels += lastLabel

                lastLabel = label
                repetitionCount = 1
            }
        }
    }

    var colors = ""
    Object.keys(indexed).forEach((key) => {
        colors += `${RGBToNumber(indexed[key][0])},`
    })

    var result = `from imgdraw_opti import *\np=prs(${colorFoldPower},"""${indexesLabels.slice(0, indexedCount)}""",(${colors}))\ndr(p,${width},${height},"""${pixels}""",${scale})`

    console.log(result.length)
    return result
}

function updateImage() {
    const maxWidth = 320/scale
    const maxHeight = 220/scale

    width = loadedImage.naturalWidth
    height = loadedImage.naturalHeight

    if (width > maxWidth) {
        height *= maxWidth/width
        width = maxWidth
    }
    if (height > maxHeight) {
        width *= maxHeight/height
        height = maxHeight
    }
    width = Math.round(width)
    height = Math.round(height)

    imageCanvas.width = width
    imageCanvas.height = height

    imageCanvasCtx.imageSmoothingEnabled = false

    imageCanvasCtx.drawImage(loadedImage, 0, 0, loadedImage.naturalWidth, loadedImage.naturalHeight, 0, 0, width, height)
    var data = imageCanvasCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height).data
    code = pixelsToCodeIndexed(data, imageCanvas.width, imageCanvas.height, indexesLabels.length)

    var codeLength = code.length

    if (codeLength < 1000) {
        resultStorage.innerText = `${codeLength} octets`
    } else {
        resultStorage.innerText = `${Math.round(codeLength/10)/100} Ko`

        if (codeLength > 12000) {
            resultStorage.innerText += " ⚠"
        }
    }

    resultStorage.classList.remove("resultStorageSmall")
    resultStorage.classList.remove("resultStorageMedium")
    resultStorage.classList.remove("resultStorageBig")
    if (codeLength < 4000) {
        resultStorage.classList.add("resultStorageSmall")
    } else if (codeLength < 8000) {
        resultStorage.classList.add("resultStorageMedium")
    } else {
        resultStorage.classList.add("resultStorageBig")
    }

    resultWidth.innerText = width
    resultHeight.innerText = height
}

fileInput.onchange = function(e) {
    var reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])

    console.log(e.target.files[0])
    
    reader.onload = readerEvent => {
       var content = readerEvent.target.result
       loadedImage.src = content

       loadedImage.onload = function() {
            updateImage();
       }
    }

   closeloadImagePopup()
}
imageLinkInput.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        loadedImage.src = imageLinkInput.value

        loadedImage.onload = function() {
            updateImage();
        }
        loadedImage.onerror = function() {
            console.log("Image failed to load...")
        }
        closeloadImagePopup()
    }
})


// Connexion to the calculator

var calculator = new Numworks();

function onCalculatorConnected() {
    console.log("Numworks Connected");

    transferButton.disabled = false;
    connectButton.disabled = true;
}

function setupCalculator() {
    transferButton.disabled = true;
    connectButton.disabled = false;

    navigator.usb.addEventListener("disconnect", function(e) {
        calculator.onUnexpectedDisconnect(e, function() {
            console.log("Numworks Disconnected");
            transferButton.disabled = true;
            connectButton.disabled = false;
        });
    });
}

// TODO : NOT SUPPORTED YET
if (/*navigator.usb*/ false) {
    setupCalculator();

    // Show the buttons
    connectButton.hidden = false;
    transferButton.hidden = false;

    connectButton.addEventListener("click", () => {
        console.log("Numworks detection");
        animateButton(connectButton)
        calculator.detect(onCalculatorConnected, function(error) {
            console.log(error);
        });
    })
} else {
    copyCodeButton.hidden = false;
    decoderLinkButton.hidden = false;
    numworksLinkButton.hidden = false;
    helpLinkButton.hidden = false;
}
