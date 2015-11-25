var request = require("request");
var fs = require("fs");
var sessionid ='<SESSION ID FROM COMICS.IO>';
var urls = ['/lunchdb/2015/11/18/', '/lunch/2013/6/28/', '/lunche24/2015/11/24/', '/lunchtu/2015/11/24/'];
var baseUrl = 'https://comics.io';


for (var i = 0; i < urls.length; i++) {
  crawl(urls[i]);
}

function crawl(url) {
  var options = {
    url: baseUrl + url,
    headers : {
      "Cookie": "sessionid="+sessionid
    }
  };

  var imgUrlregex = /<img src="(.*?)".*?alt="([^"]*?)"/;
  var previousRegex = /<a href="([^"]*?)" class="[^"]*?" id="prev"/;
  var latestRegex = /<a href="([^"]*?)" class="[^"]*?" id="last"/;
  var extensionRegex = /.+\.([^?]+)(\?|$)/;

  function findLatest(error, response, body) {
    if (!error && response.statusCode == 200) {
      var lastUrl = latestRegex.exec(body);
      if(!lastUrl){
        //already on latest
      }
      else {
        options.url = baseUrl + lastUrl[1];
      }
      request(options, crawl);
    }
  }

  function crawl(error, response, body) {
    if (!error && response.statusCode == 200) {
      var imgUrl = imgUrlregex.exec(body);
      var imgDate = imgUrl[2].split(" ")[1].replace("/", "-") +"."+ extensionRegex.exec(imgUrl[1])[1];
      var prevImg = previousRegex.exec(body);
      var path = "comics/" + imgDate;

      try {
        fs.accessSync(path);
        console.log("Already downloaded this comic, and subsequent ones if crawler has been run correctly.")
        return;
      } catch(ex) {

      }
      request(imgUrl[1]).pipe(fs.createWriteStream(path));
      if(!prevImg) { return; }
      url = baseUrl + prevImg[1];
      options.url = url;
      request(options, crawl);
    }
  }

  request(options, findLatest);
}
