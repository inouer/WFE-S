var deletejs = function(){
//	wfespath = "http://localhost:8081";
	wfespath = "http://wfesynchrosharer.appspot.com";

	// js要素をとってきて削除
	var jsList = document.getElementsByTagName('script');
	for(var i=0;i<jsList.length;i++){
		var scriptSrc = jsList[i].getAttribute('src');
		if(scriptSrc!="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" && 
				scriptSrc!="http://wfesynchrosharer.appspot.com/static/jsdelete.js"){
			jsList[i].parentNode.removeChild(jsList[i]);
			i--;
		}
	}
};

deletejs();
