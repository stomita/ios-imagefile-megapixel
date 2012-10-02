window.onload = function() {
  var fileInput = document.getElementById('fileInput');
  fileInput.onchange = function() {
    var file = fileInput.files[0];
    var mpImg = new MegaPixImage(file);
    mpImg.render(document.getElementById('resultImage'), { maxWidth: 960, maxHeight: 960, quality: 0.5 });
    mpImg.render(document.getElementById('resultCanvas'), { maxWidth: 960, maxHeight: 960 });
  }
};
