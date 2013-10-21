/*global Stats:true*/

// extends src/nodes/text.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<textarea style="width:100%; height:100%;" readonly="readonly"></textarea>';

  Iframework.NativeNodes["text-fromobject"] = Iframework.NativeNodes["text"].extend({

    template: _.template(template),
    info: {
      title: "text-fromobject",
      description: "returns string representation from object"
    },
    events: {
    },
    initializeModule: function(){
    },
    inputobject: function(obj){
      // jsn = JSON.stringify(obj);
      str =  Iframework.util.DumpObjectIndented(obj);
      this.$("textarea").val(str);
      this.send("string", str);
    },

    inputs: {
      object: {
        type: "object",
        description: "object"
      }
    },
    outputs: {
      string: {
        type: "string",
        description: "string representation of object"
      },
    }

  });


});
