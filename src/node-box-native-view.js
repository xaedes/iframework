$(function(){

  var template = '<div class="info" />';

  Iframework.NodeBoxNativeView = Backbone.View.extend({
    tagName: "div",
    className: "nativenode",
    template: _.template(template),
    info: {
      title: "native-node-view",
      description: "extend me"
    },
    inputs: {},
    outputs: {},
    initialize: function () {
      this.render();

      // Info
      this.model.infoLoaded(this.info);

      // Ports
      for (var inputname in this.inputs) {
        if (this.inputs.hasOwnProperty(inputname)) {
          var inInfo = this.inputs[inputname];
          inInfo.name = inputname;
          this.model.addInput(inInfo);
        }
      }
      for (var outputname in this.outputs) {
        if (this.outputs.hasOwnProperty(outputname)) {
          var outInfo = this.outputs[outputname];
          outInfo.name = outputname;
          this.model.addOutput(outInfo);
        }
      }

      this.initializeCategory();
      this.initializeModule();

      this.waitForSignals = [];

      return this;
    },
    initializeCategory: function(){
      // for example, override in nodes/image.js
    },
    initializeModule: function(){
      // for example, override in nodes/image-combine.js
    },
    render: function () {
      this.$el.html(this.template(this.model));
      return this;
    },
    redraw: function (timestamp) {
      // Do everything that will cause a redraw here
    },
    _triggerRedraw: false,
    _lastRedraw: 0,
    renderAnimationFrame: function (timestamp) {
      // Get a tick from GraphView.renderAnimationFrame()
      // this._triggerRedraw is set by NodeBox.receive()
      if (this._triggerRedraw && this.waitForSignals.length===0) {
        this._triggerRedraw = false;
        this.redraw(timestamp);
        this._lastRedraw = timestamp;
      }
    },
    set: function (name, value) {
      // Sets own state, use sparingly with direct user input 
      this.model.setValue(name, value);
    },
    send: function (name, value) {
      if (this.sentSignalID===null) {
        this.sentSignalID = this.model.id;
      }
      this.model.trigger("pulse", this.sentSignalID);
      this.model.send(name, value, this.sentSignalID);
      this.sentSignalID = null;
    },
    receive: function (name, value, signalID) {
      if (this["input"+name]){
        this["input"+name](value);
        // Must manually set _triggerRedraw in that function if needed
      } else {
        this["_"+name] = value;
        // Will trigger a NodeBoxNativeView.redraw() on next renderAnimationFrame
        this._triggerRedraw = true;
      }
      if (signalID!==undefined) {
        // Remove this signal from wait array
        var index = this.waitForSignals.indexOf(signalID);
        if (index!==-1){
          this.waitForSignals.splice(index,1);
          if (this._triggerRedraw && this.waitForSignals.length === 0) {
            // Don't need to wait for RAF pulse from iframework
            this.renderAnimationFrame();
          }
        }
      }
    },
    sentSignalID: null,
    pulse: function (id) {
      if (this.waitForSignals.indexOf(id)===-1){
        // Add this to wait list
        this.waitForSignals.push(id);
        if (this.sentSignalID === null) {
          // Pass on pulse
          var pulse = id + "-" + this.model.id;
          this.model.trigger("pulse", pulse);
          this.sentSignalID = pulse;
        }
      } else {
        // Already waiting for that
      }
    },
    toString: function() {
      return this.model.get("id")+":"+this.info.title;
    },
    resize: function(w,h) {
      // Called from NodeBoxView.resizestop()
    },
    connectEdge: function(edge) {
      // Called from Edge.connect();
    },
    disconnectEdge: function(edge) {
      // Called from Edge.disconnect();
    },
    remove: function(){
      // Called from NodeBoxView.remove();
    }

  });

});
