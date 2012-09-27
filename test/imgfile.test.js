window.onload = function() {
  var fileInput = document.getElementById('fileInput');
  fileInput.onchange = function() {
    var file = fileInput.files[0];
    var imgfile = new ImageFile(file);
    var img = document.getElementById('resultImg');
    imgfile.render(img, { width: 640 });
  }
};
