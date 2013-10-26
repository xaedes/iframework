/*global Stats:true*/

// extends src/nodes/text.js which extends src/node-box-native-view.js

$(function(){

  var template = 
    '<div>'+
    '<div class="d3container"></div>'+
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

      options = {
        "container":  this.$(".d3container")[0],
        "width": 600,
        "height": 260,
        "x_ticks": 5,
        "y_ticks": 3,
      };
      self.charts = {};
      self.charts["/imu/mag/vector/x"] = new Iframework.ros.SensorChart(options);
      self.charts["/imu/mag/vector/y"] = new Iframework.ros.SensorChart(options);
      self.charts["/imu/mag/vector/z"] = new Iframework.ros.SensorChart(options);

      self.initRos(self._host);
      // self.ros.once('connection', function(){
        self.initSrvRosapiTopicType();
        self.initSrvRosapiGetTime();
        self.connectToTopics();
        self.requestRosTime(function(response) {
          var rostime = Math.round(self.timeToSec(response.time)*1000.0);
          var jstime = Number(new Date());
          var diff = (rostime - jstime);
          var now = function() {
              return Number(new Date()) + diff;
          };
          for(var chart in self.charts) {
            chart.now = now;
          }
        });
      // });


    },

    connectToTopics: function(){
      self = this;
      this.subscribe("/imu/data_raw","/imu/data_raw",function(msg){
        self.$("#ta1").val(Iframework.util.DumpObjectIndented(msg));
      });
      this.subscribe("/imu/mag","/imu/mag",function(msg){
        self.$("#ta2").val(Iframework.util.DumpObjectIndented(msg));
        t = Math.round(self.timeToSec(msg.header.stamp)*1000.0);
        // console.log(t - Number(new Date()));
        self.charts["/imu/mag/vector/x"].addSample([t,msg.vector.x]);
        self.charts["/imu/mag/vector/y"].addSample([t,msg.vector.y]);
        self.charts["/imu/mag/vector/z"].addSample([t,msg.vector.z]);
      });
    },

    inputhost: function(host){
      self = this;
      self._host = host;
      self.ros.connect(self._host);
      self.ros.on('error',function(){});
      self.ros.on('connection', function(){
        self.connectToTopics();
      });
    },
    inputs: {
      host: {
        type: "string",
        description: "host where rosbridge is running",
        "default": "ws://ros.local:9090"
      },

    },
    outputs: {

    }

  });


});
