
var settings = {
  get: function (key, cb) {
    chrome.storage.sync.get(key, cb)
  },
  set: function (key, value, cb) {
    chrome.storage.sync.set({key: value}, cb);
  }  
}