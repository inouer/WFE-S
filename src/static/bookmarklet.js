var bookmarklet = function(){
//	wfespath = "http://localhost:8081";
	wfespath = "http://wfesynchrosharer.appspot.com";

	//メイン部分
	var Main = function(){
		//表示しているページのURLを取得
		var url = location.href;

		//データストアに存在するかどうかを確認する
		$.ajax({
			url : wfespath+"/checkurl",
			type: "GET",
			data: {url: url},
			success: function(response){
				if(response=="notexist"){
					notExist(url);
				}
				else{
					Exist(response);
				}
			}
		});
	}

	//URLがデータストア上にあるときに呼ばれる関数
	var Exist = function(page_id){
		//ページの遷移を行うだけ
		location.href = wfespath+page_id;
	};

	//URLがデータストア上にないときに呼ばれる関数
	var notExist = function(url){
		var password;
		var lastIndex = location.href.lastIndexOf('/');
		var host = location.href.substring(0,lastIndex);

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

		var useragent = navigator.userAgent;

		//新規パスワードの入力ダイアログ
//		password = window.prompt("新規に編集ページを生成します．パスワードを設定してください．", "");
		password = window.prompt("Set a password for a new Real-Time Coraborative Editing page", "");
		//空のときは何回も入力させる
		while(password==""){
			password = window.prompt("パスワードは必ず設定してください．", "");
		}
		//キャンセルの時は何もしない
		if(password==null){
			return;
		}

		//データストアに登録する
		$.ajax({
			url : wfespath+"/upload",
			type: "GET",
			data: {url : url , host : host , charset : charset , useragent : useragent , password : password},
			success: function(page_id){
				location.href = wfespath+page_id;
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				alert("WFE-Sブックマークレットはこのサイトでは使用できません．\n"+XMLHttpRequest+"\n"+textStatus+"\n"+errorThrown);
			}
		});
	};

	//wfe-sのページ内では使えないようにする
	if(location.href.indexOf(wfespath) == -1){
		Main();
	}
	else if(location.href!=wfespath+"/"){
		alert("WFE-Sブックマークレットはこのサイトでは使用できません．");
	}
	else{
		//wfe-sのトップページの場合は何もしないし，何も表示しない
	}
};

bookmarklet();
