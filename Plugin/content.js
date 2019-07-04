var msg = document.getElementsByClassName("TweetTextSize TweetTextSize--jumbo js-tweet-text tweet-text")[0].innerHTML;
browser.runtime.sendMessage(msg, function(response) {
    console.log("Response: ", response);
});