browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    console.log("Received msg: ", msg, sender.tab, sender.frameId);
    sendResponse("Gotcha!");
});