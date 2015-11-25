var request = require("request");
var fs = require("fs");
var sessionid ='<SESSION ID FROM COMICS.IO>';
var url = 'https://comics.io/lunchdb/2015/11/25/';
var baseUrl = 'https://comics.io';


var options = {
  url: url,
  headers : {
    "Cookie": "sessionid="+sessionid
  }
};

var imgUrlregex = /<img src="(.*?)"/
var imgNameRegex = /.*\/(.*)$/
var previousRegex = /<a href="([^"]*?)" class="btn btn-primary " id="prev"/

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var imgUrl = imgUrlregex.exec(body);
    var imgName = imgNameRegex.exec(imgUrl[1]);
    var prevImg = previousRegex.exec(body);
    request(imgUrl[1]).pipe(fs.createWriteStream("stripes/" + imgName[1]));
    if(!prevImg[1]) { return; }
    url = baseUrl + prevImg[1];
    options.url = url;
    request(options, callback);
  }
}

request(options, callback);
