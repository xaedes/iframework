$(function(){

  Iframework.util = {
    // From YUI3 via http://stackoverflow.com/a/7390555/592125
    types: {
      'undefined'        : 'undefined',
      'number'           : 'number',
      'boolean'          : 'boolean',
      'string'           : 'string',
      '[object Function]': 'function',
      '[object RegExp]'  : 'regexp',
      '[object Array]'   : 'array',
      '[object Date]'    : 'date',
      '[object Error]'   : 'error',
      '[object HTMLCanvasElement]': 'HTMLCanvasElement',
      '[object ImageData]': 'ImageData'
    },
    type: function(o) {
      return this.types[typeof o] || this.types[Object.prototype.toString.call(o)] || (o ? 'object' : 'null');
    },
    imageTypes: ["png", "gif", "jpg", "jpeg", "webp"],
    isImageURL: function(url) {
      var fileTypeSplit = url.split(".");
      if (fileTypeSplit.length > 1) {
        var fileType = fileTypeSplit[fileTypeSplit.length-1];
        return (this.imageTypes.indexOf(fileType) > -1);
      }
      return false;
    },
    imageDrop: function(event, ui){
      // Used in image.js and variable-animation.js
      // TODO only drop to top

      // Don't deal with dropped file
      if (!ui) { return false; }

      // Don't also drop on graph
      event.stopPropagation();

      var self = event.data.self;

      var type = ui.helper.data("meemoo-drag-type");
      if ( !type || type !== "canvas" ) { return false; }

      var inputName = event.data.inputName;
      if ( !inputName ) { return false; }

      var canvas;

      var url = ui.helper.data("meemoo-image-url");
      if (url) {
        // Load big image instead of thumbnail
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function(){
          canvas = document.createElement("canvas");
          var context = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          // Hit own input with image
          self.receive(inputName, canvas);
        };
        img.src = url;
      } else {
        canvas = ui.helper.data("meemoo-drag-canvas");
        if ( !canvas) { return false; }
        // Hit own input with image
        self.receive(inputName, canvas);
      }

    },
    fitAndCopy: function(source, target){
      // source and target 2d canvases

      var w = target.width;
      var h = target.height;
      var ratio = w/h;

      var inWidth = source.width;
      var inHeight = source.height;
      var inRatio = inWidth/inHeight;

      var sx, sy, sw, sh;

      if (ratio >= inRatio) {
        sw = inWidth;
        sh = Math.floor(inWidth/ratio);
        sx = 0;
        sy = Math.floor((inHeight-sh)/2);
      } else {
        sw = Math.floor(inHeight*ratio);
        sh = inHeight;
        sx = Math.floor((inWidth-sw)/2);
        sy = 0;
      }

      var context = target.getContext("2d");
      context.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);
    },

    DumpObjectIndented: function(obj, indent)
    {
      // http://stackoverflow.com/a/130504/798588
      var result = "";

      if (typeof(obj) == "object"){
        if ((indent === null) || (indent === undefined)) indent = "";

        for (var property in obj)
        {
          var value = obj[property];
          if (typeof value == 'string')
            value = "'" + value + "'";
          else if (typeof value == 'object')
          {
            if (value instanceof Array)
            {
              // Just let JS convert the Array to a string!
              value = "[ " + value + " ]";
            }
            else
            {
              // Recursive dump
              // (replace "  " by "\t" or something else if you prefer)
              var od = this.DumpObjectIndented(value, indent + "  ");
              // If you like { on the same line as the key
              //value = "{\n" + od + "\n" + indent + "}";
              // If you prefer { and } to be aligned
              value = "\n" + indent + "{\n" + od + "\n" + indent + "}";
            }
          }
          result += indent + "'" + property + "' : " + value + ",\n";
        }
      } else {
        result = ''+obj;
      }
      return result.replace(/,\n$/, "");
    }
  };

});
