var user_id;
var token;
var iframe;
var filename;
var wfespath = "http://"+location.host;

//評価のための変数
var alltime = 0;
var count = 0;

//表示しているページのファイル名を取得する
var file_url = location.href;
filename = file_url.substring(file_url.lastIndexOf("/")+1,file_url.length);

window.onload = function(){
	console.log("wfesinit");

	socketSetting();

	getDiff();

	//データベース上のHTMLはエンコードされているので，デコードする
	document.body.innerHTML=unescape(document.body.innerHTML);
	document.title=unescape(document.title);

	//デコードすると通信用iframe要素がおかしくなるので書きなおす
	var body = document.body.innerHTML;
	document.body.innerHTML=body.replace(/<iframe[^>]*><\/iframe>/,iframe);
};

// チャネル構築，ソケットのコールバック関数定義
function socketSetting(){
	//ファイル名からトークンを取得してソケットを開く
	$.ajax({
		url : wfespath+"/getchanneltoken",
		type: "GET",
		data: {filename: filename},
		success: function(token){
			var channel = new goog.appengine.Channel(token);
			var socket = channel.open();

			socket.onopen = function(){
				//alert('channel opend');

				//通信用iframe要素を保存する
				iframe = $("body").html().match(/<iframe[^>]*><\/iframe>/)
			};

			socket.onmessage = function(message){
				var parsed_message = JSON.parse(message.data);

				// プッシュ配信の容量制限に引っかかったかどうか
				if(unescape(parsed_message.type)=="success"){
					decoded_html_text = unescape(parsed_message.html_text);
					decoded_style_attr = unescape(parsed_message.comment_style_attr);
					decoded_id = unescape(parsed_message.comment_id);
					decoded_edit_type = unescape(parsed_message.edit_type);
					decoded_title = unescape(parsed_message.title);
					decoded_start = unescape(parsed_message.start);

					//差分更新のためのセレクタ
					decoded_selector = unescape(parsed_message.selector);
				}
				else{
					alert("ページサイズが32KByteを超えているため，同期編集ができません．");

					return;
				}

				//titleを書き換える
				if(decoded_edit_type == "editTitle"){
					document.title=unescape(decoded_title);
					
					return;
				}

				var targetNode=document.querySelector(decoded_selector);
				console.log("targetNode = "+targetNode);
				if(targetNode==null && decoded_edit_type!="insertComment" ){
//					alert('更新する要素が見つかりません．修正のために自動リロードします．');
					window.location.reload();
					return;
				}

				if(decoded_edit_type=="insertComment"){
					// コメントを作成
					console.log("insertComment");
					insertSyncComment(decoded_html_text,decoded_style_attr,decoded_id);
				}else if(decoded_edit_type=="editComment"){
					// コメントの移動を同期
					console.log("editComment");
					targetNode.setAttribute('style',decoded_style_attr);
					targetNode.innerHTML=decoded_html_text;
				}else if(decoded_edit_type=="deleteComment"){
					// コメントの削除を同期
					console.log("deleteComment");
					targetNode.parentNode.removeChild(targetNode);
				}else{
					// ターゲットノードを書き換える
					console.log("edit");
					targetNode.innerHTML=decoded_html_text;
				}

				//評価のための時間をコンソールに残す
				var now = new Date;
				console.log("collision:"+decoded_start+","+now*1+","+decoded_selector);
				var time = now*1 - decoded_start;

				alltime+=time;
				count++;
				var avg=alltime/count;

				console.log("書き換え回数:"+count+","+time+",これまでの平均:"+avg);
			};
		}
	});
}

// サーバから差分情報を取得して適用
function getDiff(){
	//差分情報リストを取得して適用
	$.ajax({
		url : wfespath+"/getdiff",
		type: "GET",
		data: {filename: filename},
		success: function(res){
			var parsed_message = JSON.parse(res);
			if(parsed_message.type=="fault"){
				console.log("差分情報はありません．");
			}
			else{
				console.log(parsed_message);
				// ターゲットノードを書き換えor生成
				for(var i=0;i<parsed_message.selector.length;i++){
					if(parsed_message.edit_type[i]=="insertComment" || parsed_message.edit_type[i]=="editComment"){
						insertSyncComment(unescape(parsed_message.html_text[i]),parsed_message.style_attr[i]);
					}else if(parsed_message.edit_type[i]=="editTitle"){
						document.title=unescape(parsed_message.html_text[i]);												
					}else{
						var targetNode=document.querySelectorAll(parsed_message.selector[i]);
						if(targetNode.item(0)!=null) targetNode.item(0).innerHTML=unescape(parsed_message.html_text[i]);
					}
				}
			}
		}
	});
}

// wfe5a.jsからコメント作成部分をとりあえず持ってきて
// 差分更新に使いやすいように改変
function insertSyncComment(html,style,id){
	var layoj = document.createElement('div') ;
	var k=1;
	while(document.getElementById('wfecomment' + k) != null)k++;

	var tempCommentID = 'wfecomment' + k;

	//既に生成されている場合には終了
	if('wfecomment'+(k-1)==id) return;

	console.log("Commentmaking...:"+tempCommentID);//________________________________
	layoj.setAttribute('id', tempCommentID);

	layoj.ondblclick = function(e){
		openWFEMenu(this.id);
	};
	layoj.onmousedown = function(e){
		mdown(e,this);
	};

	// styleをセット
	layoj.setAttribute('style',style);

	// 中身をセット
	layoj.innerHTML=html;

	//inoue 12-3-27
	//bodyではなく隠れiframe要素を除いたdivに追加する
	document.getElementById('body_part').appendChild(layoj);
	//bodyに追加　2012-10-23
//	document.body.appendChild(layoj);
}

// HTMLをデコードする
function decodeHTML(){
	
}
