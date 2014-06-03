//元は　 wfe5post.js


/******************************************
		POST処理系
*******************************************/
//var cgiPath = document.getElementById("wfejsmaster").getAttribute("src");
//var cgiPath = "/";
var cgiPath = 'http://' + location.host + '/';
var fileName = getfileOwnPath();

function getfileOwnPath(){ //CROSSのはず

  var mypath = location.pathname;
  //var mypath = AIRA.wfe_url;//保存するためのCGIのパス

  if (mypath.charAt(mypath.length - 1) == "/") mypath += "index.html";
  return mypath;

}


//編集したHTMLをPOSTする関数
function sendHTML(){
  try{
    var layArr = document.getElementsByTagName('div');
    for(i=0;i<layArr.length;i++){
      if(layArr[i].getAttribute('id') == null) continue;
      if(layArr[i].getAttribute('id').match(/wfecomment/)){
        layArr[i].setAttribute("style",commentStyleToString(layArr[i]));
      }
    }
    //------ A I R A - ------
    insertEdittime();	//autochecker.jsにて定義  metaタグを現在の時刻に変更
//    remove_init_js();//  aira で足した部分を除去する
//    remove_wfe_js();//  wfe で足した部分を除去する
    //
    //==================
//    if(document.getElementsByTagName('BASE').length == 0){
//      console.log('baseがない');
//      var baseurl = document.createElement('BASE');
//      baseurl.href = location.origin+"/";
//
//
//      var head = document.getElementsByTagName('HEAD')[0];
//      head.insertBefore(baseurl,head.firstChild);
//    }
//    //
//    //------//------//------
//
//    var htmlele = document.getElementsByTagName("html")[0];
//    var jsArr = document.getElementsByName("wfejs");
//    var cpArr = [];
//    // Safari3.0になってからの対応 07/11/06 by asami
//    for(h=0;h<jsArr.length;h++) cpArr[h] = jsArr[h];// 配列のコピー
//    for(h=cpArr.length-1;h>=0;h--) cpArr[h].parentNode.removeChild(cpArr[h]);// コピーした後ノードを消す
//
//    /*
//	// Safari3.0になる前のコード．親が共通の場合，1つ消すと配列の中身が全て消える 07/11/06 by asami
//	for(h=jsArr.length-1;h>=0;h--){
//		jsArr[h].parentNode.removeChild(jsArr[h]);
//	}
//*/
//    var htmlTagStr = "<HTML";
//    //htmlele.hasAttributes この行消さない
//    /*
//	for(i=0;i<htmlele.attributes.length;i++){
//		htmlTagStr += " " + htmlele.attributes.item(i).name + "=";
//		htmlTagStr += "\"" + htmlele.attributes.item(i).value + "\"";
//	}*/
//    htmlTagStr += ">";
//    //<script name="wfejsname" type="text/JavaScript" src="./wfe/wfe.cgi">
//
//
//    var bugfixStr = "<script id=\"wfejsmaster\" type=\"text/JavaScript\" src=\""+  cgiPath +"\">";
//    var bugfixReg = new RegExp(bugfixStr);
//    var htmlSrcStr = htmlTagStr + htmlele.innerHTML + "\n</HTML>";
//
//    htmlSrcStr = htmlSrcStr.replace(bugfixReg,"<script id=\"wfejsmaster\" type=\"text/JavaScript\" src=\""+ cgiPath +"\"></script>");
//
//    var rmDblBreak = new RegExp(" {8}","g");
//    htmlSrcStr = htmlSrcStr.replace(rmDblBreak,"\t");
//    var rmDblBreak = new RegExp("\\n{2,}","g");
//    htmlSrcStr = htmlSrcStr.replace(rmDblBreak,"");
//    //	var rmDblBreak = new RegExp(">\\t*<","g");
//    //	htmlSrcStr = htmlSrcStr.replace(rmDblBreak,">\n<");
//
//
    var wfe_passcode = null;
    /** コード要求  */
    if(AIRA.login_flag){//ログインしている
      wfe_passcode = AIRA.login_pass;
    }else{
      if(AIRA.debug) console.log("not login");//________________________//
      return null;
    }


    //評価のための時間を取得
    var start = new Date;
    start=start*1;

    //	var param = 'filename=' + fileName + '&body=' + escape2(htmlSrcStr);
    //var param = 'filename=' + fileName + '&body=' + escape(htmlSrcStr);

    // wfe-s全更新
//    var param = 'filename=' + fileName + '&body=' + escape(codeEscape(htmlSrcStr));
//    param += '&code='+wfe_passcode ;

    // wfe-s差分更新
    WFES.targetNode=document.querySelectorAll(WFES.targetSelector).item(0);
//    console.log(WFES.targetSelector);
//    console.log(WFES.targetNode);
//    console.log(WFES.editType);

//    // 評価用のシーケンスを確認
//    var targetChildNodes = WFES.targetNode.childNodes;
//    var metaExistFlag = false;
//    var newSeq = '';
//    for(var i=0;i<targetChildNodes.length;i++){
//    	if(!targetChildNodes[i].nodeName.match(/^\#/)){
//    		if(targetChildNodes[i].getAttribute('name')=='wfesversion'){
//        		metaExistFlag = true;
//        		var oldSeq = targetChildNodes[i].getAttribute('content');
//        		var newSeq = oldSeq+WFES.clientId+":"+WFES.editNum+"\n";
//        		targetChildNodes[i].setAttribute('content',newSeq);
//        	}
//    	}
//    }
//    if(!metaExistFlag){
//		var ele = document.createElement('meta');
//		ele.setAttribute('name', 'wfesversion');
//		ele.setAttribute('content', '\n'+WFES.clientId+":"+WFES.editNum+"\n");
//		WFES.targetNode.appendChild(ele);
//    }
//    WFES.editNum++;

    var param = '';
    if(WFES.editType=="deleteComment"){
    	// コメント削除の場合
        param += 'filename=' + fileName + '&selector=' + escape(codeEscape(WFES.targetSelector)) + '&edittype=' + escape(codeEscape(WFES.editType));
    }else if(WFES.editType=="insertComment" || WFES.editType=="editComment"){
        // コメントの生成．編集，移動の場合
        param += 'filename=' + fileName + '&selector=' + escape(codeEscape(WFES.targetSelector)) + '&html=' + escape(codeEscape(WFES.targetNode.innerHTML)) +
        '&style=' + escape(codeEscape(WFES.targetNode.getAttribute('style'))) + '&id=' + WFES.targetNode.id + '&edittype=' + escape(codeEscape(WFES.editType));
    }else if(WFES.editType=="editTitle"){
    	param += 'filename=' + fileName + '&title=' + escape(codeEscape(document.getElementsByTagName('title')[0].innerHTML)) + '&edittype=' + escape(codeEscape(WFES.editType));
    }
    else{
    	// テキスト，テーブル，リスト編集等の場合
        param += 'filename=' + fileName + '&selector=' + escape(codeEscape(WFES.targetSelector)) + '&html=' + escape(codeEscape(WFES.targetNode.innerHTML)) + 
        '&edittype=' + escape(codeEscape(WFES.editType));
    }
    
    WFES.editType="";
    
    // 毎回認証
    param += '&code='+wfe_passcode ;

    //評価のための時間も送信
    param += '&start='+start;
    var editSeq = makeRandobet(64);
//    param += '&start='+editSeq+","+start;

    // charsetも送信
    // 文字コード取得
	var charset;
	if(document.charset!=undefined){
		charset = document.charset;
	}
	else if(document.characterSet!=undefined){
		charset = document.characterSet;
	}
	else if(document.defaultCharset!=undefined){
		charset = document.defaultCharset;
	}
	else if(document.actualEncoding){
		charset = document.actualEncodeing;
	}

	console.log(charset);
    param += '&charset='+charset;

    var req0 = null;

    if (window.XMLHttpRequest) {
      req0 = new XMLHttpRequest();
      // req0.open("POST", cgiPath, false);
      req0.open("POST", cgiPath + 'posthtml', false);
      req0.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req0.send(param);
      if(AIRA.debug) console.log("sendHTML 送信");//________________________//

    } else if (window.ActiveXObject) { // branch for IE/Windows ActiveX version
      isIE = true;
      req0 = new ActiveXObject("Microsoft.XMLHTTP");
      if (req0) {
        //paramの値がエラーを引き起こしている．
        //escape2の出力結果がまずい？そんなことないはず
        alert(cgiPath +"?"+ param);
        req0.open("POST", (cgiPath +"?"+ param), false);
        req0.send();
      }
    }

    //最編集するために append
    init_wfe_css_append();//wfe.css
    appendTableEvent();
    appendListEvent();//リストの編集
    setCommentEventOnly();//コメントのイベント
  }catch(e){
    alert("save?:" + e);
  }
}

function escape2(str){
  HexT = '0123456789ABCDEF';
  var ret  = '';
  for ( i = 0; i < str.length; i++ ){
    c = str.charAt(i);
    if ( c.search(/[\*\-\.0-9A-Z_a-z@]/) < 0 ){
      cc  = c.charCodeAt(0);
      ccc = '';
      while ( cc > 0 ){
        ccc = HexT.charAt(cc & 0xf) + ccc;
        cc  >>>= 4;
      }
      if ( ccc.length == 0 )
        ccc = '00';
      else if ( ccc.length % 2 )
        ccc = '0' + ccc;
      if ( ccc.length == 4 )
        ccc = '%u' + ccc;
      else
        ccc = '%'  + ccc;
      ret += ccc;
    } else
      ret += c;
  }
  return ret;
}

//init_old_wfe_append5();//next > aira_loaded
init_old_wfe_append2();//next >wfe5a.js (main)
