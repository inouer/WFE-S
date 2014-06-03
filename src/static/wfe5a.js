/*
	2007/11/06 Leopard対応 by asami
	妙なバグを修正．

	2006/10/29 wfe5a.js 内藤対応ver.  by ozono
		absX, absY の tr, td 等の offsetParent をたどれなかった問題を解消
		文字列取得の際, なぜか「内藤」が取得できなかった問題を解消 -> 処理はちょっと怪しい
	2005/05/05 Tiger対応 by ozono
		致命的なバグを多数修正．
		複数行にまたがる場合に正しい文字列を選ぶ精度に関しては無保証．
 */
var bMouse = new mouseMatrix(0,0); //選択開始時のマウス座標
var eMouse = new mouseMatrix(0,0); //選択終了時のマウス座標
var mMouse = new mouseMatrix(0,0); //マウスの現在座標
var cMouse = new mouseMatrix(0,0); //oncontextmenu時のマウス座標
var pMouse = new mouseMatrix(0,0);

//編集フォームを複数ださないようにロックをかける．
//true:編集中
formlock = false;

//セーブするかどうか
var gSaveEverytime = true;

//選択文字列
//旧lookup_word アンダーバーを含む変数はmoz系ブラウザでエラー
var lookupStr ="";

//コメントをドラッグして動かしたか？
var commentMoveFlug = false;
//操作するコメントオブジェクト
var commentOnObj = null;


/**** 編集中のIDやタグなど  ****/
var ID_inlineText    = "inlinetextfield";//テキストの編集
var ID_inlineTextarea = "inlinetextarea";//テキストエリアでの編集
/********/




/*****************************************************************************
	オブジェクト処理系
 ******************************************************************************/

//左上，右下の座標で構成される矩形を定義する
function rectObject(x1,y1,x2,y2){
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.xcenter = (x1+x2)/2;
	this.ycenter = (y1+y2)/2;
}
//矩形に入っているときはtrueを返すメソッドを追加
/*使い方
test = new rectObject(100,100,500,500);
alert(test.isInRect(mouse.x,mouse.y));
 */
rectObject.prototype.isInRect = isInRect;
rectObject.prototype.distance = distance;
function isInRect(x,y){
	if((this.x1 < x) && (x < this.x2) && (this.y1 < y) && (y < this.y2))
		return true;
	else
		return false;
}
function distance(x,y){
	// 距離：二乗取るだけ．平方根は取ってない
	//	return Math.pow(Math.abs(this.xcenter - x), 2) + Math.pow(Math.abs(this.ycenter-y), 2);
	return Math.pow(this.xcenter - x, 2) + Math.pow(this.ycenter-y, 2);
}

//引数のオブジェクトが存在する座標(矩形の左)
function elementLeft(oElement){
	return absX(oElement);
}

//引数のオブジェクトが存在する座標(矩形の上)
function elementTop(oElement){
	return absY(oElement);
}

//引数のオブジェクトの絶対座標(矩形の左) 06/10/29 by ozono
function absX(obj) {
	return _abs(obj, "offsetLeft");
}
//引数のオブジェクトの絶対座標(矩形の上) 06/10/29 by ozono
function absY(obj) {
	return _abs(obj, "offsetTop");
}

//offsetParent==nullのとき、offsetLeftなどはparentNodeからの相対座標として計算 by ozono
function _abs(obj, axs) {
	var d = obj[axs];//offsetTopは親ノードからの相対座標

	//親ノードをたどり、documentからの絶対座標を計算する
	while (true){
		var p = obj.offsetParent;
		if (p == null) p = obj.parentNode;
		if (p == null) break;
		d += p[axs];
		obj = p;
	}
	return d;
}

//オブジェクトリストnodeの中から(x,y)に一番近いオブジェクトのインデックスを返す
//はっきり行ってこの処理改善必要
function getNearestNode(x,y,node){
	var index, distance;
	var nearest = Number.MAX_VALUE;
	index = 0;
	for (i = 0; i < node.length; i++) {
		x1 = elementLeft(node[i]);
		y1 = elementTop(node[i]);
		var tempRect =
			new rectObject(x1,y1,x1 + node[i].clientWidth,y1 + node[i].clientHeight);
		//ダブルクリックして選択した場合は矩形内に入っていると仮定
		if(Math.abs(bMouse.x - eMouse.x) < 5 && Math.abs(bMouse.y - eMouse.y) < 5){
			if(tempRect.isInRect(x,y))
				return i;
		}
		distance = tempRect.distance(x,y);
		if (distance < nearest) {
			nearest = distance;
			index = i;
		}
	}
	return index;
}

//HTML中の改行を取り除く
function cleanNewLines(html) {
	html = html.replace("\n", "");
	html = html.replace("\r", "");
	return html;
}

function makeMarker(text) {
	return "<span id='wfe-position-marker' name='wfe-position-marker'>" + text + "</span>";
}
//WFEが付加したタグを取り除く関数(引数はname属性)
function removeMarker(node, nameValue){
	var bodyHtml = node.innerHTML;

	bodyHtml = bodyHtml.split('&lt;');
	bodyHtml = bodyHtml.join('---lt;---');
	bodyHtml = bodyHtml.split('&gt;');
	bodyHtml = bodyHtml.join('---gt;---');
	node.innerHTML = bodyHtml;

	//この手法はspanタグを綺麗に除去できるがフィールド内のタグが評価されなくなる
	var a = document.getElementsByName(nameValue);
	//myGetElementsById(nameValue);
	while(a.length > 0){//なぜかforだとうまく行かない
		var parent = a[0].parentNode;
		var spanSrc = document.createTextNode(a[0].innerHTML);

		parent.replaceChild(spanSrc,a[0]);

		//以下の処理でタグを評価させる
		var temp = parent.innerHTML
		temp = temp.split('&lt;');
		temp = temp.join('<');
		temp = temp.split('&gt;');
		temp = temp.join('>');
		var tempReg = new RegExp('\\\s*'+spanSrc.nodeValue+'\\\s*',"g");
		temp = temp.replace(tempReg,spanSrc.nodeValue);
		parent.innerHTML = temp;
		a = document.getElementsByName(nameValue);
	}
	bodyHtml = node.innerHTML;
	bodyHtml = bodyHtml.split('---lt;---');
	bodyHtml = bodyHtml.join('&lt;');
	bodyHtml = bodyHtml.split('---gt;---');
	bodyHtml = bodyHtml.join('&gt;');
	node.innerHTML =bodyHtml;

}

//text内のタグが閉じタグか開始タグがどうか
//open/close
function tagType(text) {
	var re = new RegExp("<(\\/)?.*>", "i");
	var ms = text.match(re);
	if (ms == null)
		return null;
	if (ms[1] == "/")
		return "close";
	return "open";
}

function getTagName(text) {
	try {
		var re = new RegExp("<(\\/)?([a-zA-Z]*)\\s?.*>", "i");
		var ms = text.match(re);
		if (ms != null && ms.length == 3)
			return ms[2];
		return null;
	} catch (e) {
		alert("getTagName:" + e);
	}
}

//textがタグかどうか：正規表現が簡易版である．
function isTag(text) {
	var re = new RegExp("<.*>", "i");
	var ms = text.match(re);
	return ms != null && ms.length > 0;
}

//regtext内の特殊文字をすべてエスケープした文字列に置換する
function regEscape(regtext){
	metaChar = ".?[]+(){}^$*";
	for(i=0;i < metaChar.length; i++){
		var str1 = "\\" + metaChar.charAt(i);
		var re = new RegExp(str1, "g");
		regtext = regtext.replace(re, str1);
	}
	return regtext;
}

//タグの入れ子をチェックする
function checkTagNesting(html) {
	var re = new RegExp("^(.*?)(<.*?>)(.*)$", "i");
	var ts = new Array();
	while (true) {
		var ms = html.match(re);

		if (ms == null) {
			ts.push(html);
			break;
		}

		for (var i = 1; i < ms.length - 1; i++) {
			ts.push(ms[i]);
		}
		html = ms[ms.length - 1];
	}

	html = "";
	var tags = new Array();
	var html0 = "";
	while (true) {
		var x = ts.pop();
		if (x == null) break;

		var type = tagType(x);
		if (type == null) {
			html = x + html;
			continue;
		}
		if (type == "close") {
			tags.push(x);
			html = x + html;
			continue;
		}
		var tn0 = getTagName(x);
		if (tags.length == 0) {
			tags.push(x);
			html = x + html;
			continue;
		}
		var tag = tags.pop();
		var tn1 = getTagName(tag);
		html = x + html;
		html0 = "";
		if (tn0 != tn1) tags.push(x);
	}
	while (tags.length > 0) {
		var x = tags.pop();
		if (x == null) break;
		var type = tagType(x);
		var tn = getTagName(x);
		if (type == "close") {
			html = "<" + tn + "[^<>]*?>.*?" + html;
		} else {
			html += ".*?</" + tn + ">";
		}
	}
	return html;
}


function __findSelectedNode(node, regStr) {
	var html = node.innerHTML;
	html = cleanNewLines(html);

	//HTML中から選択文字列を取り出す
	var match_str1 = new RegExp(regStr,"g");
	var match_str2 = html.match(match_str1);
	if (match_str2 == null) return null;
	var matchArr = new Array(match_str2.length);

	for(k=0;k<match_str2.length;k++){
		var pat = checkTagNesting(match_str2[k]);
		var str = match_str2[k];
		if (pat != str) {
			var re = RegExp(pat, "i");

			var bodyHtml = node.innerHTML;

			bodyHtml = bodyHtml.split('&lt;');
			bodyHtml = bodyHtml.join('---lt;---');
			bodyHtml = bodyHtml.split('&gt;');
			bodyHtml = bodyHtml.join('---gt;---');

			var ms = bodyHtml.match(re);
			if (ms != null) str = ms[0];

			// 真の最短パターンを発見
			var s1 = str;
			for (var h = 1; h < str.length; h++) {
				var s0 = str.substring(h, str.length);
				ms = s0.match(re);
				if (ms == null) break;
				s1 = ms[0];
			}
			str = s1;
		}

		//spanタグを挿入
		matchArr[k] = new Array(regEscape(str),str);
	}
	return __findSelectedChildNodes(node, matchArr, regStr);
}

function __findSelectedChildNodes(node, ms, pat) {
	var as = node.childNodes;
	var bs = [];
	var cs = null;
	for (var i = 0; i < as.length; i++) {
		var a = as[i];
		if (a.nodeType != 1 || a.innerHTML == "") continue;
		cs = __findSelectedNode(a, pat);
		if (cs != null && cs.length > 0)
			bs = bs.concat(cs);
	}
	if (bs.length > 0) {
		ms = bs;
	} else {
		ms = [[node, ms]];
	}
	return ms;
}



function extendSeachSelection(search_root, str){
	var seachStrs = str.split("");

	var node;
	node = lookupStrNode;
	var sourceHTML = node.innerHTML;
	var replace_rule  = new RegExp(seachStrs[0], "g");
	sourceHTML = sourceHTML.replace(replace_rule, makeMarker(seachStrs[0]));
	node.innerHTML = sourceHTML;

	return node;
}


function findSelectedNode(node, text) {
	//選択文字列を文字で分解し間にタグもしくは空白文字の正規表現をはさむ
	var regArr = text.split("");
	var regStr = "(\\\s|<[^<>]*>)?"; // 「内藤」対策。"(\\\s|<[^<>]*>)?"は一見不用に見えるが、これがないと「内藤」が編集できなくなる。

	for(j=0;j<regArr.length-1;j++){
		//		var temp = regEscape("\\Q"+regArr[j]+"\\E");
		var temp = regEscape(regArr[j]);
		regStr += temp + '(\\\s|<[^<>]*>)*';
	}
	regStr += regEscape(regArr[regArr.length-1]);
	return __findSelectedNode(node, regStr); // 低速だが取りこぼしが少ないはず
//	return __findSelectedChildNodes(node, [], regStr); // こっちの方が高速
}

function replaceEvalText(func, replaceAll, save, removeDecoration) {

	var ms = new Array();
	//
	//
	//* *   AIRA   ***/
	setSearchAnchorReg(lookupStr);//選択した文字列の検索
	//* *   AIRA   ***/
	//
	//ここにAタグの時の処理 なんかプログラムがおかしいのでtryで逃げ
	//try{extendSelectedTag();} catch(e){}

	//編集候補
	var bs = [];
	var as = null;

	if(!replaceAll){
		//全置換しないなら一番近いのを求める
		getSearchAnchor(cMouse.x,cMouse.y);
		as = document.getElementsByName("wfe-position-marker");  //spanタグのname

	}else if(replaceAll){
		//全置換
		as = document.getElementsByName("wfe-position-marker");  //spanタグのname

	}
	for (var i = 0; i < as.length; i++)
		bs[i] = as[i];

	//console.log(bs);//??????????????????????????????
	//alert("bs = " + bs.length);
	for (var i = 0; i < bs.length; i++) {
		// 直前の装飾を消すコードを追加 ozn 2005-10-11 13:32:47 +0900
		try {
			var a0 = func(bs[i]);
			if (removeDecoration && bs[i].parentNode != null) {
				var xs = bs[i].parentNode.getElementsByTagName("SPAN");
				for (var j = 0; j < xs.length; j++) {
					if (xs[j].id == "wfe-position-marker") {
						var deco = xs[j].parentNode;
						while (deco != null && deco.name == "writableDeco") {
							bs[j] = deco;
							deco = deco.parentNode;
							//alert(deco.childNodes.length);
							if (deco.childNodes.length > 1)
								break;
						}
					}
				}
			}
			bs[i].parentNode.replaceChild(a0, bs[i]);
		} catch (e) {
			alert("replaceEvalText:" + e);
		}
	}

	for (var i = 0; i < ms.length; i++) {
		var node = ms[i][0];
		removeMarker(node, 'wfe-position-marker');
	}

	closeOption();
	if (save) sendHTML();
}


//テキストフィールルドの内容を反映する
function submitTextField(replaceAll) {

	/*
 if (window.event.stopPropagation)    window.event.stopPropagation();
 if (window.event.cancelBubble!=null) window.event.cancelBubble = true;
	 */

	var a = //document.getElementsByName("inlinetextfield")[0];
		document.getElementById(ID_inlineText);
	var parent = a.parentNode;
	var text, target = parent;
	if((parent.getAttributeNode("id").value) == ("inlinetextarea")){
		text = a.value;// Safari3.0ではこちらでないと動作せず 07/11/06 by asami
		target = parent.parentNode;
	} else {
		text = a.value;
	}
	bypassLinkArea();//リンク復活　aira_loaded.js

	if(replaceAll == true){

		window.tmpReplaceText = text;
		//---------------------------
		text.replace(/\n/g, "<br>");
		target.innerHTML = lookupStr;
		removeMarker(parent, 'wfe-inline-editor');
		//---------------------------
		//全置換
		console.log("replaceALL");
		var replace_func1  = function(element){
			element.innerHTML = window.tmpReplaceText;
			return element;
		};
		replaceEvalText(replace_func1, true, false, false);


	}else{
		text.replace(/\n/g, "<br>");
		target.innerHTML = text;
		removeMarker(parent, 'wfe-inline-editor');
	}


	formlock = false;
	//空コメント時の処理を消してあるので後で直す．
	if (gSaveEverytime){
		console.log("送信する！"+gSaveEverytime);
		sendHTML();
	}else{}

	//setTimeout( "parent.onclick = function(){return true;}",1000);
	return false;//リンクを飛ばさない
}


//付箋型コメントのテキストフィールルドの内容を反映する
function submitCommentTextField() {
	var a = document.getElementById(ID_inlineText);
	var parent = a.parentNode;
	var target = parent.parentNode;
	var text = a.value;
	text.replace(/\n/g, "<br>");
	target.innerHTML = text;
	formlock = false;

	//差分更新のためのセレクタを取得 2012-7-24 by inoue
	WFES.targetSelector=getSelector(target);
	if(WFES.editType!="editComment"){
		WFES.editType="insertComment";		
	}

	//空コメント時の処理を消してあるので後で直す．
	if (gSaveEverytime){
		console.log("送信する！"+gSaveEverytime);
		sendHTML();
	}else{
		console.log("送信しない！"+gSaveEverytime);
	}

	return false;
}


/** 文字列編集のフィールド作成  replaceがtrueのときは文書内の全置換，それ以外の時は選択部分のみ */
function createEditField(replace) {
	var func = function (x) {
		var html = x.innerHTML;
		var span = document.createElement("span");
		span.setAttribute("id", "wfe-inline-editor");
		span.setAttribute("name", "wfe-inline-editor");

		if (html.length < 20) {

			var len = parseInt(html.length) + 10;
			span.innerHTML =
				'<INPUT id="'+ID_inlineText+'" type="text" size="'+len+'" value="'+ html +'">';//    <INPUT type="button" value="Save" style="width:70px" onclick="submitTextField();">';
		} else {
			var len = parseInt(html.length / 20) + 2;
			span.innerHTML =
				'<form id="'+ID_inlineTextarea+'">'+
				'<textarea id="'+ID_inlineText+'" cols=60 rows='+ len +'>'+
				html + '</textarea><br>';//     '<input type="button" value="Save" onclick="submitTextField();"></form>';
		}
		return span;
	}
	var replaceAll =  false;
	replaceEvalText(func, replaceAll, false, false);
	//__
	var tmpParent = document.getElementById(ID_inlineTextarea);
	if(tmpParent){}else{
		tmpParent = document.getElementById(ID_inlineText);
		tmpParent = tmpParent.parentElement;
	}
	//リンクバグ対応？
	var tmp_target = document.getElementById(ID_inlineText);
	if(tmp_target == null){
		tmp_target = document.getElementById(ID_inlineTextarea);
	}
	if(tmp_target != null){
		//console.log(tmp_target.parentElement.parentElement);
	}

	avoidLinkArea();//編集中にリンクで飛ぶのを回避  aira_loaded.js

	if(replace == true){
		createButtonObject("SAVE","submitTextField(true);",tmpParent);
	}else{
		createButtonObject("SAVE","submitTextField();",tmpParent);
	}


	formlock = true;
	return false;
}

function insertLink(){

	window.makingLink = null;

	var func = function (x) {

		if( document.getElementsByName('writableInsertAnchor') ==null ){
			console.log("insertLink:ERROR code101");
			return null;
		}
		if(window.makingLink != null){
			var elem = document.createElement("a");
			elem.setAttribute("href", window.makingLink);
			var html = x.innerHTML;
			var txt = document.createTextNode(html);
			elem.appendChild(txt);
		}else{
			elem = null;
		}
		return elem;
	}
	//--------------------
	if( document.getElementsByName('writableInsertAnchor') !=null ){
	}else{
		console.log("insertLink:ERROR code101");
		return null;
	}
	var replaceAll = false;

	var checkWhat =document.getElementsByName('selAnchor');
	if( checkWhat.length > 0 ){
		if( checkWhat[0].checked != null ){
			replaceAll = checkWhat[0].checked;
		}
	}else{
		console.log("insertLink:ERROR code103");
		replaceAll =false;
	}
	console.log("insertLink:ERROR code104:"+replaceAll);

	var httphref = document.getElementsByName('linkTextField');
	if(httphref.length > 0){
		window.makingLink = httphref[0].value; //  変数を用いる
	}
	replaceEvalText(func, replaceAll, gSaveEverytime, false);
	window.makingLink = null;
}



//テキスト修飾用ウィンドウ
function openDecoWindow(x,y){
	var layoj0 = document.createElement('div')
	layoj0.setAttribute('id','writableoption');
	layoj0.setAttribute('name','writableoption');
	//layoj0.style.position = "absolute";
	layoj0.style.left = x+"px";
	layoj0.style.top = y+"px";
	//layoj0.style.width = 300+"px";
	//layoj0.style.backgroundColor = "#aaaaaa";
	//layoj0.style.zIndex = 20;
	layoj0.innerHTML = "<form name='writableDeco'>Decoration...<BR>"+
	"Size : <select name='fontsize'>" +
	"<option label='150%' value='150%'>150%</option>" +
	"<option label='120%' value='120%'>120%</option>" +
	"<option label='100%' value='100%' selected>100%</option>" +
	"<option label='80%' value='80%'>80%</option>" +
	"<option label='50%' value='50%'>50%</option>" +
	"</select>&nbsp;<br>"  +
	"Color :[<span id='writablefontcolor' class='_aira' name='writablefontcolor' style='background-color:black;' onclick='output_picker(" +
	(mMouse.x-30) +"," + (mMouse.y+40) +",this.id,\"backgroundColor\");'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>]&nbsp;" +
	"Bg Color :[<span id='writablebgcolor' class='_aira'  name='writablebgcolor' style='background-color:transparent;' onclick='output_picker(" +
	(mMouse.x-30) +"," + (mMouse.y+40) +",this.id,\"backgroundColor\");'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>]<br>" +
	"<input name='writablebold' type='checkbox'><span class='_aira'  style='font-weight:bold;'>B</span>" +
	"<input name='writableitalic' type='checkbox'><span class='_aira'  style='font-style:italic;'>I</span>" +
	"<input name='writableunderline' type='checkbox'><span class='_aira'  style='text-decoration:underline;'>U</span>" +
	"<br>" +
	"<div style='text-align:right;'>" +
	"<button type='button' class='_aira' onclick='removeDecoration();'>Remove</button>"+
	"<button type='button' class='_aira' onclick='closeOption();'>Cancel</button>"+
	"<button type='button' class='_aira' onclick='insertDecoration();'>Set</button>"+
	"</div></form>";
	/*
	 *layoj0.innerHTML = "<form name='writableDeco'>Decoration...<BR>"+
  "Size : <select name='fontsize'>" +
  "<option label='150%' value='150%'>150%</option>" +
  "<option label='120%' value='120%'>120%</option>" +
  "<option label='100%' value='100%' selected>100%</option>" +
  "<option label='80%' value='80%'>80%</option>" +
  "<option label='50%' value='50%'>50%</option>" +
  "</select>&nbsp;"  +
  "Color :[<span id='writablefontcolor' name='writablefontcolor' style='background-color:black;' onclick='output_picker(" +
  (mMouse.x-30) +"," + (mMouse.y+40) +",this.id,\"backgroundColor\");'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>]&nbsp;" +
  "Bg Color :[<span id='writablebgcolor' name='writablebgcolor' style='background-color:transparent;' onclick='output_picker(" +
  (mMouse.x-30) +"," + (mMouse.y+40) +",this.id,\"backgroundColor\");'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>]<br>" +
  "<input name='writablebold' type='checkbox'><span style='font-weight:bold;'>B</span>" +
  "<input name='writableitalic' type='checkbox'><span style='font-style:italic;'>I</span>" +
  "<input name='writableunderline' type='checkbox'><span style='text-decoration:underline;'>U</span>" +
  "<input name='writablelinethrough' type='checkbox'><span style='text-decoration:line-through;'>S</span><br>" +
  "<INPUT name='selAnchor' type='checkbox' value='on'>Apply this change to the same words.<BR>" +
  "<div style='text-align:right;'>" +
  "<INPUT type='button' value='Remove' style='width:70px' onclick='removeDecoration();'>" +
  "<INPUT type='button' value='Cancel' style='width:70px' onclick='closeOption();'>" +
  "<INPUT type='button' value='Set' style='width:70px' onclick='insertDecoration();'>"
  "</div></form>";
	 **/
	//document.body.appendChild(layoj0);
	var bodyEle = document.getElementsByTagName('body')[0];
	bodyEle.appendChild(layoj0)
//	createButtonObject(value,scripts,parent)
}

function insertDecoration(){
	var func = function (x) {
		removeDecorationFromNode(x);


		var styleStr = 'display:inline;position:relative;';//伊奈用
		var html = x.innerHTML;
		var elem = document.createElement("span");
		elem.setAttribute('class','writableDeco');
		//elem.setAttribute('id','writableDeco');
		elem.setAttribute('name','writableDeco');
		//var fSize = document.writableDeco.fontsize.value;
		elem.style.fontSize = window.tmpDeco.fontsize;
		styleStr += 'font-size:' + window.tmpDeco.fontsize + ';';
		var fColor =
			document.getElementById('writablefontcolor').style.backgroundColor;
		elem.style.color = fColor;
		styleStr += 'color:' + fColor + ';';
		var bgColor =
			document.getElementById('writablebgcolor').style.backgroundColor
			elem.style.backgroundColor = bgColor;
		styleStr += 'background-color:' + bgColor + ';';
		if(window.tmpDeco.bold){
			elem.style.fontWeight = "bold";
			styleStr += 'font-weight:bold';
		}
		if(window.tmpDeco.italic){
			elem.style.fontStyle = "italic";
			styleStr += 'font-style:italic';
		}
		if(window.tmpDeco.underline){
			elem.style.textDecoration = "underline";
			styleStr += 'text-Decoration:underline';
		}/*
    if(document.writableDeco.writablelinethrough.checked){
      elem.style.textDecoration = "line-through";
      styleStr += 'text-Decoration:line-through';
    }*/

		//Safariだとなぜか動かんから以下の処理を追加
		//if((navigator.userAgent).indexOf("Safari",0))
		console.log(document.writableDeco.writablebold.checked+"設定したスタイル"+styleStr);//_________________________________//
		elem.setAttribute('style',styleStr);
		elem.appendChild(document.createTextNode(html));

		return elem;
	}

	window.tmpDeco = {
			'fontsize':'',
			'bold':false,
			'italic':false,
			'underline':false
	};

	console.log("func呼び出し"+document.writableDeco.fontsize.value);//_________
	if(document.writableDeco.fontsize){
		tmpDeco.fontsize = document.writableDeco.fontsize.value;
	}
	if(document.writableDeco.writablebold.checked){
		tmpDeco.bold = true;
	}
	if(document.writableDeco.writableitalic.checked){
		tmpDeco.italic = true;
	}
	if(document.writableDeco.writableunderline.checked){
		tmpDeco.underline = true;
	}
	var replaceAll = false;
	var checkWhat =document.getElementsByName('selAnchor');
	if( checkWhat.length > 0 ){
		if( checkWhat[0].checked != null ){
			replaceAll = checkWhat[0].checked;
		}
	}else{
		replaceAll =false;
	}
	replaceEvalText(func, replaceAll, gSaveEverytime, false);
	window.tmpDeco = null;
}

//デコレーションを除去
//ozn 2005-10-11 16:34:50 +0900
function removeDecorationFromNode(x) {
	var xs=x.getElementsByTagName("SPAN");
	/*
  for (var i = 0; i < xs.length; i++) {
    if (xs[i].name != "writableDeco")
      continue;
    var deco = xs[i];
    for (var j = 0; j < deco.childNodes.length; j++) {
      deco.parentNode.insertBefore(deco.childNodes[j], deco);

    }
    deco.parentNode.removeChild(deco);
  }
	 */
	//この咲自分で作った
	if(xs.length ==0){
		xs = [x];
	}

	for (var i = 0; i < xs.length; i++) {
		if (xs[i].getAttribute('name') != "writableDeco")
			continue;
		var deco = xs[i];
		for (var j = 0; j < deco.childNodes.length; j++) {
			deco.parentNode.insertBefore(deco.childNodes[j], deco);
		}
		deco.parentNode.removeChild(deco);
	}
}
//ozn 2005-10-11 13:34:46 +0900
function removeDecoration(){
	var func = function (x) {
		removeDecorationFromNode(x);
		return x;
	}
	var replaceAll = false;
	var checkWhat =document.getElementsByName('selAnchor');
	if( checkWhat.length > 0 ){
		if( checkWhat[0].checked != null ){
			replaceAll = checkWhat[0].checked;
		}
	}else{
		replaceAll =false;
	}
	//var replaceAll = document.writableDeco.selAnchor.checked;
	replaceEvalText(func, replaceAll, gSaveEverytime, true);
}


//リンク挿入用ウィンドウの表示
function openLinkWindow(x,y){
	var layoj0 = document.createElement('div');
	layoj0.setAttribute('id','writableoption');
	layoj0.setAttribute('name','writableoption');
	//layoj0.style.position = "absolute";
	layoj0.style.left = x+"px";
	layoj0.style.top = y+"px";
	layoj0.style.width = 300+"px";
	//layoj0.style.backgroundColor = "#aaaaaa";
	//layoj0.style.zIndex = 10;
	//layoj0.innerHTML =
	//"<FORM name='writableInsertAnchor'>Hyper Link...<BR>    <INPUT name='linkTextField' type='text' size='50' value='http://'>    <BR>    <INPUT name='selAnchor' type='checkbox' value='on'>Apply this change to the same words.<BR>    <INPUT type='button' value='Save' style='width:70px' onclick='insertLink();'>    <INPUT type='button' value='Cancel' style='width:70px' onclick='closeOption();'></FORM>";
	layoj0.innerHTML =
		"<FORM name='writableInsertAnchor'>Hyper Link...<BR>    <INPUT name='linkTextField' type='text' size='50' value='http://'></FORM>";

	//setAttribute関連はIEで全く動かない．
	document.body.appendChild(layoj0);
	var editMenu = document.getElementsByName('writableInsertAnchor')[0];
	createButtonObject('Save','insertLink();',editMenu);
	createButtonObject('Cancel','closeOption();',editMenu);
}


//--マウスカーソルを動かした時レイヤーもmoveLAYERojで動かす
var offsetX,offsetY;
function commentMove(e) {
	if(commentOnObj !=null){


		//
		//
		/* AIRA  BEGIN */
		var elem = null;
		if (e.target) {  /* Firefox */
			elem = e.target;
		}
		else if (window.event.srcElement) { /* IE */
			elem = window.event.srcElement;
		}
		if(elem.id != null){

			var comment_id = elem.id;
			if(comment_id.indexOf("wfecomment") == 0){
				var getXpathInfo = getNearestEle4XPath(elem.id);

				//console.log("move! "+comment_id+":"+getXpathInfo);

				elem.setAttribute("data-xpath", getXpathInfo);//valueは仕様的には存在しない
				//console.log(elem);
			}
		}else{
		}
		/* AIRA  E N D */
		//
		//

		commentOnObj.style.left = (mMouse.x - offsetX) + "px";
		commentOnObj.style.top = (mMouse.y - offsetY) + "px";
		commentMoveFlug = true;
	}
	return false;
}
//comment move end
function saveMovedComment(e){
	if (gSaveEverytime && commentMoveFlug){
		var elem = null;
		if (e.target) {  /* Firefox */
			elem = e.target;
		}
		else if (window.event.srcElement) { /* IE */
			elem = window.event.srcElement;
		}
		if(elem.localName != 'div' & elem.localName != 'DIV'){
			elem = elem.parentElement;
		}
		if(elem.id != null){
			var comment_id = elem.id;
			if(comment_id.indexOf("wfecomment") == 0){
				var getXpathInfo = getNearestEle4XPath(elem.id);
				elem.setAttribute("data-xpath", getXpathInfo);//valueは仕様的には存在しない

			}
		}else{
		}
		commentMoveFlug = false;

		// 更新情報をセット 2012-07-25 by inoue
		WFES.targetSelector=getSelector(elem);
		WFES.editType="editComment";

		sendHTML();
	}
	commentOnObj = null;
}

function mdown(e,obj) {

	if(formlock)return null;//編集メニュー表示中は動かせない
	if(obj != null){
		var temp = obj.style.left;
		offsetX = getMouseX(e) - parseInt(temp.substring(0,temp.length-1));
		temp = obj.style.top;
		offsetY = getMouseY(e) - parseInt(temp.substring(0,temp.length-1));
		commentOnObj = obj;
	}

}

function deleteComment(commentID){
	var obj = document.getElementById(commentID);
//	obj.parentNode.removeChild(obj);
	closeOption();

	//差分更新のためのセレクタを取得 2012-7-28 by inoue
	WFES.targetSelector=getSelector(obj);
	WFES.editType="deleteComment";

	if (gSaveEverytime) sendHTML();

}

function commentStyleToString(obj){
	return "position: " + obj.style.position + "; color: " + obj.style.color +"; background-color:" +  obj.style.backgroundColor + "; z-index: " + obj.style.zIndex + "; left: "+obj.style.left+"; top: "+obj.style.top+";";
}

function insertComment(commentID){
	if(commentID == 'new'){
		var layoj = document.createElement('div') ;
		var k=1;
		while(document.getElementById('wfecomment' + k) != null)k++;

		var tempCommentID = 'wfecomment' + k;
		console.log("Commentmaking...:"+tempCommentID);//________________________________
		layoj.setAttribute('id', tempCommentID);
		//IEとそのほかで確実に分岐させた方がいいと思われる．
		//saveHTML後にリロードすると値が消滅する
		layoj.ondblclick = function(e){
			openWFEMenu(this.id);
		};
		layoj.onmousedown = function(e){
			mdown(e,this);
		};
		//setAttributeで二重でセットするより
		//layoj.onmousdownなどをロード時に追加したほうがソース的にもスマートであると思われる
		layoj.style.position = "absolute";
		layoj.style.left = mMouse.x +"px";
		layoj.style.top = mMouse.y +"px";
		layoj.style.color = "black";
		layoj.style.backgroundColor = "transparent";
		layoj.style.zIndex = 10;
		var styleStrX = "position: absolute; color: black; background-color: transparent; z-index: 10; left: "+mMouse.x+"px; top: "+mMouse.y+"px;";
		layoj.setAttribute('style',styleStrX);

		var insertSpan = document.createElement("span");
		insertSpan.setAttribute("id", "wfe-inline-editor");
		insertSpan.setAttribute("name", "wfe-inline-editor");

		insertSpan.innerHTML =
			"[<span id='writablefontcolor' name='writablefontcolor'  onclick='output_picker(" +
			(mMouse.x-30) +"," + (mMouse.y+40) +",\""+ tempCommentID +"\",\"color\");'>Color</span>]&nbsp;" +
			"[<span id='writablebgcolor' name='writablebgcolor' style='background-color:transparent;' onclick='output_picker(" +
			(mMouse.x-30) +"," + (mMouse.y+40) +",\""+ tempCommentID +"\",\"backgroundColor\");'>BgColor</span>]<br>" +
			"<textarea id=\'"+ID_inlineText+"\' rows='7' cols='25'></textarea><br>"+
			"<button type='button' class='_aira' onclick='submitCommentTextField();'>SAVE</button>"+
			"<button type='button'  class='_aira' onclick='cancelComment();'>Cancel</button>";
		layoj.appendChild(insertSpan);

		//inoue 2012-03-27
		//bodyではなく隠れiframe要素を除いたdivに追加する
//		document.getElementById('body_part').appendChild(layoj);
		//bodyに追加　2012-10-23
		document.body.appendChild(layoj);
	} else {
		var layoj = document.getElementById(commentID);
		var htmlText = layoj.innerHTML;
		var editText =
			"<span id='wfe-inline-editor' name='wfe-inline-editor'>[<span id='writablefontcolor' name='writablefontcolor'  onclick='output_picker(" +
			(mMouse.x-30) +"," + (mMouse.y+40) +",\""+ commentID +"\",\"color\");'>Color</span>]&nbsp;" +
			"[<span id='writablebgcolor' name='writablebgcolor' style='background-color:transparent;' onclick='output_picker(" +
			(mMouse.x-30) +"," + (mMouse.y+40) +",\""+ commentID +"\",\"backgroundColor\");'>BgColor</span>]<br>" +
			"<textarea id=\'"+ID_inlineText+"\' rows='7' cols='25'>"+ htmlText +"</textarea><br>" +
			"<button type='button'  class='_aira' onclick='submitCommentTextField();'>SAVE</button>"+
			"<button type='button'  class='_aira' onclick='cancelComment();'>Cancel</button></span>";
		layoj.innerHTML = editText;

		//差分更新のためのセレクタを取得 2012-7-24 by inoue
		WFES.targetSelector=getSelector(layoj);
		WFES.editType="editComment";
	}
	closeOption();
	formlock = true;
}

//コメントを編集中にキャンセルしてコメントの作成をなかったことにする．
function cancelComment(){
	var targetEditMenu = document.getElementById('wfe-inline-editor');
	var targetComment = null;
	if(targetEditMenu != null){
		targetComment =  removeFromParent(targetEditMenu);//aira_loaded.js

		formlock = false;
	}
}


function createButtonObject(value,scripts,parent){
	var bWidth = (value.length < 7)?(70 + "px"):(100 + "px");
	var button = document.createElement("BUTTON");
	button.type     = 'submit';
	button.setAttribute('class', '_aira');
	button.setAttribute('type', 'button');
	button.style    = bWidth;
	//button.innerHTML= '<span class="wfe_label">'+value+'</span>';
	button.innerHTML= value;
	button.onclick  = function(){
		eval(scripts);
	};
	parent.appendChild(button);


}

function closeOption(){
	//ブラウザ毎の処理がちがいすぎ
	if(document.all){
		while(1){
			var obj = document.all('writableoption',0)
			if(obj == null)break;
			obj.parentNode.removeChild(obj);
		}
	}else{
		try{
			var obj = document.getElementsByName('writableoption');
			while(obj != null){
				obj[0].parentNode.removeChild(obj[0]);
				obj = document.getElementsByName('writableoption');
			}
		} catch(e){}
	}
	formlock=false;
}

//CREATE edit menu
function openOption(x,y,menuArr,scriptArr,menuText){
	var layoj = document.createElement('div');
	layoj.setAttribute('id','writableoption');
	layoj.setAttribute('name','writableoption');// style => wfe.css
	layoj.style.left = x+"px";
	layoj.style.top = y+"px";

	if(menuArr.length != scriptArr.length)
		console.log("The Error of Script Program!");//________________________

	layoj.appendChild(document.createTextNode(menuText));
	layoj.appendChild(document.createElement("br"));
	var objArr = new Array(menuArr.length+1);
	for(var i=0;i<objArr.length-1;i++){
		createButtonObject(menuArr[i],scriptArr[i],layoj);
		if(i % 3 == 2) layoj.appendChild(document.createElement("br"));
	}
	createButtonObject("Cancel","closeOption();",layoj);
	document.body.appendChild(layoj);
}




function openWFEMenu(flug){

	try{
		pMouse.x = cMouse.x;
		pMouse.y = cMouse.y;

		//closeOption(); //開いているメニューを一旦閉じる
		if(formlock){
			return;
		}
		formlock=true;
		if(flug=="wfe"){ //選択文字列を処理するとき
			//			var re = new RegExp("\s", "mg");
			//新しいSafariはgetSelectionの返値としてテキストオブジェクトを
			//返さないようなので強制的に型変換
			lookupStr = "" + myGetSelection();
			lookupStr = lookupStr.replace(/\s/mg, "");
			//			lookupStr = lookupStr.replace(re, "");
			//			lookupStr = myGetSelection().replace(/\s/mg, "");
			//window.getSelectionで取得した文字列だとなぜか動かない
			//document.getSelectionで取得したやつは動く
			if(lookupStr != ""){
				var menuArr = new Array("Edit","Link","Decoration","Replace");
				var scriptArr = new Array(
						"createEditField(false);",
						"closeOption();openLinkWindow("+ (cMouse.x+10) + ","+(cMouse.y+10)+");",
						"closeOption();openDecoWindow("+ (cMouse.x+10) + ","+(cMouse.y+10)+")",
				"createEditField(true);");
				openOption(cMouse.x,cMouse.y,menuArr,scriptArr,"WFE-S -Text Menu1-"); //2012-04-07 WFE XからWFE-S by inoue
			}else{
				var menuArr =
					new Array("Comment","Image","Newpage","BackColor","Title","Password","Logout","Save");
				var scriptArr = new Array(
						"insertComment('new');",
						"closeOption();addImgMenu("+ (cMouse.x+10) + ","+(cMouse.y+10)+");",
						"closeOption(); createNewpage();",
						"closeOption();changeBgcolor();",
						"closeOption();changeTitle();",
						"closeOption();changePwd();",
						"closeOption();removeAllEvent4AIRA();",
				"closeOption(); sendHTML();");

				if(gSaveEverytime){
					menuArr.pop();
					scriptArr.pop();
				}
				openOption(mMouse.x,mMouse.y,menuArr,scriptArr,"WFE-S -Comment Menu1-"); //2012-04-07 WFE XからWFE-S by inoue

			}
		}else{ //コメントの処理
			//コメントのoncdblclickに仕込む
			//Moveはドラッグドロップに仕様変更
			var menuArr = new Array("Edit","Delete");
			var scriptArr =
				new Array("insertComment('"+ flug +"');","deleteComment('"+ flug +"');");
			openOption(mMouse.x,mMouse.y,menuArr,scriptArr,"WFE-S -Comment Menu2-"); //2012-04-07 WFE XからWFE-S by inoue

		}
	}catch(e){
		alert(e);
	}
}

function setCommentEvent(){

	var k = 1;
	var layoj;

	var layArr = document.getElementsByTagName('div');
	for(i=0;i<layArr.length;i++){
		if(layArr[i].getAttribute('id') == null) continue;
		if(layArr[i].getAttribute('id').match(/wfecomment/)){
			//
			//
			/*  AIRA B E G I N */
			//if( layArr[i].getAttribute("value") != null){
			if( layArr[i].getAttribute("data-xpath") != null){
				//console.log("setCommentEvent:setCommentPositionFromXPath("+layArr[i].id+")"+layArr[i].getAttribute("data-xpath"));
				setCommentPositionFromXPath( layArr[i].id )
			}else{
				console.log("setCommentEvent:ERROR("+layArr[i].id+")");
			}
			/*  AIRA E N D */
			//
			//
			layArr[i].ondblclick = function(e){
				openWFEMenu(this.id);
			};
			layArr[i].onmousedown = function(e){
				mdown(e,this);
			};
			layArr[i].onmouseup = function(e){
				saveMovedComment(e);
			};
		}
	}
}
function setCommentEventOnly(){
	var k = 1;
	var layArr = document.getElementsByTagName('div');
	for(i=0;i<layArr.length;i++){
		if(layArr[i].getAttribute('id') == null) continue;
		if(layArr[i].getAttribute('id').match(/wfecomment/)){
			layArr[i].ondblclick = function(e){
				openWFEMenu(this.id);
			};
			layArr[i].onmousedown = function(e){
				mdown(e,this);
			};
		}
	}
}

/** コメント用のイベント削除　**/
function resetCommentEvent(){
	var layoj;
	var layArr = document.getElementsByTagName('div');
	for(i=0;i<layArr.length;i++){
		if(layArr[i].getAttribute('id') == null) continue;
		if(layArr[i].getAttribute('id').match(/wfecomment/)){
			layArr[i].ondblclick = function(e){};
			layArr[i].onmousedown = function(e){};
		}
	}
}


try {


	document.oncontextmenu =
		function(e){
		getMouseMatrix(e,cMouse);
		openWFEMenu("wfe");

		// 編集位置のセレクタを取得 2012-07-13 by inoue
		if(e.target!=null){
			WFES.targetSelector=getSelector(e.target);
			WFES.editType="editText";
		}

		return false;
	}

	document.onmousedown =
		function(e){
		getMouseMatrix(e,bMouse);
	};
	document.onmouseup =
		function(e){
		getMouseMatrix(e,eMouse);
		saveMovedComment(e);
	};
	document.onmousemove =
		function(e){
		getMouseMatrix(e,mMouse);
		commentMove(e);
	};
	setCommentEvent();
} catch (e) {
	alert("cannot initialize: " + e);
}






function removeAllEvent4AIRA(){

	try{
		removeTableEvent();//テーブルからイベント除去(aira_loaded)
		removedListEvent();//リストからイベント除去(aira_loaded)

		document.oncontextmenu = function(e){}
		document.onmousedown   = function(e){ };
		document.onmouseup     = function(e){};
		document.onmousemove   = function(e){};

		resetCommentEvent();//コメント用のイベント削除(wfe5a)
		remove_wfe_js();
		remove_init_js();
		bgdlstop();//更新チェック停止

		alert("logout!!");
	} catch (e) {
		alert("cannot initialize: " + e);
	}

}







/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *
 *    AIRA JS LOAD
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/

//最初の考え　init_old_wfe_append5();//aira_loaded.js  (wfe5a.js でappend )
init_old_wfe_append3();//wfe5colorpicker.js   (aira_loaded でappend)
init_old_wfe_append4();//wfe5autoChecker.js  (aira_loaded でappend)
init_wfe_css_append();//wfe.css