
//読み取り専用のAPI通信を遮断
//if(READ_ONLY_TIMER_ID){
//  window.clearInterval(READ_ONLY_TIMER_ID);
//}

//編集された時間を取得
var editTime;
var PING_INTERVAL = 1000;
var req1;//for ReadOnly
var req2;//for ReadOnly
//var autoReloadTimer;
var oldChecker;
var REALTIME_LOCK = false;


var fileName = getfileOwnPath();





//HTML読み込み中にこの関数を呼んでは行けない
function insertEdittime(){
  var nowDate = (new Date()).getTime();
  var headObj = document.getElementsByTagName('head')[0];
  oldChecker = document.getElementById("wfeAutoChecker");
  if(oldChecker != null)
    oldChecker.parentNode.removeChild(oldChecker);
  var editChecker = document.createElement("meta");
  editChecker.setAttribute("id","wfeAutoChecker");
  editChecker.setAttribute("content",nowDate);
  headObj.appendChild(editChecker);
}

function getEditTime(){	
  if (window.XMLHttpRequest) {
    req2 = new XMLHttpRequest();
    req2.onreadystatechange = processReqChange;
    req2.open("GET", window.location+"?"+(new Date()), true);
    req2.send(null);
  // branch for IE/Windows ActiveX version
  } else {}
}

function processReqChange(){ //ここは多分IEとかでも動く
  // only if req shows "loaded"
  
  if (req2.readyState == 4) {
    // only if "OK"
    if (req2.status == 200) {
      var loadedTextX = req2.responseText;
			
      var myReg = new RegExp('<meta id="wfeAutoChecker" content="([0-9]*)">', "i");
      var ms = loadedTextX.match(myReg);
      //alert(roadedTextX);
      if(ms != null){
        editTime = parseInt(ms[1]); //  ms[0]全体  ms[1]マッチしたグループ
        oldChecker = document.getElementById("wfeAutoChecker");
        var oldEditTime = oldChecker.getAttribute('content');
        oldEditTime = parseInt(oldEditTime);
        //window.status = oldEditTime + "," + editTime;
        if(editTime > oldEditTime){
          //					document.write(roadedTextX);
          // BODYタグ内のHTML文章の切り出し
          var html = loadedTextX;
          var a = html.indexOf('<HTML');
          if(a<0) a = html.indexOf('<html');
          var html = loadedTextX.substring(a + 5);
          a = html.indexOf('>');
          html = html.substring(a + 1);
          var b = html.lastIndexOf('</HTML>');
          if(b<0) b = html.lastIndexOf('</html>');
          html = html.substring(0, b);
          //
          // 書き換え
          //document.getElementsByTagName('html')[0].innerHTML = html;
          document.getElementsByTagName('html')[0].innerHTML = html;//+をエスケープ
          
          //
          //
          // +++ ドラッグ用などのイベント付加  +++
          
          appendTableEvent();
          init_wfe_css_append();//wfe.css 
          appendListEvent();//リストの編集
          init_wfe_css_append();//wfe.css 
          //setCommentEvent();
          
          setTimeout( "setCommentEvent();",50 );//描画遅延
          REALTIME_LOCK=false;
          
          var nowtime = (new Date()).getTime();
          var diff = nowtime -editTime;
          //console.log(",readowrite,"+diff+",");//___
        }else{
      
      }
        
      }
    } else { 
  //XML読み込み失敗時
  ////alert("processReqChange::XML読み込み失敗．");
  }
  }
}





//--------------------------------------------------------
//     APIを使った問い合わせ
function getEditTimeAPI(){
  
  if(REALTIME_LOCK) return;
  var fileName = getfileOwnPath();
  var param = "?mode=real&filename="+fileName;
  if (window.XMLHttpRequest) {
    req1 = new XMLHttpRequest();
    req1.onreadystatechange = checkUpdateFlag;
    req1.open("GET",AIRA.base_url+AIRA.realtime_url+param, true);
    req1.send(null);
  // branch for IE/Windows ActiveX version
  } else {}

}


function checkUpdateFlag(){ //ここは多分IEとかでも動く
  // only if req shows "loaded"
  
  if (req1.readyState == 4) {
    // only if "OK"
    if (req1.status == 200) {
      var response = eval("["+req1.responseText+"]");
      if(response.length > 0){
        editTime = response[0].edittime+0; //  ms[0]全体  ms[1]マッチしたグループ
        oldChecker = document.getElementById("wfeAutoChecker");
        var oldEditTime = oldChecker.getAttribute('content');
        oldEditTime = parseInt(oldEditTime);
        if(editTime > oldEditTime){          
          REALTIME_LOCK=true;
          getEditTime();
          
        }else{
      }
      }else{}  
    } else { 
  //XML読み込み失敗時
  ////alert("processReqChange::XML読み込み失敗．");
  } 
  }
}

/*
function runAutoReload(){
  autoReloadTimer = setInterval('getEditTimeAPI()',PING_INTERVAL);
  AIRA.timerID =autoReloadTimer;
  console.log("Read Write");
}

runAutoReload();
*/
