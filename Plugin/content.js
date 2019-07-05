var url = window.location.href;
var oldUrl;

window.setInterval(function(){
    if (oldUrl != url){
        oldUrl = url;
        var msg = document.getElementsByClassName("TweetTextSize TweetTextSize--jumbo js-tweet-text tweet-text")[0].innerHTML;
        browser.runtime.sendMessage(msg, function(response) {
            console.log("Response: ", response);
        });
    }
    url = window.location.href;
}, 250);

  
  

