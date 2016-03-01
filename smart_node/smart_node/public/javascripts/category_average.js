function chart(){
   $.ajax({
            url: "/ajax/category_average",
            type: "get",
            dataType: "json",
            success: function (d) {
               console.log(d)
               data = []
			   d.forEach(function(item){
                   tmp={};
                   tmp.category = item._id;
                   tmp.total = item.avg;
                   data.push(tmp);
                })	
			   	$('.page').empty();
				//draw
               var margin = {top: 40, right: 20, bottom: 500, left: 60},
				    width = 1160 - margin.left - margin.right,
				    height = 1000 - margin.top - margin.bottom;

				var x = d3.scale.ordinal()
				    .rangeRoundBands([0, width], .1);

				var y = d3.scale.linear()
				    .rangeRound([height, 0]);

				var color = d3.scale.ordinal()
				    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
				    .tickFormat(d3.format(".2s"));

				var svg = d3.select(".page").append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				    .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


				  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "category"; }));

				  data.forEach(function(d) {
				    var y0 = 0;
				    d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
				    d.total = d.ages[d.ages.length - 1].y1;
				  });

				  data.sort(function(a, b) { return b.total - a.total; });

				  x.domain(data.map(function(d) { return d.category; }));
				  y.domain([0, d3.max(data, function(d) { return d.total; })]);

				  svg.append("g")
				      .attr("class", "x axis")
				      .attr("transform", "translate(0," + height + ")")
				      .call(xAxis)
				      .selectAll("text")  
				    .style("text-anchor", "end")
				    .attr("dx", "-.8em")
				    .attr("dy", "-.25em")
				    .attr("transform", function(d) {
				        return "rotate(-90)" 
				    });

				  svg.append("g")
				      .attr("class", "y axis")
				      .call(yAxis)
				    .append("text")
				      .attr("transform", "rotate(0)")
				      .attr("y", -20)
				      .attr("dy", ".41em")
				      .style("text-anchor", "end")
				      .text("点击量");

				  var category = svg.selectAll(".category")
				      .data(data)
				    .enter().append("g")
				      .attr("class", "g")
				      .attr("transform", function(d) { return "translate(" + x(d.category) + ",0)"; });

				  category.selectAll("rect")
				      .data(function(d) { return d.ages; })
				    .enter().append("rect")
				      .attr("width", x.rangeBand())
				      .attr("y", function(d) { return y(d.y1); })
				      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
				      .style("fill", function(d) { return color(d.name); });

				  var legend = svg.selectAll(".legend")
				      .data(color.domain().slice().reverse())
				    .enter().append("g")
				      .attr("class", "legend")
				      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

				  legend.append("rect")
				      .attr("x", width - 18)
				      .attr("width", 18)
				      .attr("height", 18)
				      .style("fill", color);

				  legend.append("text")
				      .attr("x", width - 24)
				      .attr("y", 1)
				      .attr("dy", ".02em")
				      .style("text-anchor", "end")
				      .text(function(d) { return d; });
	
    		}
	});
		
    
}


$(document).ready(function(){

     chart()
});