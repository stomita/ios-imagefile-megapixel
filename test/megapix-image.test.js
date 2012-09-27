window.onload = function() {
  var fileInput = document.getElementById('fileInput');
  fileInput.onchange = function() {
    var file = fileInput.files[0];
    var mpImg = new MegaPixImage(file);
    mpImg.render(document.getElementById('resultImage'), { width: 640 });
    mpImg.render(document.getElementById('resultCanvas'), { width: 640 });
  }
};
