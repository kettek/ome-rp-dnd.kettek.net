/* This script acquires all image tags encased in anchor tags that link to an image file then adds onclick events to popup + zoom the image rather than visiting the given link. */
var img2popup = {
  popup: null,
  focused: false,
  width: 0,
  height: 0,
  twidth: 0,
  theight: 0,
  left: 0,
  top: 0,
  start_time: 0,
  zoom_time: 250,
  delta: 0,
  Go: function(ele) {
    if (this.popup == null) this.doSetup();
    this.doParse();
  },
  doParse: function(ele) {
    var context = (typeof ele === 'undefined' ? document.getElementsByTagName("img") : ele.getElementsByTagName("img"));
    for (var i = 0; i < context.length; i++) {
      var img = context[i];
      var p = context[i].parentNode;
      if (p.nodeName == "A") {
        if (p.href.match(/\.(png|jpg|jpeg|gif)$/)) {
          p.onclick = (function(p, img) { return function(e) {
            if (!e) var e = window.event;
            e.cancelBubble = true; if (e.stopPropagation) e.stopPropagation();
            img2popup.popup.src = p.href;
            img2popup.popup.style.width = img.clientWidth+'px';
            img2popup.popup.style.height = img.clientHeight+'px';
            var style = window.getComputedStyle(img, null);
            var bbox = img.getBoundingClientRect();
            img2popup.left = bbox.left + (((bbox.right-bbox.left)-parseInt(style.getPropertyValue('width')))/2);
            img2popup.top = bbox.top + (((bbox.bottom-bbox.top)-parseInt(style.getPropertyValue('height')))/2);

            return false;
          }})(p, img);
        }
      }
    }
  },
  doSetup: function() {
    // create our black bg
    this.bg = document.createElement("div");
    this.bg.style.visibility = "hidden";
    this.bg.style.position = "fixed";
    this.bg.style.left = 0;
    this.bg.style.top = 0;
    this.bg.style.width = "100%";
    this.bg.style.height = "100%";
    this.bg.style.backgroundColor = "#111";
    this.bg.style.opacity = 0;
    this.bg.style.zIndex = "1999";
    document.body.appendChild(this.bg);
    // create our actual popup element
    this.popup = document.createElement("img");
    this.popup.style.visibility = "hidden";
    this.popup.style.position = "fixed";
    this.popup.id = "popup";
    this.popup.style.zIndex = "2000";
    this.popup.onload = function() {
      this.style.width = this.style.height = '';
      img2popup.width = this.width; img2popup.height = this.height;
      img2popup.start_time = new Date;
      img2popup.doResize();
      this.style.visibility = "visible";
      img2popup.bg.style.visibility = "visible";
      img2popup.focused = true;
    };
    document.body.appendChild(this.popup);
    document.addEventListener('click', function(e) {
      if (!e) var e = window.event;
      e.cancelBubble = true; if (e.stopPropagation) e.stopPropagation();
      if (e.button != 2 && img2popup.focused) img2popup.doHide();
      return false;
    });
    document.addEventListener('keydown', function(e) {
      if (e.which == 27 && img2popup.focused) img2popup.doHide();
    });
      
    window.onresize = img2popup.doResize;
  },
  doHide: function() {
    if (this.timer == null) {
      img2popup.start_time = new Date;
      this.timer = setInterval(function() { img2popup.doReverp(); }, 10);
    }
  },
  doResize: function() {
    var w = img2popup.width;
    var h = img2popup.height;
    var sw = (window.innerWidth || document.documentElement.clientWidth);
    var sh = (window.innerHeight || document.documentElement.clientHeight);
    var r = Math.min((sw-32) / w, (sh-32) / h);
    if (r < 1.0) {
      w *= r;
      h *= r;
    }
    img2popup.twidth = w;
    img2popup.theight = h;

    if (this.timer == null) this.timer = setInterval(function() { img2popup.doInterp(); }, 10);
  },
  doInterp: function() {
    var delta = new Date - img2popup.start_time;
    var R = delta / img2popup.zoom_time;          // ratio of delta to zoom time
    var Rr = (1.0 - R);                           // reverse delta ratio
    var w = img2popup.twidth;                     // target resize width
    var h = img2popup.theight;                    // target resize height
    // center of client window
    var sw = (window.innerWidth || document.documentElement.clientWidth);
    var sh = (window.innerHeight || document.documentElement.clientHeight);
    // calculate reverse target dimensions
    w *= R;
    h *= R;
    // get left and top offsets to image origin with reverse ratio
    var ix = img2popup.left * Rr;
    var iy = img2popup.top * Rr;
    // get center offsets with ratio
    var ox = ((sw/2) - (w/2)) * R;
    var oy = ((sh/2) - (h/2)) * R;
    // apply our styling
    this.popup.style.left = (ox+ix)+'px';
    this.popup.style.top = (oy+iy)+'px';
    this.popup.style.width = w+"px";
    this.popup.style.height = h+"px";
    this.popup.style.opacity = 1.0 * R;
    this.bg.style.opacity = 0.9 * R;
    // and, of course, stop the loop if zoom_time has elapsed
    if (delta >= img2popup.zoom_time) {
      clearInterval(this.timer);
      this.timer = null;
      w = img2popup.twidth;
      h = img2popup.theight;
      this.popup.style.left = (sw/2)-(w/2)+'px';
      this.popup.style.top = (sh/2)-(h/2)+'px';
      this.popup.style.width = w+"px";
      this.popup.style.height = h+"px";
      this.popup.style.opacity = 1.0;
      this.bg.style.opacity = 0.9;
    }
  },
  doReverp: function() {
    var delta = new Date - img2popup.start_time;
    var R = delta / img2popup.zoom_time;          // ratio of delta to zoom time
    var Rr = (1.0 - R);                           // reverse delta ratio
    var w = img2popup.twidth;                     // target resize width
    var h = img2popup.theight;                    // target resize height
    // center of client window
    var sw = (window.innerWidth || document.documentElement.clientWidth);
    var sh = (window.innerHeight || document.documentElement.clientHeight);
    // calculate reverse target dimensions
    w *= Rr;
    h *= Rr;
    // get left and top offsets to image origin with ratio
    var ix = img2popup.left * R;
    var iy = img2popup.top * R;
    // get center offsets with reverse ratio
    var ox = ((sw/2) - (w/2)) * Rr;
    var oy = ((sh/2) - (h/2)) * Rr;
    // apply our styling
    this.popup.style.left = (ox+ix)+'px';
    this.popup.style.top = (oy+iy)+'px';
    this.popup.style.width = w+"px";
    this.popup.style.height = h+"px";
    this.popup.style.opacity = 1.0 * Rr;
    this.bg.style.opacity = 0.9 * Rr;
    // and, of course, stop the loop if zoom_time has elapsed
    if (delta >= img2popup.zoom_time) {
      clearInterval(this.timer);
      this.timer = null;
      this.popup.style.opacity = 0.0;
      this.popup.style.visibility = "hidden";
      this.popup.src = "";
      this.bg.style.opacity = 0.0;
      this.bg.style.visibility = "hidden";
      this.focused = false;
    }
  }
};
