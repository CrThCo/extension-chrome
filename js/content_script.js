window.onload = function () {
  chrome.runtime.onMessage.addListener(function (r, s, sr) {
    sr({
      text: 'Thanks received!'
    })
    $(`#connect_${r.target}`).html('')
    var canvas = document.getElementById('image');
    var context = canvas.getContext('2d');
    var imageObj = new Image();
    imageObj.onload = function () {
      var sourceX = r.meta.left + 2;
      var sourceY = r.meta.top;
      var sourceWidth = r.meta.width - 2;
      var sourceHeight = r.meta.height - 1;
      var destWidth = sourceWidth;
      var destHeight = sourceHeight;
      var destX = canvas.width / 2 - destWidth / 2;
      var destY = canvas.height / 2 - destHeight / 2;
      
      context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    };
    imageObj.src = r.data;
  })

  function appendConnectAction (el, id) {
    if (typeof id !== 'undefined') {             
      const element =  connectElement(id)
      if (el.find('div.signed_with_connect_wpr').length === 0) {
        el.get(0).appendChild(element)
      }
    }
  }

  function findActionsOfStatusPupup() {
    const tweet = $('.permalink-tweet-container').find('.tweet')
    const id = tweet.attr('data-item-id')
    const actions = tweet.find('div.stream-item-footer').find('div.js-actions') 
    appendConnectAction(actions, id)
  }

  function findActionsOfStreamItems () {
    $('ol#stream-items-id').children().each(function (i, v) {
      let id = $(v).attr('data-item-id')
      
      // Finding reply on tweet
      if (typeof id === 'undefined') {
        const r = $(v).find('li')
        if (r.length > 0) {
          id =  r.attr('data-item-id')
        }
      }

      if (typeof id !== 'undefined') {
        const actions = $(v).find('div.tweet')
          .find('div.content')
          .find('div.stream-item-footer')
          .find('div.js-actions')
        appendConnectAction(actions, id)
      }

    });
  }

  $('body').append(connectStyle())
  $(function () {
    setInterval(function () {      
      // Stream
      findActionsOfStreamItems()
      // Status
      findActionsOfStatusPupup()     
    }, 2000)

    $('body').on('click', 'div.connect-modal-close', function () {
      $('div.connect-model-overlay').remove()
    })
  })
}