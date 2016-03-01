



$(document).ready(function(){


    function refresh(page){
         category = $('#category_filter').val()
         terminal_name = $('#location_filter').val()
         lists = []
         $('#list_table tbody').empty()
         $.ajax({
                url: "/ajax/get_list/?page="+page,
                type: "get",
                dataType: "json",
                success: function (d) {
                    pageNum = d.pageNum;
                    $('#pagination').pagination({totalPage: pageNum});
                    $('#pagination').show();
                    d.data.forEach(function(item){
                        $('#list_table tbody').append("<tr><td>"+item.institution+"</td>"
                                                      +"<td>"+item.terminal_name+"</td>"
                                                      +"<td>"+item.terminal_id+"</td>"
                                                      +"<td>"+item.category+"</td>"
                                                      +"<td>"+item.click+"</td>"
                                                      +"<td>"+item.date+"</td></tr>")
                    

                    });     
            }});
    }

    //初始化刷新内容列表
   refresh(1)
   $('#pagination').hide()
   $('#pagination').pagination({
                  callback: function(currentPage){
                    refresh(currentPage)
                    console.log(pageNum)
                    $('.current-page').text(currentPage)
                  }
                    });
    
})