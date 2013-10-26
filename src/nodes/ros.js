// extends src/node-box-native-view.js

$(function(){
  var template = 
    '<div class="info" />';

  Iframework.NativeNodes["ros"] = Iframework.NodeBoxNativeView.extend({

    template: _.template(template),
    initializeCategory: function() {
    },

    initRos: function(host){
      this.ros = new ROSLIB.Ros({
        url : host
      });
    },


    /*
     * Subscribes to topic_name and stores topic in this.topics[_id]
     * 
     * If this.topics[_id] already exists, unsubsribe first.
     * 
     * \warn uses this.requestTopicType, so make sure it is initialized first with this.initSrvRosapiTopicType
     * \warn expects this.ros to be set to ROSLIB.Ros instance (e.g. use this.initRos())
     */
    subscribe: function(_id,topic_name,callback){ 
      this.topics = this.topics || [];
      self = this;

      this.requestTopicType(topic_name, function(result) {
        // unsubcribe previous topic
        if((typeof(self.topics[_id]) != "undefined") && (typeof(self.topics[_id].unsubscribe) == "function")){
          self.topics[_id].unsubscribe();
        }
        self.topics[_id] = new ROSLIB.Topic({
          ros : self.ros,
          name: topic_name,
          messageType: result["type"]
        });
        self.topics[_id].subscribe(callback);
      });
    },
    /*
     * initializes this.srv_rosapi_topic_type
     *
     * see also: this.requestTopicType
     * 
     * \warn expects this.ros to be set to ROSLIB.Ros instance (e.g. use this.initRos())
     */
    initSrvRosapiTopicType: function() {
      this.srv_rosapi_topic_type = new ROSLIB.Service({
        ros : this.ros,
        name : '/rosapi/topic_type',
        serviceType : 'rosapi/TopicType'
      });
    },
    requestTopicType: function(topic_name, callback){
      var rqst_topic_type = new ROSLIB.ServiceRequest({
        topic : topic_name
      }); 
      
      this.srv_rosapi_topic_type.callService(rqst_topic_type, callback);
    },

    initSrvRosapiGetTime: function() {
      this.srv_rosapi_get_time = new ROSLIB.Service({
        ros : this.ros,
        name : '/rosapi/get_time',
        serviceType : 'rosapi/GetTime'
      });
    },
    requestRosTime: function(callback){
      var rqst = new ROSLIB.ServiceRequest({});
      
      this.srv_rosapi_get_time.callService(rqst, callback);
    },
    timeToSec: function(timestamp){
      return timestamp.secs*1.0+timestamp.nsecs/1000000000.0;
    },
  });
});
