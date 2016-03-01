function draw(data){
                $('.page').empty();
                //draw
               var margin = {top: 40, right: 20, bottom: 150, left: 80},
                    width = 1360 - margin.left - margin.right,
                    height = 600 - margin.top - margin.bottom;

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

function cat_query(name){
     $("#category_filter").val(name)

        chart()                      
}

function loc_query(name){
        $("#location_filter").val(name)

        chart()      
}

function cat_list(){
    selected_cat={}
    selected_cat.list=[]
    $('.cat-select input').each(function(d){
        if($(this)[0].checked){
            selected_cat.list.push($(this).next()[0].innerHTML)
        }
    });
    return selected_cat
}

function loc_list(){
    selected_loc={}
    selected_loc.list=[]
    $('.loc-select input').each(function(d){
        if($(this)[0].checked){
            selected_loc.list.push($(this).next()[0].innerHTML)
        }
    });
    return selected_loc
}

function query(){

    if (!$('#datetimepicker1').data("DateTimePicker").date()){
        alert('请选择时间');
        return;
    }
    date1 = $('#datetimepicker1').data("DateTimePicker").date().format('GGGG-MM-DD');
    
    if (!$('#datetimepicker2').data("DateTimePicker").date()){
        alert('请选择时间');
        return;
    }
    date2 = $('#datetimepicker2').data("DateTimePicker").date().format('GGGG-MM-DD');

   selected_loc = loc_list();
   selected_cat = cat_list();
   date_average_enable = $('#date_average_enable')[0].checked
   loc_average_enable = $('#loc_average_enable')[0].checked
    
    //位置缺省全选
   if(selected_loc.list.length === 0){
       $('.loc-select a').each(function(d){
            selected_loc.list.push($(this).text());
        });
   }
    //业务缺省全选
   if(selected_cat.list.length === 0){
       $('.cat-select a').each(function(d){
            selected_cat.list.push($(this).text());
        });
   }


   query_para = {}
   query_para.startDate = date1
   query_para.endDate = date2
   query_para.selected_loc = selected_loc;
   query_para.selected_cat=selected_cat;
   query_para.date_average_enable = date_average_enable;
   query_para.loc_average_enable = loc_average_enable;

    //提交查询条件 返回数据
   $.ajax({
            url: "/ajax/compound_query",
            type: "post",
            data:query_para,
            dataType: "json",
            success: function (d) {
               pure_data=[]
               d.forEach(function(d){
                    pure_data.push(d.click)
               })
               console.log(pure_data); 
             
                draw(d)
            }
        });
}
$(document).ready(function(){
    
    $('#datetimepicker1').datetimepicker({
                    format: 'GGGG-MM-DD'
                });
    $('#datetimepicker1').data("DateTimePicker").defaultDate('2015-04-01')

    $('#datetimepicker2').datetimepicker({
                    format: 'GGGG-MM-DD'
                });
    $('#datetimepicker2').data("DateTimePicker").defaultDate('2015-09-01')
    
     //获取业务名列表
     $.ajax({
            url: "/ajax/categories",
            type: "get",
            dataType: "json",
            success: function (d) {
                for(var i = 0;i<d.categories.length;i++){
                         $('#cat-filter-modal').append('<div class="cat-select"><input name="checkbox" type="checkbox"><a >' + d.categories[i] +'</a><div>')
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
                        $('#loc-filter-modal').append('<div class="loc-select"><input name="checkbox" type="checkbox"><a >'+d.locations[i]+'</a></div>')         
                }
            }
        });

     $("#cat-filter").on('hidden.bs.modal',function(){

         $(".selected-cat").empty();
         $('.cat-select input').each(function(d){
         if($(this)[0].checked){
           $(".selected-cat").append($(this).next()[0].innerHTML+' ')
            }

         });
        if(   $(".selected-cat").text() === '' ){
             $(".selected-cat").text('默认全选');
         }     
        
     })

       $("#loc-filter").on('hidden.bs.modal',function(){
        $(".selected-loc").empty();
         $('.loc-select input').each(function(d){
        
         if($(this)[0].checked){
           $(".selected-loc").append($(this).next()[0].innerHTML+' ')
            }
       
         });
          if(   $(".selected-loc").text() === '' ){
             $(".selected-loc").text('默认全选');
         }     
     })
    


})