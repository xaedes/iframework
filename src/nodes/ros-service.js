/*global Stats:true*/

// extends src/nodes/text.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<div>'+
    '</div>';

  Iframework.NativeNodes["ros-service"] = Iframework.NativeNodes["ros"].extend({

    template: _.template(template),
    info: {
      title: "ros-service",
      description: "A ros-service. When request is received it is sent to a ros service and the result is sent to output."
    },
    events: {

    },
    initializeModule: function(){
      this._host = this.inputs["host"]["default"];
      this._service = this.inputs["service"]["default"];
      this._request = this.inputs["request"]["default"];

      this.initRos(this._host);

      this.newservice();
    },

    newservice: function(){
      self = this;
      this._service["ros"] = this.ros;
      this.srv = new ROSLIB.Service(this._service);
    },

    inputhost: function(host){
      this._host = host;
      this.ros.connect(this._host);
    },
    inputservice: function(service){
      this._service = service;
      this.newservice();
    },
    inputrequest: function(request){
      self = this;

      srvreq = ROSLIB.ServiceRequest(request) || {};
      this.srv.callService(srvreq, function(result) {
        self.send("result", result);
      });
    },
    inputs: {
      host: {
        type: "string",
        description: "host where rosbridge is running",
        "default": "ws://192.168.0.102:9090"
      },
      service: {
        type: "object",
        description: "ROSLIB.Service",
        "default": {
          name : '/rosapi/topics',
          serviceType : 'rosapi/Topics'}
      },
      request: {
        type: "object",
        description: "ROSLIB.ServiceRequest",
        "default": {}
      },
    },
    outputs: {
      result: {
        type: "object",
        description: "message"
      },
    }

  });


});
