var testCount = 0;

function getRandomDom(){
	var documentWidth = document.body.clientWidth;
	var documentHeight = document.body.clientHeight;

	for(;;){
		var randomX = Math.floor(Math.random() * documentWidth);
		var randomY = Math.floor(Math.random() * documentHeight);
		var dom = document.elementFromPoint(randomX, randomY);

		if(dom!=null){
			if('innerText' in dom){
				if(dom.innerText!="") break;
			}
		}
	}
	return dom;
}

var makeRandobet = function(n, b) {
	b = b || '';
	var a = 'abcdefghijklmnopqrstuvwxyz'
		+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		+ '0123456789'
		+ b;
	a = a.split('');
	var s = '';
	for (var i = 0; i < n; i++) {
		s += a[Math.floor(Math.random() * a.length)];
	}
	return s;
};

//ユーザID
var userId = makeRandobet(5);
userId = "user/"+userId+"/";

var testSend = function(){
	var dom;
	do{
		dom = getRandomDom();

		var metaExistFlag=false;
		var childNodes = dom.childNodes;
		for(var i=0;i<childNodes.length;i++){
			if(!childNodes[i].nodeName.match(/^\#/)){
				if(childNodes[i].getAttribute('name')=='wfesversion'){
					metaExistFlag=true;
				}
			}
		}
		
		while(dom.childNodes.length>1 && !metaExistFlag){
			var randnum = Math.floor( Math.random() * dom.childNodes.length );
			dom = dom.childNodes[randnum];
		}
	}while(dom.innerText=="" || dom.innerText==null || dom.innerText.match(/^\n/));
//	}while(dom.innerText=="" || dom.innerText==null || dom.nodeName.match(/^\#/) || dom.innerText.match(/^\n/));

	var textNode;
	for(var i=0;i<childNodes.length;i++){
		if(childNodes[i].nodeName.match(/\#text/)){
			textNode = childNodes[i];
		}
	}
	if(textNode==undefined){
		testSend();
		return;
	}
//	textNode.data=makeRandobet(textNode.data.length);
//	dom.innerText=makeRandobet(dom.innerText.length);
	textNode.data+=userId;

	// 差分更新用の値を設定
	WFES.targetNode=dom;
	WFES.targetSelector=getSelector(dom);
	WFES.editType="editText";

	sendHTML();

	testCount++;
	if(testCount>=50){
		return;
	}
	
//	var randTime = getRand(0,5000);
	var randTime = getExpRand(60000);
//	var randTime = 5000;
	console.log(randTime+" "+testCount);
	
    var now = new Date;
    console.log("mystart:"+now*1+","+WFES.targetSelector);
	setTimeout("testSend('"+testCount+"')",randTime);
}

function getRand(from, to) {
    return from + Math.floor( Math.random() * (to - from + 1) );
}

function getExpRand(avg){
	return Math.floor(-avg*(1.0/1.0)*Math.log(1.0-Math.random()));
}