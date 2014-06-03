var checkObj = document.all?(document.getElementById?3:2):(document.getElementById?4:(document.layers?1:0));
if(checkObj <= 2){
	alert('This Browser cannot use WFE!');
}

//マウスの座標を管理するオブジェクト
function mouseMatrix(x,y){this.x = x; this.y = y;}

function initObj(){
	checkObj = document.all?(document.getElementById?3:2):(document.getElementById?4:(document.layers?1:0));
}

//本来ならば同IDはDOMツリー上に１つじゃないとだめだが，
//IEのname属性の扱いがあまりにしょぼいのでしかたなくIDでリストをつくる．
//他のブラウザはそのままByNameを使う．
//つまり，idとnameを両方同じ値で入れる必要がある
function myGetElementsById(idname){
	var objArr;
	if(document.all){
		//objArr = document.all(idname);
		objArr = document.getElementsByName(idname);
		//IEでは，byNameでもidを読み込んでいるような気がする．
		//objArr = document.getElementsByName(idname);
		//name属性× spanがname属性を正式サポートしてない
		//id属性なら回収できる
	}else{
		objArr = document.getElementsByName(idname);
		//name属性なら回収できる
		//id属性だとリスト生成が手間
	}
	return objArr;
}

function myGetSelection(){
	 if(document.getSelection){
		return document.getSelection(); //moz camino用
	}else if(window.getSelection){
		return window.getSelection(); //NN safari
	}else if(document.selection){
		return document.selection.createRange().text; //IE
	}
}

//マウスの座標を取得
function getMouseMatrix(e,mouse){
	mouse.x = getMouseX(e);
	mouse.y = getMouseY(e);
}

//マウスのX座標を取得する関数 --corss
function getMouseX(e){
	if(window.opera) return e.clientX
	else if(document.all)
		return document.body.scrollLeft+event.clientX
	else if(document.layers||document.getElementById)
		return e.pageX
}

//マウスのY座標を取得する関数．--cross
function getMouseY(e){
	if(window.opera)  return e.clientY
	else if(document.all)
		return document.body.scrollTop+event.clientY
	else if(document.layers||document.getElementById)
		return e.pageY
}





/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *
 *    AIRA JS LOAD
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/

  //最初の考え　init_old_wfe_append2();//wfe5a.js (main) (wfe5util.js でappend )
  init_old_wfe_append5();//next > aira_loaded
  
  
//init_old_wfe_append6();//next >aira_extend_post.js 