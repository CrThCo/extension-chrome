# Connect Chrome Extension

## To change the server address

```
Path: js/popup.js
Line#: 3
```
Change the default address `http://95.142.171.58:5050/v1/` to your desired one.

```javascript
chrome.storage.sync.set({'API': 'http://95.142.171.58:5050/v1/'}, function() {})
```
