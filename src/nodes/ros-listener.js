/*global Stats:true*/

// extends src/nodes/text.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<div>'+
    '</div>';

  Iframework.NativeNodes["ros-listener"] = Iframework.NativeNodes["ros"].extend({

    template: _.template(template),
    info: {
      title: "ros-listener",
      description: "Listens to a topic"
    },
    events: {

    },
    initializeModule: function(){
      this._host = this.inputs["host"]["default"];
      this._topic_name = this.inputs["topic"]["default"];

      this.initRos(this._host);
      self.ros.on('connection', function(){
        this.initSrvRosapiTopicType();
        this.newtopic();  
      });


    },

    newtopic: function(){
      self = this;
      this.subscribe("topic",this._topic_name,function(message){
          self.send("message",message);
      }); 
    },

    inputhost: function(host){
      this._host = host;
      this.ros.connect(this._host);
      self.ros.on('connection', function(){
        this.newtopic();
      });
    },
    inputtopic: function(topic){
      this._topic_name = topic;
      this.newtopic();
    },
    inputs: {
      host: {
        type: "string",
        description: "host where rosbridge is running",
        "default": "ws://192.168.0.103:9090"
      },
      topic: {
        type: "string",
        description: "topic to subscribe to",
        "default": "/rosout"
      },
    },
    outputs: {
      message: {
        type: "object",
        description: "message"
      },
      received: {
        type: "bang",
        description: "happens when message arrives"
      }
    }

  });


});
