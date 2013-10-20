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
    DumpObjectIndented: function(obj, indent)
    {
      // http://stackoverflow.com/a/130504/798588
      var result = "";
      if (indent == null) indent = "";

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
      return result.replace(/,\n$/, "");
    },   
    inputobject: function(obj){
      // jsn = JSON.stringify(obj);
      str = this.DumpObjectIndented(obj);
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
