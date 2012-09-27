/**
 * ImageFile for iOS
 * 
 * Fixing iOS image file rendering issue for large megapixel image,
 * (which oftenly subsampled while calling drawImage in canvas)
 * and safely renders with proper stretching.
 */
(function() {

  /**
   * Detect subsampling is happening in loaded image.
   * In iOS, larger images than 2M pixels may be subsampled in rendering.
   */
  function detectSubsampling(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, -iw + 1, 0);
      // subsampled image becomes half smaller in rendering size.
      // check alpha channel value to confirm image is covering edge pixel or not.
      // if alpha value is 0 image is not covering, hence subsampled.
      return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
    } else {
      return false;
    }
  }

  /**
   * iOS safari seems to have a bug to squash image vertically in Context#drawImage().
   */
  function detectVerticalSquash(img, iw, ih) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
      var alpha = data[(py - 1) * 4 + 3];
      if (alpha === 0) {
        ey = py;
      } else {
        sy = py;
      }
      py = (ey + sy) >> 1;
    }
    return py / ih;
  }

  /**
   * Rendering image element (with resizing) and get its data URL
   */
  function renderImageToDataURL(img, options) {
    var canvas = document.createElement('canvas');
    renderImageToCanvas(img, canvas, options);
    return canvas.toDataURL();
  }

  /**
   * Rendering image element (with resizing) into the canvas element
   */
  function renderImageToCanvas(img, canvas, options) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var width = options.width, height = options.height;
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var subsampled = detectSubsampling(img);
    if (subsampled) {
      iw /= 2;
      ih /= 2;
    }
    var d = 1024; // size of tiling canvas
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = tmpCanvas.height = d;
    var tmpCtx = tmpCanvas.getContext('2d');
    var vertSquashRatio = detectVerticalSquash(img, iw, ih);
    var sy = 0;
    while (sy < ih) {
      var sh = sy + d > ih ? ih - sy : d;
      var sx = 0;
      while (sx < iw) {
        var sw = sx + d > iw ? iw - sx : d;
        tmpCtx.clearRect(0, 0, d, d);
        tmpCtx.drawImage(img, -sx, -sy);
        var dx = Math.floor(sx * width / iw);
        var dw = Math.ceil(sw * width / iw);
        var dy = Math.floor(sy * height / ih / vertSquashRatio);
        var dh = Math.ceil(sh * height / ih / vertSquashRatio);
        ctx.drawImage(tmpCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
        sx += d;
      }
      sy += d;
    }
    tmpCanvas = tmpCtx = null;
  }


  /**
   *
   */
  function ImageFile(file, options) {
    this.file = file;
  }

  /**
   *
   */
  ImageFile.prototype.render = function(target, options) {
    options = options || {}
    var width = options.width, height = options.height;
    var file = this.file;
    var img = new Image();
    var URL = window.URL || window.webkitURL;
    img.src = URL.createObjectURL(this.file);
    img.onload = function() {
      if (width && !height) {
        height = Math.floor(img.naturalHeight * width / img.naturalWidth);
      } else if (height && !width) {
        width = Math.floor(img.naturalWidth * height / img.naturalHeight);
      }
      var opt = { width : width, height : height }
      for (var k in options) opt[k] = options[k];
      target.src = renderImageToDataURL(img, opt);
    }
  }

  /**
   *
   */
  if (typeof define === 'function' && define.amd) {
    define(ImageFile);
  } else {
    this.ImageFile = ImageFile;
  }

})();
