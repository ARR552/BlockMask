var message;
browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    message = msg;
    sendResponse("Gotcha!");
});
