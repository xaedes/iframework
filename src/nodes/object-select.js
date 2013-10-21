/*global Stats:true*/

// extends src/nodes/text.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<textarea style="width:100%; height:100%;" readonly="readonly"></textarea>';

  Iframework.NativeNodes["object-select"] = Iframework.NativeNodes["object"].extend({

    template: _.template(template),
    info: {
      title: "object-select",
      description: "selects part of a object"
    },
    events: {
    },
    initializeModule: function(){
      // todo: assign privates for defaults for input
      // todo: this.update();
    },
 
    update: function(){
      this._json=JSON.stringify(this._obj);

      obj = this._obj;
      if(typeof(this._selection) !== "undefined"){
        for (var i = 0; i < this._selection.length; i++) {
          obj = obj[this._selection[i]];
        };
      }

      // obj = this._obj[this._jsonpath]
      // obj = jsonPath(this._obj, this._jsonpath); // http://goessner.net/articles/JsonPath/
      console.log(obj);
      console.log(typeof(obj));
      if(typeof(obj) !== "undefined"){
        str = Iframework.util.DumpObjectIndented(obj);
        this.$("textarea").val(str);
        this.send("object", obj);
      }
    },
    inputobject: function(obj){
      this._obj=obj;
      this.update();
    },
    inputselection: function(sel){
      this._selection = [];

      var sel = sel.trim();
      // Parse selection
      while(sel.length > 0) {
        sel = sel.replace(/([^\\\.])(\[)/,"$1.$2");           // put splitting '.' around [] when it is missing
        sel = sel.replace(/([^\\]\])([^\.])/,"$1.$2");        // put splitting '.' around [] when it is missing
        sel = sel.replace(/^\[([^\]]+)\]\.?(.*)?$/,"$1.$2");  // strip '[' and ']''
        sel = sel.replace(/^"([^"]+)"\.?(.*)?$/,"$1.$2");     // strip surrounding '"'
        matches = sel.match(/^([^.]+)\.?(.*)?/);              // match next selection (for splitting '.')
        if(typeof(matches[2])!="undefined"){
          this._selection.push(matches[1]);
          sel = matches[2];
        } else if(typeof(matches[1])!="undefined"){
          this._selection.push(matches[1]);
          sel = "";
        }
      }

      this.update();
    },

    inputs: {
      object: {
        type: "object",
        description: "object",
        "default": {},
      },
      selection: {
        type: "string",
        description: "",
        "default": "",
      }
    },
    outputs: {
      object: {
        type: "object",
        description: "string representation of object"
      },
    }

  });


});
