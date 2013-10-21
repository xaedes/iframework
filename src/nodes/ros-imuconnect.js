/*global Stats:true*/

// extends src/nodes/text.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<div>'+
    '<textarea id="ta1" style="width:100%; display: block;"></textarea>'+
    '<textarea id="ta2" style="width:100%; display: block;"></textarea>'+
    '</div>';

  Iframework.NativeNodes["ros-imuconnect"] = Iframework.NativeNodes["ros"].extend({

    template: _.template(template),
    info: {
      title: "ros-imuconnect",
      description: "Connects to IMU. Listens to /imu/data_raw and /imu/mag and visualizes output."
    },
    events: {

    },
    initializeModule: function(){
      self = this;
      self._host = self.inputs["host"]["default"];

      self.initRos(self._host);
      self.ros.on('connection', function(){
        self.initSrvRosapiTopicType();
        self.connectToTopics();
      });

    },

    connectToTopics: function(){
      self = this;
      this.subscribe("/imu/data_raw","/imu/data_raw",function(msg){
        self.$("#ta1").val(Iframework.util.DumpObjectIndented(msg));
      });
      this.subscribe("/imu/mag","/imu/mag",function(msg){
        self.$("#ta2").val(Iframework.util.DumpObjectIndented(msg));
      });
    },

    inputhost: function(host){
      self = this;
      self._host = host;
      self.ros.connect(self._host);
      self.ros.on('connection', function(){
        self.connectToTopics();
      });
    },
    inputs: {
      host: {
        type: "string",
        description: "host where rosbridge is running",
        "default": "ws://192.168.0.103:9090"
      },

    },
    outputs: {

    }

  });


});
