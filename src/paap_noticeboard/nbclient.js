//サーバのURL
var url = 'http://localhost:3001';

//描画タイマー
var drawTimer;

//キャンバス
var canvas;
var ctx;
//キャンバスの位置
var cX = 10;
var cY = 10;
//キャンバスのサイズ
var cW = 1290;
//var cW = 1610;
var cH = 840;
//キャンバスのリサイズの比率
var resizeRatio=1;

//マウスが押されているかどうか
var mouseDownFlag = false;

//マーカーが選択されているかどうか
var markerSeletedFlag = false;

//ドラッグ開始時のマウスの座標
var mouseX1;
var mouseY1;
//ドラッグ中のマウスの座標
var mouseX2;
var mouseY2;
//ドラッグ開始時と現在のマウスの座標の差
var dragDivX;
var dragDivY;
//ドラッグ開始時のマーカーの座標
var markerX1;
var markerY1;

var obj;

//マーカーのリスト
var m=new Array();
//マーカーの幅
var markerWidth=60;
//マーカーの高さ
var markerHeight=60;
//マーカーの半径
var radius=markerWidth/2;
//移動対象のマーカー
var targetMarkerIndex;
//マウスポインタが触れているマーカー
var touchingMarkerIndex;
//マーカーの色のリスト
var mColor=new Array();

//居場所のリスト
var whereabouts=new Array();
//居場所のテキストのリスト
var textWhereabouts=new Array();

//居場所のオブジェクトをリサイズするかどうかのフラグ
var whereaboutsFlag=true;

window.onload = function() {
	// websocket関連の処理
	websocketSetting();

	// キャンバスのコンテキストを取得
	canvas = document.getElementById('mainCanvas');
	if ( ! canvas || ! canvas.getContext ) return false;
	ctx = canvas.getContext('2d');

	//キャンバスの位置と大きさを設定
	canvas.setAttribute('style',"position:absolute;left:"+cX+"px;top:"+cY+"px;");
	canvas.setAttribute('width',cW);
	canvas.setAttribute('height',cH);
	
	// ウインドウの大きさに合わせてホワイトボードをリサイズ
	var ratioW=document.body.clientWidth*0.65/cW;
	var ratioH=document.body.clientHeight*0.8/cH;
	if(ratioW<1 || ratioH<1){
		// リサイズの比率を決定
		if(ratioW<ratioH && ratioW>0.5){
			resizeRatio=ratioW;
		}
		else if(ratioH>0.5){
			resizeRatio=ratioH;
		}
		else{
			resizeRatio=0.5;
		}
		resizeRatio=Math.floor(resizeRatio*100)/100;

		// キャンバスを位置調整してリサイズ
		canvas.setAttribute('style',"position:absolute;left:"+cX*resizeRatio+"px;top:"+cY*resizeRatio+"px;");
		canvas.setAttribute('width',cW*resizeRatio);
		canvas.setAttribute('height',cH*resizeRatio);

		// コンテキストをリサイズ
		ctx.scale(resizeRatio,resizeRatio);
	}

	// メッセージ欄の設定
	messageSpaceSetting();
	
	// マーカーの色の配列を用意
	loadColorArray();

	canvas.addEventListener("mousedown", mouseDownListner, false);
	canvas.addEventListener("mousemove", mouseMoveListner, false);
	canvas.addEventListener("mouseup", mouseUpListner, false);
	canvas.addEventListener("mouseout", mouseUpListner, false);

	socket.emit('load');
	socket.on('load', function(res) {
		console.log('DBload');

		// マーカーの配列を初期化
		m.length=0;

		for(var i=0;i<res.length;i++) {
			m[i] = new Object();
			m[i].id=res[i].id;
        	m[i].x=res[i].x*resizeRatio;
       		m[i].y=res[i].y*resizeRatio;
       		m[i].w=markerWidth*resizeRatio;
       		m[i].h=markerHeight*resizeRatio;
			m[i].screenname=res[i].screenname;
			m[i].colorindex=res[i].colorindex;
		}
		// ttf(フォントファイル)の読み込みを待つために描画を遅らせる
		window.setTimeout('draw()',500);
	});
};

//マーカーの色の配列を用意
//start=グラデーションの開始の色，end=グラデーションの終了の色
function loadColorArray(){
	// 紫
	mColor[0] = new Object();
	mColor[0].start = '#FFF0F5';
	mColor[0].end = '#DA70D6';

	// 茶色
	mColor[1] = new Object();
	mColor[1].start = '#FFFACD';
	mColor[1].end = '#DAA520';

	// 緑
	mColor[2] = new Object();
	mColor[2].start = '#F5FFFA';
	mColor[2].end = '#00FF00';

	// 青
	mColor[3] = new Object();
	mColor[3].start = '#E0FFFF';
	mColor[3].end = '#00BFFF';

	// ピンク
	mColor[4] = new Object();
	mColor[4].start = '#FFE4E1';
	mColor[4].end = '#FFB6C1';
}

//居場所を地道に設定して描画
function drawBackground(){
	// 帰宅
	whereabouts[0]=new Object();
	whereabouts[0].x=10;
	whereabouts[0].y=10;
	whereabouts[0].w=150;
	whereabouts[0].h=820;
	whereabouts[0].name="home";

	// 学外
	whereabouts[1]=new Object();
	whereabouts[1].x=170;
	whereabouts[1].y=10;
	whereabouts[1].w=140;
	whereabouts[1].h=820;
	whereabouts[1].name="off-campus";

	// 学内
	whereabouts[2]=new Object();
	whereabouts[2].x=320;
	whereabouts[2].y=10;
	whereabouts[2].w=270;
	whereabouts[2].h=820;
	whereabouts[2].name="on-campus";

	// 新谷研究室
	whereabouts[3]=new Object();
	whereabouts[3].x=600;
	whereabouts[3].y=10;
	whereabouts[3].w=680;
	whereabouts[3].h=820;
	whereabouts[3].name="lab.";

	// 新谷先生の部屋
	whereabouts[4]=new Object();
	whereabouts[4].x=620;
	whereabouts[4].y=50;
	whereabouts[4].w=200;
	whereabouts[4].h=130;
	whereabouts[4].name="room A";

	// 大囿先生の部屋
	whereabouts[5]=new Object();
	whereabouts[5].x=840;
	whereabouts[5].y=50;
	whereabouts[5].w=200;
	whereabouts[5].h=130;
	whereabouts[5].name="room B";

	// 白松先生の部屋
	whereabouts[6]=new Object();
	whereabouts[6].x=1060;
	whereabouts[6].y=50;
	whereabouts[6].w=200;
	whereabouts[6].h=130;
	whereabouts[6].name="room C";

	// ゼミ室
	whereabouts[7]=new Object();
	whereabouts[7].x=620;
	whereabouts[7].y=200;
	whereabouts[7].w=420;
	whereabouts[7].h=310;
	whereabouts[7].name="room D";

	// 秘書室
	whereabouts[8]=new Object();
	whereabouts[8].x=1060;
	whereabouts[8].y=200;
	whereabouts[8].w=200;
	whereabouts[8].h=310;
	whereabouts[8].name="room E";

	// 院部屋
	whereabouts[9]=new Object();
	whereabouts[9].x=620;
	whereabouts[9].y=530;
	whereabouts[9].w=640;
	whereabouts[9].h=130;
	whereabouts[9].name="room F";

	// 学部部屋
	whereabouts[10]=new Object();
	whereabouts[10].x=620;
	whereabouts[10].y=680;
	whereabouts[10].w=640;
	whereabouts[10].h=130;
	whereabouts[10].name="room G";

	// 図書館
	whereabouts[11]=new Object();
	whereabouts[11].x=340;
	whereabouts[11].y=200;
	whereabouts[11].w=230;
	whereabouts[11].h=130;
	whereabouts[11].name="library";

	// 講義
	whereabouts[12]=new Object();
	whereabouts[12].x=340;
	whereabouts[12].y=350;
	whereabouts[12].w=230;
	whereabouts[12].h=225;
	whereabouts[12].name="lecture";

	// 食事
	whereabouts[13]=new Object();
	whereabouts[13].x=190;
	whereabouts[13].y=595;
	whereabouts[13].w=380;
	whereabouts[13].h=215;
	whereabouts[13].name="out to lunch";

	ctx.strokeStyle = "#000000";

	// 描画はリサイズ前に行う
	for(var i=0;i<whereabouts.length;i++){
		ctx.shadowColor='rgba(0, 0, 0, 0)';
		ctx.beginPath();
		ctx.strokeRect(whereabouts[i].x,whereabouts[i].y,whereabouts[i].w,whereabouts[i].h,1);
		ctx.stroke();
		ctx.fillStyle = "#000000";
		ctx.font = "25px 'huiji'";
		ctx.textAlign="center";
		ctx.textBaseline="middle";

		// テキストのオブジェクトを作成
		textWhereabouts[i]=new Object();
		textWhereabouts[i].x=whereabouts[i].x;
		textWhereabouts[i].y=whereabouts[i].y;
		textWhereabouts[i].w=whereabouts[i].name.length*15;
		textWhereabouts[i].h=25;

		ctx.fillText(whereabouts[i].name,textWhereabouts[i].x+textWhereabouts[i].w/2,textWhereabouts[i].y+13);
	}

	// リサイズ対応
	if(whereaboutsFlag){
		for(var i=0;i<whereabouts.length;i++){
			whereabouts[i].x*=resizeRatio;
			whereabouts[i].y*=resizeRatio;
			whereabouts[i].w*=resizeRatio;
			whereabouts[i].h*=resizeRatio;
		}

		whereaboutsFlag=false;
	}
	for(var i=0;i<whereabouts.length;i++){
		textWhereabouts[i].x*=resizeRatio;
		textWhereabouts[i].y*=resizeRatio;
		textWhereabouts[i].w*=resizeRatio;
		textWhereabouts[i].h*=resizeRatio;
	}
}

//描画処理
function draw() {
	// 表示クリア
	ctx.clearRect(0, 0, cW, cH);
	ctx.beginPath();

	drawBackground();

	// マーカーを描画
	for(var i=0;i<m.length;i++){
		drawMarker(i);
	}
}

//マーカーを描画する関数
function drawMarker(i){
	ctx.beginPath();
	// リサイズ対応
	ctx.arc(m[i].x+radius, m[i].y+radius, radius, 0, Math.PI*2, false);
	var grad=ctx.createRadialGradient(m[i].x+radius,m[i].y+radius,0,m[i].x+radius,m[i].y+radius,radius);
	grad.addColorStop(0,mColor[m[i].colorindex].start);
	grad.addColorStop(1,mColor[m[i].colorindex].end);
	ctx.fillStyle = grad;
	ctx.strokeStyle = mColor[m[i].colorindex].end;
	ctx.fill();
	ctx.lineWidth=0;
	ctx.stroke();

	ctx.fillStyle = "#000000";
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	// リサイズ対応
	ctx.fillText(m[i].screenname,m[i].x+radius,m[i].y+radius,markerWidth);
}

//キャンバス内でmousedown
function mouseDownListner(e) {
	mouseDownFlag=true;

	var rect = e.target.getBoundingClientRect();
	//PC用処理
	mouseX1 = e.clientX - rect.left;
	mouseY1 = e.clientY - rect.top;

	// 触れているマーカーを判定
	for(var i=0;i<m.length;i++){
		if (judgeInclude(mouseX1,mouseY1,m[i])) {
			// 触れているマーカーのインデックス
			targetMarkerIndex=i;

			dragDivX = 0;
			dragDivY = 0;
			// ドラッグ開始時のマーカーの座標
			markerX1 = m[targetMarkerIndex].x;
			markerY1 = m[targetMarkerIndex].y;

			markerSeletedFlag = true;

			// マーカーの移動開始を通知
			moveStart();

			// 連続描画を終了
			clearInterval(drawTimer);

			// 連続描画を開始
			drawTimer = setInterval("draw()", 10);
		}
	}
}

//キャンバス内でmousemove
function mouseMoveListner(e) {
	var currentX;
	var currentY;

	// 座標取得
	var rect = e.target.getBoundingClientRect();
		// PC用処理
		currentX = e.clientX - rect.left;
		currentY = e.clientY - rect.top;


	// マーカーが選択されているかどうか
	if (markerSeletedFlag) {
		mouseX2=currentX;
		mouseY2=currentY;

		if (mouseX2 < 0 || mouseX2 > cW || mouseY2 < 0 || mouseY2 > cH) dragEnd();
		dragDivX = (mouseX2 - mouseX1);
		dragDivY = (mouseY2 - mouseY1);

		m[targetMarkerIndex].x = markerX1+dragDivX;
		m[targetMarkerIndex].y = markerY1+dragDivY;

		// マーカーの移動を通知
		sendMoveMessage();
	}
}

function mouseUpListner(e) {
	if (markerSeletedFlag) {
		dragEnd();
	}

	// 連続描画を終了
	clearInterval(drawTimer);
}

function dragEnd() {
	markerSeletedFlag = false;

	m[targetMarkerIndex].x = markerX1+dragDivX;
	m[targetMarkerIndex].y = markerY1+dragDivY;

	// マーカーの移動を通知
	moveEnded();
}

//-------------------- 以下判定系の処理 --------------------

//ある座標がオブジェクト内かどうかを判定
function judgeInclude(targetX,targetY,object){
	if (targetX > object.x && targetX < object.x + object.w) {
		if (targetY > object.y && targetY < object.y + object.h) {
			return true;
		}
	}
	return false;
}

//-------------------- 以下websocket関連の処理 --------------------

//node.jsのクライアントサイド
var socket = new io.connect(url);
function websocketSetting() {
	socket.on('connect', function() {
		console.log('connect');
	});
	// マーカーの移動を開始するときのハンドラ
	socket.on('moveStart', function(msg) {
		for(var i=0;i<m.length;i++){
			if(msg.id==m[i].id){
				draw();
			}
		}
	});
	// マーカーが移動した時のハンドラ
	socket.on('markerMoved', function(msg) {
		for(var i=0;i<m.length;i++){
			if(msg.id==m[i].id){
				// リサイズ対応
				m[i].x=msg.x;
				m[i].y=msg.y;

					draw();
			}
		}
	});
	// マーカーの移動が終了したときのハンドラ
	socket.on('moveEnded', function(msg) {
		for(var i=0;i<m.length;i++){
			if(msg.id==m[i].id){
				m[i].x=msg.x;
				m[i].y=msg.y;

				draw();
			}
		}
	});
}

//マーカーを話した時にメッセージ送信
function moveStart(){
	// 座標を標準に戻して送信
	var data = {
			"id":m[targetMarkerIndex].id,
			"x":m[targetMarkerIndex].x,
			"y":m[targetMarkerIndex].y,
	}

	socket.emit('moveStart',data);
	return false;
}

//websocketを使ってメッセージ送信
function sendMoveMessage(){
	// 座標を標準に戻して送信
	var data = {
			"id":m[targetMarkerIndex].id,
			"x":m[targetMarkerIndex].x,
			"y":m[targetMarkerIndex].y,
	}

	socket.emit('markerMoved',data);
	return false;
}

//マーカーを話した時にメッセージ送信
function moveEnded(){
	// 座標を標準に戻して送信
	var data = {
			"id":m[targetMarkerIndex].id,
			"x":m[targetMarkerIndex].x,
			"y":m[targetMarkerIndex].y,
	}

	socket.emit('moveEnded',data);
	return false;
}

//ユーザからの情報の位置，サイズ
var userinfoX=cX+cW+10;
var userinfoY=cY;
var userinfoW=340;
var userinfoH=420;

function messageSpaceSetting(){
	// ユーザからの情報の取得
	socket.emit('sendMessage',"");	
	var userinfoDiv=document.getElementById('userinfoDiv');
	userinfoDiv.setAttribute('style',
			"position:absolute;left:"+userinfoX*resizeRatio+"px;top:"+userinfoY*resizeRatio+"px;" +
			"-webkit-transform: translate("+-userinfoW*(1-resizeRatio)/2+"px,"+-userinfoH*(1-resizeRatio)/2+"px)" +
			" scale("+resizeRatio+","+resizeRatio+");"+
			"-moz-transform: translate("+-userinfoW*(1-resizeRatio)/2+"px,"+-userinfoH*(1-resizeRatio)/2+"px)" +
			" scale("+resizeRatio+","+resizeRatio+");"+
			"font-size:15pt;"
	);
	// ユーザからの情報のtextareaの設定
	var userinfo=document.getElementById('userinfo');
	userinfo.setAttribute('style',
			"background-color:rgba(0,0,0,0);" +
			"font-size:15pt;font-family:huiji;" +
			"width:"+userinfoW+"px;height:"+userinfoH+"px;" +
			"border:none;resize:none;"
	);
	// 送信メッセージ欄の設定
	var messageForm=document.getElementById('messageForm');
	messageForm.setAttribute('style',
			"font-size:15pt;" +
			"width:"+userinfoW+"px;height:"+30+"px;" +
			"resize:none;overflow-x:hidden;overflow-y:hidden;"
	);
	messageForm.setAttribute('wrap','off');
	// 送信ボタンの動作
	$("#sendButton").click(sendMessage);
	// メッセージ欄のイベント付加
	var timerID;
	$("#messageForm").keypress(function(e){
		// enterキーで送信
		if(e.which == 13){
			sendMessage();
			return false;
		}
	})
	.focus(function(){
		var messageForm=document.getElementById('messageForm');
		var date=new Date();
		var sTime=date.getTime();

		// フォーカスされたらスクロールを自動追従にする
		timerID=setInterval(function(){
			if(messageForm.scrollLeft!=messageForm.scrollWidth && messageForm.selectionStart==messageForm.value.length){
				messageForm.scrollLeft=messageForm.scrollWidth;
			}

			// 5分間選択されっぱなしだったら選択解除
			var date=new Date();
			var nTime=date.getTime();
			if(nTime-sTime>300000) document.getElementById('messageForm').blur();
		},100);
	})
	.blur(function(){
		// フォーカスが外れたら自動追従を解除する
		clearInterval(timerID);
	});
}

//メッセージをサーバへ送信
function sendMessage(){
	var message=">"+$('#messageForm').val();
	$('#messageForm').val("");
	document.getElementById('messageForm').blur();

	if(message==">" || message==">\n"){
		alert('メッセージが空白です．');
		return;
	}

	socket.emit('sendMessage',message);
}

//ユーザからの情報が更新された時のハンドラ
socket.on('sendMessage', function(res) {
	var messageArea=document.getElementById('userinfo');
	messageArea.innerHTML+=res;
	messageArea.scrollTop=messageArea.scrollHeight;
});

document.oncontextmenu = function () {return false;}