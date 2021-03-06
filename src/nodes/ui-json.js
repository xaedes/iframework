/*global Stats:true*/

// extends src/nodes/time.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<form class="textform">'+
      '<div style="position:absolute; top:2px; right:4px; bottom:30px; left:2px;">'+
        '<textarea class="text" style="width:100%; height:100%;"></textarea>'+
      '</div>'+
      '<button class="send" type="submit" style="position:absolute; bottom:0; left:0;">send</button>'+
    '</form>';

  Iframework.NativeNodes["ui-json"] = Iframework.NativeNodes["ui"].extend({

    template: _.template(template),
    info: {
      title: "json",
      description: "a multiline text box to save and send json stored objects"
    },
    events: {
      "submit .textform": "submit",
      "change .text": "changeText",
      "keydown .text": "changeText",
      "keyup .text": "changeText"
    },
    initializeModule: function(){
      this.$(".button").button();
    },
    submit: function(){
      this._val = this.$(".text").val();
      this.inputsend();
      return false;
    },
    inputvalue: function(val){
      this._val = val;
      this.$(".text").val(val);
      this.inputsend();
    },
    inputsend: function(){
      this._val = this.$(".text").val();

      this.send("json", this._val);
      this.send("object", JSON.parse(this._val));
    },
    changeText: function(e) {
      this._val = this.$(".text").val();
      this.send("changed","!");
    },
    inputs: {
      value: {
        type: "json",
        description: "manual input of json",
        input_template: "<textarea><%= value %></textarea>",
        input_element: "textarea"
      },
      send: {
        type: "bang",
        description: "send the object"
      }
    },
    outputs: {
      json: {
        type: "string",
        description: "json string",
      },
      object: {
        type: "object",
        description: "object"
      },
      changed: {
        type: "bang",
        description: "happens when text is changed"
      }
    }

  });


});
