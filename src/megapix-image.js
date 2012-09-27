/**
 * MegapixImageFile for iOS
 * 
 * Fixes iOS6 image file rendering issue for large size image (over megapixel),
 * which causes unexpected subsampling when drawing it in canvas,
 * and safely renders with proper stretching.
 */
(function() {

  /**
   * Detect subsampling in loaded image.
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
   * Detecting vertical squash in loaded image.
   * Fixes a bug which squash image vertically while drawing into canvas for some images.
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
   * MegaPixImage class
   */
  function MegaPixImage(srcImage) {
    if (srcImage instanceof Blob) {
      var img = new Image();
      img.src = (window.URL || window.webkitURL).createObjectURL(srcImage);
      srcImage = img;
    }
    if (!srcImage.naturalWidth && !srcImage.naturalHeight) {
      var _this = this;
      srcImage.onload = function() { _this.onImageLoad(); }
      this.imageLoadListeners = [];
    }
    this.srcImage = srcImage;
  }

  /**
   * Rendering megapix image into specified target element
   */
  MegaPixImage.prototype.render = function(target, options) {
    if (this.imageLoadListeners) {
      var _this = this;
      this.imageLoadListeners.push(function() { _this.render(target, options) });
      return;
    }
    options = options || {}
    var width = options.width, height = options.height;
    if (width && !height) {
      height = Math.floor(this.srcImage.naturalHeight * width / this.srcImage.naturalWidth);
    } else if (height && !width) {
      width = Math.floor(this.srcImage.naturalWidth * height / this.srcImage.naturalHeight);
    }
    var opt = { width : width, height : height }
    for (var k in options) opt[k] = options[k];

    var tagName = target.tagName.toLowerCase();
    if (tagName === 'img') {
      console.log(this.srcImage);
      target.src = renderImageToDataURL(this.srcImage, opt);
    } else if (tagName === 'canvas') {
      renderImageToCanvas(this.srcImage, target, opt);
    }
  }

  /**
   *
   */
  MegaPixImage.prototype.onImageLoad = function(target, options) {
    var listeners = this.imageLoadListeners;
    if (listeners) {
      this.imageLoadListeners = null;
      for (var i=0, len=listeners.length; i<len; i++) {
        listeners[i]();
      }
    }
  }

  /**
   * Export class to global
   */
  if (typeof define === 'function' && define.amd) {
    define(MegaPixImage); // for AMD loader
  } else {
    this.MegaPixImage = MegaPixImage;
  }

})();
