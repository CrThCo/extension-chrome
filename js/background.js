console.log('background script ....')




chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    "id": "sampleContextMenu",
    "title": "Sample Context Menu",
    "contexts": ["selection"]
  });
});


chrome.runtime.onMessage.addListener(function (request, sender, sr) {
  const action = request.action
  if (action === "capture") {
    chrome.tabs.captureVisibleTab(null, {
      format: "jpeg",
      quality: 100
    }, function (data) {    
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'capture',
        data: data,
        target: request.target,
        meta: request.meta
      }, {}, function (r) {
        console.log(r)
      })
    });
  }
})

setInterval(refreshAuthToken, 600000)