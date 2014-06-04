<!--
AIRA_WR = true;
AIRA = {
  version :"AIRA v0.9.0 (2012/03/22)引継ぎ用",
  //base_url:"SHELLSCRIPT_INSTALL",
  base_url:"http://" + location.host,
  login_url : 'http://' + location.host + '/'+"login",
  //wfe_url : "/wfe2.cgi",
  wfe_url : "/static",
  new_url:"/upload.php",
  realtime_url:"/aira_realtime.cgi",
  login_status: {},
  login_flag :false,
  login_view :false,
  login_pass: "",
  //  ログイン後
  table: null,
  list:  null,
  dom:   null,
  reseacher: null,
  timerID:0,
  debug:false
};

// 編集対象と編集タイプ 2012-07-13 by inouer
// 編集タイプ→テキストの編集(editText)，新規コメント(insertComment)，コメントの編集と移動(editComment)
WFES={
		targetSelector:null,
		targetNode:null,
		editType:null,
		clientId: "user"+Math.floor(Math.random()*1000),
		editNum: 0
};

wfeJsDir = 'http://' + location.host +"/static"

if(AIRA.debug) console.log(AIRA.version);

var id_selector_login_float = "wfes_login";//  右クリックでログインのID
var httpRequest = false;//  Ajax の通信
//-------------------------------------------------------------------------------------

function processResult() {
  if(httpRequest.readyState == 4) {
    //すべてのデータの受信が完了した

    if(httpRequest.status == 200 || httpRequest.status == 201) {
      // リクエストの処理
      if(httpRequest.responseText != null){


        var res = eval("["+httpRequest.responseText+"]");
        AIRA.login_status = res[0];
        if(AIRA.login_status.status == 200 | AIRA.login_status.status == 300){
          //ログイン成功
          AIRA.login_flag = true;
          if(AIRA.debug)console.log(AIRA.login_status);
          login2logout();

          loginPopDel(); //メニューを消す
          init_load_wfe_js();//wfeのjsをロードする
        }else{

          AIRA.login_flag = false;
          if(AIRA.debug)console.log(AIRA.login_status);
          alert("認証に失敗しました．．再度認証するにはリロードしてください");
          logoutFunc();
        }

      } else {

    //http request responce
    }
    }else{
  //http request status
  }
  }
}

//-------------------------------------------------------------------------------------
function loginAPI(){

  if( AIRA.login_view){
    //
    var code = window.prompt("login password","");

    if(code != null){
      AIRA.login_pass = code;
      if(window.XMLHttpRequest) {
        // Firefox, Opera など
        httpRequest = new XMLHttpRequest();
        httpRequest.overrideMimeType('text/xml');
      } else if(window.ActiveXObject) {
        // IE
        try {
          httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {
          httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
        }

      }


      var loginPassword = "code="+code;
      var filePath = "filepath=" + location.pathname;
      httpRequest.open('GET', AIRA.login_url+"?"+filePath + "&" + loginPassword, true);
      httpRequest.onreadystatechange = processResult;
      httpRequest.send(null);
    }
  }
}

///  ログアウト処理
function logoutFunc(){
  var id_login = id_selector_login_float;
  if(AIRA.login_view && AIRA.login_flag){
    AIRA.login_status = null;
    AIRA.login_flag = false;
    AIRA.login_pass = "";
    var body_el = document.getElementsByTagName('body')[0];

    var div_login = document.getElementById(id_login);
    body_el.removeChild(div_login);
    AIRA.login_view = false;
    alert("ログアウトしました");
  }else if(AIRA.login_view){
    //ログアウトに失敗したのでログインフォームを消す　再度不可
    AIRA.login_status = null;
    AIRA.login_flag = true;
    var body_el = document.getElementsByTagName('body')[0];

    var div_login = document.getElementById(id_login);
    body_el.removeChild(div_login);
    AIRA.login_view = false;



  }else if(AIRA.login_flag){
    //ログイン状態からログアウトする

    AIRA.login_status = null;
    AIRA.login_flag = false;
    AIRA.login_pass = "";
    var body_el = document.getElementsByTagName('body')[0];

    var div_login = document.getElementById(id_login);
    if(div_login!=null)body_el.removeChild(div_login);


    remove_wfe_js();


    AIRA.login_view = false;
    alert("ログアウトしました");
    location.reload();

  }
}


/**
 *  ログインしたらPOPを消す
 **/
function loginPopDel(){
  var id_login = id_selector_login_float;
  if(AIRA.login_view && AIRA.login_flag){
    //AIRA.login_flag = true;  ログイン状態

    var body_el = document.getElementsByTagName('body')[0];

    var div_login = document.getElementById(id_login);
    body_el.removeChild(div_login);
    AIRA.login_view = false;

  }else if(AIRA.login_view){
    //ログアウトに失敗したのでログインフォームを消す　再度不可
    AIRA.login_status = null;
    AIRA.login_flag = true;
    var body_el = document.getElementsByTagName('body')[0];

    var div_login = document.getElementById(id_login);
    body_el.removeChild(div_login);
    AIRA.login_view = false;



  }
}



/**
   * position_top:  数値
   * position_left: 数値
   *
   * @return div のセレクタID
   **/
function loginWindow(position_left, position_top){

  var id_login = id_selector_login_float;

  if(AIRA.login_flag){
    return null;
  }else if(AIRA.login_view){
    return null;
  }else{


    var float_div = document.createElement("div");
    float_div.setAttribute('type', 'text');
    float_div.setAttribute('name', 'content_inner');
    float_div.setAttribute('id', id_login);
    float_div.setAttribute('class', 'aira_editmenu');

    float_div.setAttribute('style','width:auto;'+'height:auto;'
      +'padding:10px;'
      +'background-color:lightgray;'+'position:absolute;'
      +'z-index:900;'+'top:'+position_top+'px;'
      +'font-size:16pt;'+'text-align:center;'
      +'left:'+position_left+'px;');


    float_div.innerHTML ="Page Editor<br>";

    //ボタンをつける

    var button = document.createElement("BUTTON");
    button.type     = 'button';
    button.setAttribute('style','background-color: seagreen;border: 0;color: white;padding: 5px 10px;font-family: sans-serif;font-size:15pt;border-radius: 4px;-webkit-border-radius: 4px;-moz-border-radius: 4px;cursor: pointer;');
    //button.innerHTML= '<span class="wfe_label" style="margin:3px;font-size: 15px;">LOGIN</span>';
    button.innerHTML= 'LOGIN';
    button.onclick  = loginAPI;
    float_div.appendChild(button)
    /*
    var loginBtn = document.createElement("input");
    loginBtn.setAttribute('type','button' );
    loginBtn.onclick = loginAPI;
    loginBtn.setAttribute('value', "ログイン");
    float_div.appendChild(loginBtn);
  */

    var doc_body = document.getElementsByTagName('body');
    if(doc_body != null){
      //ログインボタンをアペンド
      var main_body = doc_body[0];
      AIRA.login_view = true;
      main_body.appendChild(float_div);
    }

    return id_login;


  }

}


//ログインボタンがログアウトボタンに鳴るだけ
function login2logout(){
  var id_login = id_selector_login_float;


  var div_login = document.getElementById(id_login);
  var btns = div_login.getElementsByTagName('input');

  var index = 0;
  for(index=btns.length-1; index> -1; index--){
    btns[index];
    div_login.removeChild(btns[index]);
  }

  //float_div.innerHTML ="";

  //ボタンをつける
  var logoutBtn = document.createElement("input");
  logoutBtn.setAttribute('type','button' );
  logoutBtn.onclick = logoutFunc;
  logoutBtn.setAttribute('value', "ログアウト");
  div_login.appendChild(logoutBtn);


  return id_login;
}

/*
function init_load_wfe_js(){
  var init_key = 'append_aira';

  var script_init1 = document.createElement('script');
  script_init1.charset = 'UTF-8';
  script_init1.setAttribute('class', init_key) ;
  script_init1.setAttribute('type', 'text/JavaScript') ;
  script_init1.setAttribute('charset', 'UTF-8') ;
  script_init1.setAttribute('name', 'wfejsmaster') ;
  script_init1.setAttribute('id', 'wfejsmaster') ;

  script_init1.src = AIRA.base_url+AIRA.wfe_url +'?'+Math.random();
  var body_el = document.getElementsByTagName('body')[0];
  body_el.appendChild(script_init1);//  firefoxでは無理ぽ

}
*/
// javascriptのロードスクリプト
function init_load_wfe_js(){
	  // headに追加 inouer 13/02/13
	  var head_el = document.getElementsByTagName('head')[0];
	  var script_init1 = document.createElement('script');
	  script_init1.charset = 'UTF-8';
	  script_init1.setAttribute('id', 'wfejs_0') ;
	  script_init1.setAttribute('name', 'wfejs') ;
	  script_init1.setAttribute('class', 'append_wfe2') ;
	  script_init1.setAttribute('type', 'text/JavaScript') ;
	  script_init1.setAttribute('charset', 'UTF-8') ;
	  script_init1.src = wfeJsDir + "/aira_js_loader.js?"+Math.random();
	  head_el.appendChild(script_init1);//  firefoxでは無理ぽ
	　window.setTimeout('eval(1)',0);
}

function testRM(){
  var jsArr = document.getElementsByName("wfejs");
  var cpArr = [];

  for(h=0;h<jsArr.length;h++) cpArr[h] = jsArr[h];// 配列のコピー
  for(h=cpArr.length-1;h>=0;h--) cpArr[h].parentNode.removeChild(cpArr[h]);// コピーした後ノードを消す

}


function remove_init_js(){

  var init_key = 'append_aira';

  // head タグの部分から 付け足したjs を削除
  var get_head = document.getElementsByTagName('head')[0];
  if(get_head != null){
    appendNodes = get_head.getElementsByClassName(init_key);
    for(index=appendNodes.length-1; index> -1; index--){
      get_head.removeChild(appendNodes[index]);
    }
  }

  // body タグの部分から 付け足したjs を削除
  var get_body = document.getElementsByTagName('body')[0];
  if(get_body != null){
    // body タグの部分
    appendNodes = get_body.getElementsByClassName(init_key);
    for(index=appendNodes.length-1; index> -1; index--){
      get_body.removeChild(appendNodes[index]);
    }
  }else{
    console.log("SSS");
  }

}

function remove_wfe_js(){

  var init_key = 'append_wfe2';


  // head タグの部分から 付け足したjs を削除
  var get_head = document.getElementsByTagName('head')[0];
  if(get_head != null){
    appendNodes = get_head.getElementsByClassName(init_key);
    for(index=appendNodes.length-1; index> -1; index--){
      get_head.removeChild(appendNodes[index]);
    }
  }

  // body タグの部分から 付け足したjs を削除
  var get_body = document.getElementsByTagName('body')[0];
  if(get_body != null){
    // body タグの部分
    appendNodes = get_body.getElementsByClassName(init_key);
    for(index=appendNodes.length-1; index> -1; index--){
      get_body.removeChild(appendNodes[index]);
    }
  }

}




/*FIrefoxにouterHTML*/
//  http://d.hatena.ne.jp/amachang/20100531/1275270877  参考
if (!('outerHTML' in document.createElement('div'))) {
  HTMLElement.prototype.__defineGetter__('outerHTML', function() {
    return this.ownerDocument.createElement('div').appendChild(this.cloneNode(true)).parentNode.innerHTML
  })
}


/* 右クリック */
document.oncontextmenu = function(e){
  if(AIRA.login_view){
  }else{
    loginWindow(e.pageX, e.pageY);
  }
  return false; /* 'false' を返すと、右クリックメニューが非表示になります */
}



function writeCookie(name,value){

}

function readCookie(name){
  var cookieMaster = "pass=or; pass2=or; __utma=61150131.1869737676.1317084431.1318832488.1319007726.4; __utmz=61150131.1319007726.4.4.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=%E5%90%8D%E5%8F%A4%E5%B1%8B%E5%B7%A5%E6%A5%AD%E5%A4%A7%E5%AD%A6%E3%80%80%E5%8D%92%E6%A5%AD%E6%9D%A1%E4%BB%B6";
  cookieMaster = document.cookie;
  cookieMaster = cookieMaster.split('; ');
  console.log(cookieMaster);
}


  // -->
