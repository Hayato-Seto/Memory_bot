// line developersに書いてあるChannel Access Token
var access_token = "*****"

//sheetの登録
var ss = SpreadsheetApp.openById("***ID***")
var sheet = ss.getSheets()[0]
var sheet_2 = ss.getSheets()[1]

//Postに反応する関数
function doPost(e) {
    var json = JSON.parse(e.postData.contents).events[0];
    var j_mes = json.message.text //textの抽出, type : str
    var replyToken = json.replyToken //tokenの生成, 定型文
    
    if(j_mes.match(/@add/) !== null) {
      message = j_mes.substr(5);

      add_message = add_(message);
      reply(replyToken, add_message);　//substrで入力文字を整形, 関数に渡して実行

    } else if(j_mes.match(/@list/) !== null) {
      list_message = list_();
      reply(replyToken, list_message);

    } else if(j_mes.match(/@total/) !== null){
      message = j_mes.substr(7);

      total_message = total_(message);
      reply(replyToken, total_message);

    } else if(j_mes.match(/@cut/) !== null){
      message = j_mes.substr(5);

      cut_message = cut_(message);
      reply(replyToken, cut_message);

    } else if(j_mes.match(/@bot/) !== null){
      bot_message = bot_();
      reply(replyToken, bot_message);

    } else {
      return; //@~~~が無かった時の対処, 何もしない
    }
}

function add_(mes){
  var add_text = mes + "\nadd complete!!"
  var split_mes = mes.split("\n") //改行に分割, type : array

  sheet.appendRow(split_mes) //sheetの一番下に配列の要素を挿入, 入力は配列
  sheet_2.appendRow(split_mes)

  return add_text
}

function list_(){
  var list_text = ""
  var values =[]

  //データの取得, 空のデータでなければvaluesにデータが入る
  var data = sheet.getRange(1, 1, 40, 2).getValues()
  for(let i = 0; i < 40; i++){
    if(typeof(data[i][0]) === "string" || typeof(data[i][0]) === "number"){
      var data_1 = data[i][0]
    } else {
      var data_1 = ""
    }
    if(typeof(data[i][1]) === "string" || typeof(data[i][1]) === "number"){
      var data_2 = data[i][1]
    } else {
      var data_2 = ""
    }
    var judge = data_1 === "" && data_2 === ""
    if(judge === false){
      values.push([data_1, data_2])
    }
  }
  //配列を単一のtextに変換
  var d_va = values.length //distance value

  //valuesの長さが1の時は分岐させてfor文に入れないようにする
  if(d_va >= 2){
    for(let i = 1; i <= d_va -1; i++){
      list_text = list_text + i.toString() + "  " + values[i-1][0] + "  " + values[i-1][1] + "\n";
      }
  }
  list_text = list_text + d_va.toString() + "  " + values[d_va -1][0] + "  " + values[d_va -1][1]
  return list_text
}

function total_(mes){
  var amount = parseInt(mes)
  var sum = 0
  var breakr = 0
  
  //amountが数字じゃなければ2列目のtotalを返すようにamountに2を代入
  if(isNaN(amount)){
    amount = 2
  }

  for(let i = 1;; i++){
    var values = sheet.getRange(i, amount).getValues()
    var values_num = parseInt(values[0])

    //数字以外はsumに入れないようにする, かつ, breakrを増やして数字以外が6個になったらbreakで離脱
    if(isNaN(values_num) === false){
      sum = sum + values_num
    } else {
      breakr = breakr + 1

      if(breakr > 5){
        break;
      }
    }
  }
  var total_text = sum.toString() //sumは和の計算, toString()でtextに変換
  return total_text
}

function cut_(mes){
  var amount = parseInt(mes)
  
  //totalと同様
  if(isNaN(amount) === false){
    var range = sheet.getRange(amount, 1, 1, 2)
    var values = range.getValues() //履歴を残すためにデータを取得

    var cut_text = mes + "th index\ncut complete!!"

    //[[a,b]]のようになっているので有効なarrayに変換
    var archive = new Array(2)
    for(let i = 0; i < 2; i++){
      archive[i] = values[0][i]
    }
    sheet_2.appendRow(archive)
    sheet_2.appendRow(["^/cut","^/cut"]) //cutの目印

    range.deleteCells(SpreadsheetApp.Dimension.ROWS) //縦に詰める, 横ならCOLUMNS

  } else {
    var cut_text = "at cut, value error : \nWhat is expected is a valid number."
  }
  return cut_text
}

//commandの表示
function bot_(){
  var bot_mes = "$ command list $\n\n@add\ntext\ntext(number)\n\n@list\n\n@total\n(number, default -> 2)\n\n@cut\nindex number\n\nchoose command!!"
  return bot_mes
}

//replyの定型文, 第2引数のtextをそのまま送信, botのメッセージになる
function reply(token, replyText){
 var url = "https://api.line.me/v2/bot/message/reply";

 var headers = {
   "Content-Type" : "application/json; charset=UTF-8",
   "Authorization" : "Bearer " + access_token
 };
 var postData = {
   "replyToken" : token,
   "messages" : [{
     "type" : "text",
     "text" : replyText
   }]
 };
 var options = {
   "method" : "POST",
   "headers" : headers,
   "payload" : JSON.stringify(postData)
 };
 return UrlFetchApp.fetch(url, options);  
}
