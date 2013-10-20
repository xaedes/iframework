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
      this.ros = new ROSLIB.Ros({
        url : this._host
      });
      this._topic_name = this.inputs["topic"]["default"];

      this.srv_rosapi_topic_type = new ROSLIB.Service({
        ros : this.ros,
        name : '/rosapi/topic_type',
        serviceType : 'rosapi/TopicType'
      });

      this.newtopic();

    },
    newtopic: function(){
      self = this;
      if(this.topic !== undefined)
        this.topic.unsubscribe();


        var rqst_topic_type = new ROSLIB.ServiceRequest({
          topic : this._topic_name
        });
        
        this.srv_rosapi_topic_type.callService(rqst_topic_type, function(result) {
          self.topic = new ROSLIB.Topic({
            ros : self.ros,
            name: self._topic_name,
            messageType: result["type"]
          });
          self.topic.subscribe(function(message){
            self.send("message",message);
          });
        });

    },

    inputhost: function(host){
      this._host = host;
      this.ros.connect(this._host);
    },
    inputtopic: function(topic){
      this._topic_name = topic;
      this.newtopic();
    },
    inputs: {
      host: {
        type: "string",
        description: "host where rosbridge is running",
        "default": "ws://192.168.0.102:9090"
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
