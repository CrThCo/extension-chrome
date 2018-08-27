$(function(){

  chrome.storage.sync.set({'API': 'http://localhost:5000/v1/'}, function() {})
  GetUserDetail()
  
  $('#profile').on('click','#unlinkAccount', function(e) {
    e.preventDefault()
    $("#profile").hide()
    $("#singin-form").show()
    chrome.storage.sync.set({'authtoken': ''}, function(){
      console.log('removed')
    })
  })

  $("#singin-form").on('submit', function(e){
    e.preventDefault()
    var loginData = {
      email: $('input[name="email"]').val(),
      password: $('input[name="password"').val()
    }    
    settings.get('API', function(r) {      
      var url =  `${r.API}user/signin`
      $.ajax({
        url: url,
        data: JSON.stringify(loginData),
        method: 'POST',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Content-Type', `application/json`)
        },
        success: function(res){
          if (res.token != undefined) {
            chrome.storage.sync.set({'authtoken': res.token}, function() {
            })
            $('#singin-form').hide()
            $("#error").html("<div class='alert alert-success'>Login successful!</div>")
            GetUserDetail()
          } else {
            $("#error").html("<div class='alert alert-error'>Error! invalid credentials!</div>")
          }
        },
        error: function(err) {
          $('#debug').html(JSON.stringify(err, null, ' '))
          $("#error").html("<div class='alert alert-error'>Error! invalid credentials!</div>")    
        }
      })
    })
  })
});