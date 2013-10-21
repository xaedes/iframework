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
  });
});
