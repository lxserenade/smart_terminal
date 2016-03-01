function chart(){
        //http://bl.ocks.org/godds/ec089a2cf3e06a2cd5fc
     var data = [];
     category = $('#category_filter').val()
     terminal_name = $('#location_filter').val()
     
      $.ajax({
            url: "/ajax/click_statistic/?category="+category+"&terminal_name="+terminal_name+"&sortby=date",
            type: "get",
            dataType: "json",
            success: function (d) {
                d.forEach(function(item){
                    tmp={}
                    tmpdate = new Date(item.date);
                    tmp.date = new Date(tmpdate.getFullYear()+'-'+ (tmpdate.getMonth()+1) + '-'+tmpdate.getDate());
                    tmp.total = item.click;
                   data.push(tmp);
                })
                //draw 
                console.log(data)
                
                pure_data=[]
                data.forEach(function(d){
                    pure_data.push(d.total)
               })
               console.log(pure_data); 


                d3.select('.page svg').remove()
                // sizing information, including margins so there is space for labels, etc
                var margin =  { top: 80, right: 20, bottom: 100, left: 160 },
                    width = 1160 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom,
                    marginOverview = { top: 430, right: margin.right, bottom: 20,  left: margin.left },
                    heightOverview = 500 - marginOverview.top - marginOverview.bottom;

                // set up a date parsing function for future use
                var parseDate = d3.time.format("%y-%m-%d").parse;

                // some colours to use for the bars
                var colour = d3.scale.ordinal()
                                    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

                // mathematical scales for the x and y axes
                var x = d3.time.scale()
                                .range([0, width]);
                var y = d3.scale.linear()
                                .range([height, 0]);
                var xOverview = d3.time.scale()
                                .range([0, width]);
                var yOverview = d3.scale.linear()
                                .range([heightOverview, 0]);

                // rendering for the x and y axes
                var xAxis = d3.svg.axis()
                                .scale(x)
                                .orient("bottom").tickFormat(d3.time.format("%m/%d"));
                var yAxis = d3.svg.axis()
                                .scale(y)
                                .orient("left");
                var xAxisOverview = d3.svg.axis()
                                .scale(xOverview)
                                .orient("bottom").tickFormat(d3.time.format("%Y-%m"));;;

                // something for us to render the chart into
                var svg = d3.select(".page")
                                .append("svg") // the overall space
                                    .attr("width", width + margin.left + margin.right)
                                    .attr("height", height + margin.top + margin.bottom);
                var main = svg.append("g")
                                .attr("class", "main")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var overview = svg.append("g")
                                    .attr("class", "overview")
                                    .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

                // brush tool to let us zoom and pan using the overview chart
                var brush = d3.svg.brush()
                                    .x(xOverview)
                                    .on("brush", brushed);


                 // data ranges for the x and y axes
                x.domain(d3.extent(data, function(d) { return d.date; }));
                y.domain([0, d3.max(data, function(d) { return d.total; })]);
                xOverview.domain(x.domain());
                yOverview.domain(y.domain());

                // data range for the bar colours
                // (essentially maps attribute names to colour values)
                // colour.domain(d3.keys(data[0]));

                // draw the axes now that they are fully set up
                main.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
                main.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);
                overview.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + heightOverview + ")")
                    .call(xAxisOverview);

                // draw the bars
                main.append("g")
                        .attr("class", "bars")
                    // a group for each stack of bars, positioned in the correct x position
                    .selectAll(".bar.stack")
                    .data(data)
                    .enter().append("rect")
                        .attr("class", " bar stack")
                        .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
                        .attr("width", 15)
                        .attr("y", function(d) { return y(d.total); })
                        .attr("height", function(d) { return height-y(d.total); })
                
                main.append("text")
                        .attr("class", "x label")
                        .attr("text-anchor", "end")
                        .attr("x", width)
                        .attr("y", height - 6)
                        .text("日期");
                main.append("text")
                        .attr("class", "y label")
                        .attr("text-anchor", "end")
                        .attr("x", 40)
                        .attr("y", -6)
                        .attr("dy", ".75em")
                        .attr("transform", "rotate(0)")
                        .text("点击量");                 

                    overview.append("g")
                            .attr("class", "bars")
                    .selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return xOverview(d.date) - 3; })
                        .attr("width", 6)
                        .attr("y", function(d) { return yOverview(d.total); })
                        .attr("height", function(d) { return heightOverview - yOverview(d.total); });

                // add the brush target area on the overview chart
                overview.append("g")
                            .attr("class", "x brush")
                            .call(brush)
                            .selectAll("rect")
                                // -6 is magic number to offset positions for styling/interaction to feel right
                                .attr("y", -6)
                                // need to manually set the height because the brush has
                                // no y scale, i.e. we should see the extent being marked
                                // over the full height of the overview chart
                                .attr("height", heightOverview + 7);  // +7 is magic number for styling         



                //define functions
                 // by habit, cleaning/parsing the data and return a new object to ensure/clarify data object structure
                    function parse(d) {
                        var value = { date: parseDate(d.date) }; // turn the date string into a date object

                        // adding calculated data to each count in preparation for stacking
                         
                        // quick way to get the total from the previous calculations
                        value.total = d.total;
                        console.log(value);
                        return value;
                    }

                    // zooming/panning behaviour for overview chart
                    function brushed() {
                        // update the main chart's x axis data range
                        x.domain(brush.empty() ? xOverview.domain() : brush.extent());
                        // redraw the bars on the main chart
                        main.selectAll(".bar.stack")
                                .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
                        // redraw the x axis of the main chart
                        main.select(".x.axis").call(xAxis);
                    }

                //end define  
            }
           
    
        });  //end ajax
    } 

function cat_query(name){
     $("#category_filter").val(name)

        chart()                      
}

function loc_query(name){
        $("#location_filter").val(name)

        chart()      
}

$(document).ready(function(){

     //获取业务名列表
     $.ajax({
            url: "/ajax/categories",
            type: "get",
            dataType: "json",
            success: function (d) {
                for(var i = 0;i<d.categories.length;i++){
                         $('#cat-filter-modal').append('<a  data-dismiss="modal" onclick=\'cat_query("'+ d.categories[i] +'")\'>' + d.categories[i] +'</a>')
                }
            }
        });
    //获取位置列表
     $.ajax({
            url: "/ajax/locations",
            type: "get",
            dataType: "json",
            success: function (d) {
                for(var i = 0;i<d.locations.length;i++){
                        $('#loc-filter-modal').append('<a  data-dismiss="modal" onclick=\'loc_query("'+ d.locations[i] +'")\'>'+d.locations[i]+'</a>')         
                }
            }
        });

chart();
    


})