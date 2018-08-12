$(function(){
  
  chrome.storage.sync.get('limit', function(b){
    $('#limit').val(b.limit)
  })

  $('#saveLimit').click(function(){
    var limit = $('#limit').val()
    if(limit) {
      chrome.storage.sync.set({'limit': limit}, function() {
        close();
      });
    }
  });

  $('#restTotal').click(function(){
    chrome.storage.sync.set({'total':0})
  })

  $("#signin").submit(function(e) {
    e.preventDefault()
    var data = $(this).serializeArray()
    $.ajax({

    })
  })
});