// Javascriptロード関数
try{
  wfeJsDir = 'http://' + location.host + '/'+"static";

}catch(e){alert("parse error: " + e)}

function init_wfe_css_append(){
  var head_el = document.getElementsByTagName('head')[0];
  var link_ele = document.createElement('link');
  link_ele.id  = "wfe_css_append01";
  link_ele.setAttribute('rel', 'stylesheet') ;
  link_ele.setAttribute('name', 'wfejs') ;
  link_ele.setAttribute('class', 'append_wfe2') ;
  link_ele.setAttribute('type', 'text/css') ;
  link_ele.setAttribute('href', wfeJsDir + "/wfe.css?"+Math.random()) ; 
  head_el.appendChild(link_ele);//  firefoxでは無理ぽ
  window.setTimeout('eval(1)',0);
}



function init_old_wfe_append1(){
  // headに追加 inouer 13/02/13
  var head_el = document.getElementsByTagName('head')[0];

  var script_init1 = document.createElement('script');
  script_init1.charset = 'UTF-8';
  script_init1.setAttribute('id', 'wfejs_1') ;
  script_init1.setAttribute('name', 'wfejs') ;
  script_init1.setAttribute('class', 'append_wfe2') ;
  script_init1.setAttribute('type', 'text/JavaScript') ;
  script_init1.setAttribute('charset', 'UTF-8') ;  
  script_init1.src = wfeJsDir + "/wfe5util.js?"+Math.random();
  head_el.appendChild(script_init1);//  firefoxでは無理ぽ
  window.setTimeout('eval(1)',0);
}

function init_old_wfe_append2(){
  // headに追加 inouer 13/02/13
  var head_el = document.getElementsByTagName('head')[0];  
  var script_init1 = document.createElement('script');
  script_init1.charset = 'UTF-8';
  script_init1.setAttribute('id', 'wfejs_2') ;
  script_init1.setAttribute('name', 'wfejs') ;
  script_init1.setAttribute('class', 'append_wfe2') ;
  script_init1.setAttribute('type', 'text/JavaScript') ;
  script_init1.setAttribute('charset', 'UTF-8') ;  
  script_init1.src = wfeJsDir + "/wfe5a.js?"+Math.random();
  head_el.appendChild(script_init1);//  firefoxでは無理ぽ
  window.setTimeout('eval(1)',0);
} 

function init_old_wfe_append3(){
  // headに追加 inouer 13/02/13
  var head_el = document.getElementsByTagName('head')[0];
  var script_init1 = document.createElement('script');
  script_init1.charset = 'UTF-8';
  script_init1.setAttribute('id', 'wfejs_3') ;
  script_init1.setAttribute('name', 'wfejs') ;
  script_init1.setAttribute('class', 'append_wfe2') ;
  script_init1.setAttribute('type', 'text/JavaScript') ;
  script_init1.setAttribute('charset', 'UTF-8') ;  
  script_init1.src = wfeJsDir + "/wfe5colorpicker.js?"+Math.random();
  head_el.appendChild(script_init1);//  firefoxでは無理ぽ
  window.setTimeout('eval(1)',0);
}

function init_old_wfe_append4(){
  // headに追加 inouer 13/02/13
  var head_el = document.getElementsByTagName('head')[0];
  var script_init1 = document.createElement('script');
  script_init1.charset = 'UTF-8';
  script_init1.setAttribute('id', 'wfejs_4') ;
  script_init1.setAttribute('name', 'wfejs') ;
  script_init1.setAttribute('class', 'append_wfe2') ;
  script_init1.setAttribute('type', 'text/JavaScript') ;
  script_init1.setAttribute('charset', 'UTF-8') ;  
  script_init1.src = wfeJsDir + "/wfe5autoChecker.js?"+Math.random();
  head_el.appendChild(script_init1);//  firefoxでは無理ぽ
window.setTimeout('eval(1)',0);
}
function init_old_wfe_append5(){
  // headに追加 inouer 13/02/13
  var head_el = document.getElementsByTagName('head')[0];
  var script_init1 = document.createElement('script');
  script_init1.charset = 'UTF-8';
  script_init1.setAttribute('id', 'wfejs_5') ;
  script_init1.setAttribute('name', 'wfejs') ;
  script_init1.setAttribute('class', 'append_wfe2') ;
  script_init1.setAttribute('type', 'text/JavaScript') ;
  script_init1.setAttribute('charset', 'UTF-8') ;  
  script_init1.src = wfeJsDir + "/aira_loaded.js?"+Math.random();
  head_el.appendChild(script_init1);//  firefoxでは無理ぽ
　window.setTimeout('eval(1)',0);
}

function init_old_wfe_append6(){
  // headに追加 inouer 13/02/13
  var head_el = document.getElementsByTagName('head')[0];
  var script_init1 = document.createElement('script');
  script_init1.charset = 'UTF-8';
  script_init1.setAttribute('id', 'wfejs_6') ;
  script_init1.setAttribute('name', 'wfejs') ;
  script_init1.setAttribute('class', 'append_wfe2') ;
  script_init1.setAttribute('type', 'text/JavaScript') ;
  script_init1.setAttribute('charset', 'UTF-8') ;  
  script_init1.src = wfeJsDir + "/aira_extend_post.js?"+Math.random();
  head_el.appendChild(script_init1);//  firefoxでは無理ぽ
　window.setTimeout('eval(1)',0);
}


try{
  init_old_wfe_append1();//wfe5util.js
  //init_old_wfe_append5();//aira_loaded.js  (wfe5util.js でappend )
  //init_old_wfe_append6();//aira_extend_post.js(  aira_loaded.js append)
  //init_old_wfe_append2();//wfe5a.js (main) (aira_loaded.js でappend )
  //init_old_wfe_append3();//wfe5colorpicker.js   (wfe5a.js でappend)
  //init_old_wfe_append4();//wfe5autoChecker.js  (wfe5a.jsでappend)
  //init_wfe_css_append();//wfe.css (wfe5a.js でappend)


}catch(e){
	alert("load error: " + e)
}


window.setTimeout('eval(1)',0);