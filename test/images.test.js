/* global MegaPixImage */
window.onload = function() {
  var images = {
    "": { width: 0, height: 0 },
    "./images/image01.jpg": { width: 320, height: 240 },
    "./images/image02.jpg": { width: 320, height: 240 }
  };

  var select = document.getElementById('imageSelect');
  select.innerHTML = Object.keys(images).map(function(imgsrc) {
    return '<option value="'+imgsrc+'">'+imgsrc+'</option>';
  });

  var img = document.getElementById('original');
  var rawCanvas = document.getElementById('raw');
  var mpCanvas = document.getElementById('megapix');
  img.onload = function() {
    var nw = img.naturalWidth, nh = img.naturalHeight;
    var ctx = rawCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, nw, nh, 0, 0, img.width, img.height);
    // MegaPixImage constructor accepts File/Blob object.
    var mpImg = new MegaPixImage(img);
    mpImg.render(mpCanvas, { width: img.width, height: img.height });
  };
  select.addEventListener('change', function(e) {
    var imgsrc = select.value;
    if (!imgsrc) { return; }
    img.src = imgsrc;
    var size = images[imgsrc];
    img.width = rawCanvas.width = mpCanvas.width = size.width;
    img.height = rawCanvas.height = mpCanvas.height = size.height;
  }, false);
};
