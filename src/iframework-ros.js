$(function(){

  Iframework.ros = {
    SensorChart: Backbone.Model.extend({
        /**
            Assumes data to be sorted by time
        */
        defaults: {
            "margin": {top: 6, right: 6, bottom: 20, left: 35},  // todo are these values good?
            "width": 500,
            "height": 120,
            "time_window": 1000 * 10,       // how much data shall be displayed in [ms]
            "max_buffer": 1000 * 10,        // how much recent data shall be maximal stored in [ms]
            "close_gap": true,              // use gap closer
            "x_ticks": 10,
            "y_ticks": 5,
            // "domain": [-1,1],
            "data": []
        },
        initialize: function() {
            var self = this;
            self._container = self.get("container");
            self._margin = self.get("margin");
            self._width = self.get("width") - self._margin.right;
            self._height = self.get("height") - self._margin.top - self._margin.bottom;


            self._nav = self._default_nav();

            // scales
            self._update_scales();

            // to generate line
            self._time_offset_smooth_movement = self.now();
            self._line = d3.svg.line()
                .interpolate("linear")
                .x(function(d, i) { 
                    // return self._x(self._align_timestamp(d[0]));  // for smooth movement (disabled because of performance issues)
                    return self._x(self._relative_timestamp(d[0]));
                }) 
                .y(function(d, i) { return self._y(d[1]); });

            // main svg element
            self._svg = d3.select(self._container)
                .append("svg:svg")
                    .attr("class","SensorChart")
                    .attr("width", self._width + self._margin.left + self._margin.right)
                    .attr("height", self._height + self._margin.top + self._margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + self._margin.left + "," + self._margin.top + ")");


            // mask for path
            self._svg.append("defs").append("clipPath")
                    .attr("id", "clip")
                .append("rect")
                    .attr("width", self._width)
                    .attr("height", self._height);

            // path to display the data
            self._path = self._svg.append("g")
                .attr("clip-path", "url(#clip)")
                .append("path")
                    .data([self.get("data")])
                    .attr("class", "line")
                    .attr("d", self._line);

            
            // axes
            self._update_y_axis();
            self._update_x_axis();

            // transparent overlay (for dragging)
            self._overlay = self._svg
                .append("rect")
                    .attr("width", self._width)
                    .attr("height", self._height)
                    .attr("fill-opacity", 0)
                    ;

            // smooth movement
            // self._smooth_movement();

            self._drag = d3.behavior.drag()
                // .origin(Object)
                .on("drag", function(){
                    self._drag_handler(d3.event);
                });

            self._overlay
                .on("contextmenu", function() {
                    d3.event.preventDefault();
                    return false;
                })
                .on("dblclick", function() {
                    self._reset_nav();

                });
            self._overlay.call(self._drag);

            self._update_rate = 60.0;
            self._update_interval = 1.0 / self._update_rate;
            window.setInterval(function() {
                self._update_line();
            }, self._update_interval);
        },
        _default_nav: function() {
            return {
                x: 0,       // origin, point in data domain that is displayed at the most right border in the middle
                y: 0,
                sx: this.get("time_window"),      // size of view in data domain
                sy: 2,  // todo
            };

        },
        _reset_nav: function() {
            var self = this;
            self._nav = self._default_nav();
            self._update_scales();
            self._update_y_axis();
            self._update_x_axis();
            self._smooth_movement();
            self._update_line();
        },
        _update_scales: function() {
            var self = this;

            // self._xdomain = [-self._nav.sx,0]; 
            // self._ydomain = self.get("domain").slice();
            // self._ydomain = self.get("domain").slice();

            self._ydomain = [
                -(self._nav.sy/2)-self._nav.y,
                +(self._nav.sy/2)-self._nav.y
                ];

            self._xdomain = [
                -self._nav.sx - self._nav.x,
                0 - self._nav.x
                ];

            self._x = d3.scale.linear()
                .domain(self._xdomain)
                .range([0, self._width]);
            self._y = d3.scale.linear()
                .domain(self._ydomain)            
                .range([self._height, 0]);                    
        },
        _update_y_axis: function() {
            var self = this;

            // todo: decypher the magic inside call(..) , make it black
            self._y_axis = self._svg.selectAll("g.y.axis").data([self._nav]);
            self._y_axis.enter()
                .append("g")
                    .attr("class", "y axis");

            self._y_axis
                .call(d3.svg.axis().scale(self._y).ticks(self.get("y_ticks")).orient("left"));
        },
        _update_x_axis: function() {
            var self = this;
            self._x_axis = self._svg.selectAll("g.x.axis").data([self._nav]);
            self._x_axis.enter()
                    .append("g")
                    .attr("class", "x axis");
            self._x_axis
                    .call(d3.svg.axis()
                            .scale(self._x)
                            .ticks(self.get("x_ticks"))
                            .orient("bottom")
                            .tickFormat(function(d){
                                return d / 1000;
                            })
                            )
                    .attr("transform", function(nav){ 
                        var val = self._height/2;
                        // val += self._y.invert(nav.y);
                        val += self._y(nav.y) - self._y(0);
                        // val += nav.y;
                        val = Math.max(0,Math.min(self._height,val));
                        return "translate(0,"+val+")"; 
                    });
        },
        _update_line: function() {
            var self = this;
            self._path.attr("d", self._line);
        },
        _drag_handler: function(e) {
            var self = this;
            // d3.event.sourceEvent.stopPropagation();
            var button = e.sourceEvent.button;

            if(button === 0) {       // left button, move around
                self._nav.x += self._x.invert( e.dx ) - self._x.invert( 0 );
                self._nav.y += self._y.invert( e.dy ) - self._y.invert( 0 );
            } else if (button === 2) {   //right button, scale
                self._nav.sx += self._x.invert( e.dx ) - self._x.invert( 0 );
                self._nav.sy += self._y.invert( e.dy ) - self._y.invert( 0 );
            }

            self._update_scales();
            self._update_y_axis();
            self._update_x_axis();
            self._smooth_movement();
            self._update_line();

            e.sourceEvent.preventDefault();
            // console.log(e);
            // console.log(self._nav);
        },
        _relative_timestamp: function(timestamp) {
            var self = this;
            var val = timestamp;                            // timestamp
                
            val -= self.now();

            return val;
        },
        _align_timestamp: function(timestamp) {
            var self = this;
            var val = timestamp;                            // timestamp
            val -= self._time_offset_smooth_movement;   // align path to smooth movement transition

            if(self.get("close_gap")) {
                // most right x in graph represents current time now
                // this creates a gap between the last data point and now
                // assume new data arrives in nearly same interval
                // move graph so, that last available data point is outside the right boundary, so there is no gap
                len = self.get("data").length;
                if(len >= 2){
                    gap_closer_offset = self.get("data")[len-1][0] - self.get("data")[len-2][0];
                    val += gap_closer_offset;                   
                }
            }
            return val;
        },
        _smooth_movement: function() {
            return; //disabled because of performance issues
            var self = this;
            self._time_offset_smooth_movement = self.now();
            var interval = 1000;    
            self._path
                .attr("transform",null)
                .transition()
                    .duration(interval)
                    .ease("linear")
                    .attr("transform","translate("+(self._x(0) - self._x(interval))+")")
                    .each("end", function() {
                        self._smooth_movement();    // loop
                    })
                    ;
            self._update_line();
        },
        now: function() {
            return Number(new Date());
        },
        addSample: function(sample) {
            var self = this;
            var data = self.get("data");
            if(data.length>0) {
                // delete data beyond max_buffer, remove all items at once
                var i = 0;
                while((i < data.length)&&(self._relative_timestamp(data[i][0]) < -self.get("max_buffer"))) {
                    i++;
                }
                data.splice(0,i-1);  
            }
            data.push(sample);
            // self._update_line();
        }
    })
  };

});
