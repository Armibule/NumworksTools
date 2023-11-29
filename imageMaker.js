const loadImageButton = document.getElementById("loadImageButton")
const loadedImage = document.getElementById("loadedImage")
const loadImagePopup = document.querySelector(".loadImagePopup")

const uploadImageButton = document.getElementById("uploadImage")

const imageCanvas = document.getElementById("previewCanvas")
const imageCanvasCtx = imageCanvas.getContext("2d")
imageCanvas.width = 100
imageCanvas.height = 100


const copyCodeButton = document.getElementById("copyCodeButton")


// result fields
const resultStorage = document.getElementById("resultStorage")
const resultWidth = document.getElementById("resultWidth")
const resultHeight = document.getElementById("resultHeight")

// inputting files
const fileInput = document.createElement("input")
fileInput.type = "file"
fileInput.accept = "image/*"


var code = ""


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

copyCodeButton.onclick = function() {
    navigator.clipboard.writeText(code)
    copyCodeButton.style.animation = "copyButton 1s ease-out"
    setTimeout(() => {
        copyCodeButton.style.animation = ""
    }, 1100)
}

function setPixel(x, y, color) {
    imageCanvasCtx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`
    imageCanvasCtx.fillRect(x, y, 1, 1)
}

// 1 is not possible
const scale = 2

// in bits, minimum is 2, max is 8
const colorFoldPower = 5
const colorFold = 2**colorFoldPower
function foldValue(value) {
    // return Math.round(value/colorFold)*colorFold
    return Math.round(value / colorFold)
}
function unfoldValue(value) {
    return value * colorFold
}
const transparencyColor = [255, 255, 255]
function getRGB(data, width, x, y) {
    const index = (y*width + x)*4

    if (data[index+3] == 0) {
        return [foldValue(transparencyColor[0]), foldValue(transparencyColor[1]), foldValue(transparencyColor[2])]
    }

    return [foldValue(data[index]), foldValue(data[index+1]), foldValue(data[index+2])]
}
function RGBToNumber(color) {
    return color[0]*65_025 + color[1]*255 + color[2]
}

// not fully implemented
function pixelsToCode(data, width, height) {
    result = "data="
    for (y=0 ; y<height ; y++) {
        result += "("
        for (x=0 ; x<width ; x++) {
            var color = getRGB(data, width, x, y)

            result += `(${color[0]},${color[1]},${color[2]}),`
        }
        result += "),"
    }
    console.log(result.length)
    return result
}
const indexesLabels = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,;:!/*-+.-_={}[]()<>@$&%^|\"áâäéêëíîïñśóõöúûüÿ☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼┤ÁÂÀ©╣║↕7╝¢¥┐└┴┬├─┼Ã╚ÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒ"
function pixelsToCodeIndexed(data, width, height, partitionLength) {
    if (indexesLabels.length < partitionLength || partitionLength <= 0) {
        throw Exception(`Bad partitionLength value: ${partitionLength}`)
    }

    const indexed = {} // colorKey : [color, label]
    var indexedCount = 0

    function colorToKey(col) {
        return `${col[0]},${col[1]},${col[2]}`
    }
    
    for (y=0 ; y<height ; y++) {
        for (x=0 ; x<width ; x++) {
            color = getRGB(data, width, x, y)
            key = colorToKey(color)
            if (!(key in indexed)) {
                console.log(color[0]*colorFold, color[1]*colorFold, color[2]*colorFold)

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

    console.log(indexed)
    console.log(indexedCount)

    var pixels = ""
    var label = ""
    var lastLabel = ""
    var repetitionCount = 0
    var color
    for (y=0 ; y<height ; y++) {
        for (x=0 ; x<width ; x++) {
            color = getRGB(data, width, x, y)

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

    var result = `from imgdraw_opti import *\np=prs(${colorFoldPower},'${indexesLabels.slice(0, indexedCount)}',(${colors}))\ndr(p,${width},${height},'${pixels}',${scale})`

    console.log(result.length)
    return result
}

fileInput.onchange = function(e) {
    var reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])

    console.log(e.target.files[0])
    
    reader.onload = readerEvent => {
       var content = readerEvent.target.result
       loadedImage.src = content

       loadedImage.onload = function() {
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
    }

   closeloadImagePopup()
}

