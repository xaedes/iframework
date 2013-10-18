/*global Stats:true*/

// extends src/nodes/text.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<form class="textform">'+
      '<div style="position:absolute; top:2px; right:4px; bottom:30px; left:2px;">'+
        '<textarea class="text" style="width:100%; height:100%;" readonly="readonly"></textarea>'+
      '</div>'+
      '<button class="send" type="submit" style="position:absolute; bottom:0; left:0;">send</button>'+
    '</form>';

  Iframework.NativeNodes["text-crosslist"] = Iframework.NativeNodes["text"].extend({

    template: _.template(template),
    info: {
      title: "text-crosslist",
      description: "combines all lines from line1 and line2 and outputs the results"
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
      this.updateCrosslist();
      this.inputsend();
      return false;
    },

    updateCrosslist: function() {
      this._list1 = this._list1 == undefined ? [] : this._list1
      this._list2 = this._list2 == undefined ? [] : this._list2
      this._cross = []
      for (var i = 0; i < this._list1.length; i++) {
        str1 = this._list1[i];
        for (var j = 0; j < this._list2.length; j++) {
          str2 = this._list2[j];
          this._cross.push(str1 + this._glue + str2);
        };
      };

      this.$(".text").val(this.getCrosslistString());
      this.changeText(null);
    },
    getCrosslistString: function () {
      this._cross = this._cross == undefined ? [] : this._cross
      return this._cross.join("\r\n");
    },
    inputsend: function(){
      this.updateCrosslist();
      this.send("string", this.getCrosslistString());
    },
    inputlist1: function(str){
      this._list1 = _.map(str.split("\n"),function(s){return s.trim();});
      this.updateCrosslist();
    },
    inputlist2: function(str){
      this._list2 = _.map(str.split("\n"),function(s){return s.trim();});
      this.updateCrosslist();
    },
    inputglue: function(str){
      this._glue = str;
      this.updateCrosslist();
    },
    changeText: function(event) {
      this.send("changed","!");
    },
    inputs: {
      list1: {
        // action: list1,
        type: "string",
        description: "lines of text"
      },
      list2: {
        // action: list2,
        type: "string",
        description: "lines of text"
      },
      glue: {
        // action: glue,
        type: "string",
        description: "string to combine the lists",
        "default": " "
      },
      send: {
        type: "bang",
        description: "send the text"
      }
    },
    outputs: {
      string: {
        type: "string"
      },
      changed: {
        type: "bang",
        description: "happens when text is changed"
      }
    }

  });


});
