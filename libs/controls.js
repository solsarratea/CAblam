/*
var btn = document.getElementById("btn");
if (btn != null){
    btn.onclick = function() {
        modal.style.display = "block"
    }
    var modal  = document.getElementById("addSourceImage");
    var span = document.getElementsByClassName("close")[0];
    modal.style.display="none";
    span.onclick = function() {
        modal.style.display = "none";
    }
    var upload = document.getElementById("uploadSource");


    upload.onchange = function(e) {
        updateSource = true;
        saveImage(e,0);
        modal.style.display = "none";
    };

}
*/

document.getElementById("addSourceImage").style.display = "none";

var btn2 = document.getElementById("btn2");
var editor = document.getElementById("editor");
var status = "";

if (btn2 != null){
    btn2.onclick = function() {
        if (editor.style.display === "none"){
            editor.style.display = "block";
        }else{
            editor.style.display = "none";
        }
    }
 }




window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        modal2.style.display="none";
    }

}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
}

var screenshot =  document.getElementById("screenshot");
screenshot.onclick = function(event){
    var aCanvas = document.getElementById("canvas"),
        ctx =  aCanvas.getContext("webgl2", {preserveDrawingBuffer: true});
    ;
    aCanvas.toBlob( function(blob)
                    {
                        var d = new Date();
                        var fName = d.getFullYear()+"_"+d.getMonth()+"_"+d.getDate()+"_"+
                            d.getHours()+"_"+d.getMinutes()+"_"+d.getSeconds();

                        saveAs(blob, "CAblam-" + fName +".png");
                    });

};

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type:mimeString});
}



let updateSource =false, hiddenSource = false;
function handleEvent(event) {
   // console.log( `${event.type}: ${event.loaded} bytes transferred\n`);
    console.log(event.type, hiddenSource);
    if (event.type === "load" && updateSource) {
        localStorage.setItem("source", reader.result);
        sceneManager.updateSource();
        updateSource = false;
    }
    if (event.type === "load" && hiddenSource) {
        localStorage.setItem("hidden", reader.result);
        sceneManager.updateHidden();
        hiddenSource = false;
    }
}

const reader = new FileReader();
reader.addEventListener('loadstart', handleEvent);
reader.addEventListener('load', handleEvent);
reader.addEventListener('loadend', handleEvent);
reader.addEventListener('progress', handleEvent);
reader.addEventListener('error', handleEvent);
reader.addEventListener('abort', handleEvent);

function saveImage(e,idx) {
    var files = document.querySelectorAll('input[type=file]')[idx];
    console.log(files)
    const imgPath = files.files[0];

    if (imgPath) {
        reader.readAsDataURL(imgPath);
    }


}




var info = document.getElementById("info");
if (info!=null){
    var modalinfo = document.getElementById("showInfo");
    modalinfo.style.display = "none";

    var closeinfo = document.getElementsByClassName("close")[1];
    modalinfo.style.display="none";
    info.onclick = function() {
        modalinfo.style.display="block";
        editor.style.display="none";
    }

    closeinfo.onclick = function() {
        modalinfo.style.display = "none";
        editor.style.display="block";
    }

}
