var url = 'http://localhost:3001';

var express = require('express');
var app = express.createServer();
var io  = require('socket.io');
var innerClient = require('socket.io-client');

//ファイル読み書き用
var fs = require('fs');

var http = require('http');

var Client = require('mysql').Client;
var mysql = require('mysql');

//サーバのアドレス
var HOSTNAME = 'localhost';

//MySQL データベース名、ユーザ名、パスワード
var DBNAME = 'nb_db';
var DBUSER = 'root';
var DBPASSWD = 'm@un10Fg';

//ポート番号
var websocketPort = 3001;

app.configure(function(){
	app.use(express.static(__dirname + '/static'));
});

app.listen(websocketPort);

var socket = io.listen(app);

socket.on('connection', function(client) {
	// メッセージ受信時の処理

	//----- DBからのロード処理 -----
	client.on('load', function(cookie) {
		loadData(client);
	});

	//------ マーカーが動いた時の処理 -----
	client.on('moveStart', function(msg) {
		// ブロードキャスト
		client.broadcast.emit('moveStart',msg);
	});

	//------ マーカーが動いている時の処理 -----
	client.on('markerMoved', function(msg) {
		// ブロードキャスト
		client.broadcast.emit('markerMoved',msg);
	});

	//----- マーカーのドラッグが終わった時の処理 -----
	client.on('moveEnded', function(msg) {
		updateData(client, msg);
	});

	//----- メッセージをやり取り -----
	client.on('sendMessage', function(msg) {
		// ログがまだ生成されていないならば作る
		try {
			fs.statSync("./userinfoLog");
		} catch (e) {
			console.log(e);
			console.log("make log: ./userinfoLog");
			fs.writeFileSync("./userinfoLog", "");
		}

		if(msg!=""){
			msg+="\n\n"

			// ファイルに出力
			var userinfoFile = fs.openSync("./userinfoLog", "a");

			fs.writeSync(userinfoFile, msg, null, "utf8");
			fs.closeSync(userinfoFile);

			// メッセージをクライアントへ送信
			client.emit('sendMessage',msg);
			client.broadcast.emit('sendMessage',msg);
		}else{
			// ファイルから読み出し
			var userinfoFile = fs.openSync("./userinfoLog", "r");

			// ファイルサイズを調べる
			var stat = fs.statSync("./userinfoLog");
			if(stat.size==0) return;

			var bytes = fs.readSync(userinfoFile, stat.size, 0, "utf8");
			fs.closeSync(userinfoFile);

			client.emit('sendMessage', bytes[0]);
		}
	});

	//----- クライアントの切断 -----
	client.on('disconnect', function() {
//		console.log('disconnect');
	});
});

//MySQLに接続する関数
function connectMySQL() {
	var myclient = mysql.createClient({
		host: HOSTNAME,
		database: DBNAME,
		user: DBUSER,
		password: DBPASSWD,
	});

	return myclient;
}

//DBのデータを読み込む関数
function loadData(client) {

	var myclient = connectMySQL();

	// DBから読み出す
	var query = "select * from person";
	myclient.query(query, function(err, results, fields) {

		myclient.end();

		if (err) {
			console.log('loadError');
			throw err;
		} else {
			// 結果をクライアントへ送信
			client.emit('load', results);
		}
	});
}

//DBのデータを更新する関数
function updateData(client, msg) {
	var id = msg.id;
	var originX = msg.x;
	var originY = msg.y;

	var myclient = connectMySQL();

	query2 = "update person set x=" + originX
	+ ", y=" + originY
	+ " where id=\'" + id +"\'";

	myclient.query(query2, function(err, rows) {
		myclient.end();
		if (err) {
			console.log('updateError: ');
			throw err;
		} else {
			// ブロードキャスト
			client.emit('moveEnded',msg);
			client.broadcast.emit('moveEnded',msg);
		}
	});
}

console.log('Server running at http://127.0.0.1:' + websocketPort + '/');

