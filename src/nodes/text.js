// extends src/node-box-native-view.js

$(function(){

  var template = 
    '<div class="info" />';

  Iframework.NativeNodes["text"] = Iframework.NodeBoxNativeView.extend({

    template: _.template(template),
    initializeCategory: function() {
    }

  });


});
