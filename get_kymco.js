var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs'); //載入node.js的檔案系統模組
var saveFile = "kymco.csv";
var leadingCode = "kymco";

// 全台百貨公司-電話-地址

var urls = [
  ["http://www.kymco.com.tw/locations/scooter/%e5%9f%ba%e9%9a%86%e5%b8%82", "基隆市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e6%96%b0%e5%8c%97%e5%b8%82", "新北市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%8f%b0%e5%8c%97%e5%b8%82", "台北市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e6%a1%83%e5%9c%92%e5%b8%82", "桃園市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e6%96%b0%e7%ab%b9%e5%b8%82", "新竹市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e6%96%b0%e7%ab%b9%e7%b8%a3", "新竹縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e8%8b%97%e6%a0%97%e7%b8%a3", "苗栗縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%8f%b0%e4%b8%ad%e5%b8%82", "台中市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%bd%b0%e5%8c%96%e7%b8%a3", "彰化縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%8d%97%e6%8a%95%e7%b8%a3", "南投縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e9%9b%b2%e6%9e%97%e7%b8%a3", "雲林縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%98%89%e7%be%a9%e5%b8%82", "嘉義市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%98%89%e7%be%a9%e7%b8%a3", "嘉義縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%8f%b0%e5%8d%97%e5%b8%82", "台南市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e9%ab%98%e9%9b%84%e5%b8%82", "高雄市", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%b1%8f%e6%9d%b1%e7%b8%a3", "屏東縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e9%87%91%e9%96%80%e7%b8%a3", "金門縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e6%be%8e%e6%b9%96%e7%b8%a3", "澎湖縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%ae%9c%e8%98%ad%e7%b8%a3", "宜蘭縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e8%8a%b1%e8%93%ae%e7%b8%a3", "花蓮縣", false]
, ["http://www.kymco.com.tw/locations/scooter/%e5%8f%b0%e6%9d%b1%e7%b8%a3", "台東縣", false]
];

var urlsLength = urls.length;
var txtFileData = "";

// 取得網頁資料
for(ss=0;ss<urlsLength;ss++) {
	requestCall(ss);
}

function requestCall(urlID){
  console.log('Process : ' + urls[urlID][1]);
  request(urls[urlID][0], function (error, response, body) {
    if (!error) {
    leadingCode = urls[urlID][1];
      // 用 cheerio 解析 html 資料
      var $ = cheerio.load(body);

      // 篩選有興趣的資料
      var allTable = $("#locations-table");
      console.log("## Len = [" + allTable.length  + "]");
      for(ii=0;ii<allTable.length;ii++) {
        var tagTR = $("tr", allTable[ii]);
        var tagTR_length = tagTR.length;
        console.log("## Table[" + ii + "] -> tagTR.length = [" + tagTR_length  + "]");

        if(tagTR_length > 1) { // 略過標題欄位列
          for(jj=0;jj<tagTR.length;jj++) {
            // var tagTD = $("td", tagTR[jj]);
            // var szName =  $(tagTD[0]).text().trim();
            var szName =  $("td[data-title='經銷商名稱']", tagTR[jj]).text().trim();
            var szAdd =  $("td[data-title='地址']", tagTR[jj]).text().trim();
            var szTel =  $("td[data-title='電話']", tagTR[jj]).text().trim();

            txtFileData = txtFileData + leadingCode  + "," + szName + "," + szTel + "," + szAdd + "\r\n";
            console.log("## insert = [" + leadingCode + "," + szName + "," + szTel + "," + szAdd + "]");
          }
        }

      }
      urls[urlID][2] = true;
      console.log(" [" + urls[urlID][1] + "] 資料處理完畢!");
    } else {
      console.log(" [" + urls[urlID][1] + "] 資料擷取錯誤(" + error + ")");
    }
  });
}

function checkEndJob(){
  console.log('Check ..');
  for(cc=0;cc<urlsLength;cc++) {
    // 檢查所有的TAG是否均已設為 True
    if(!urls[cc][2]) return;
  }
  // 輸出檔案
  fs.writeFile(__dirname+'/'+saveFile,txtFileData,'utf8',function(error){ //把資料寫入檔案
    if(error){ //如果有錯誤，把訊息顯示並離開程式
      console.log('檔案寫入錯誤');
    }
  });
  // 關閉間隔排程
  clearInterval(intervalId);
}

// 啟動間隔排程
var intervalId = setInterval(checkEndJob, 1500);

