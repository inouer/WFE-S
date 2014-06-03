

/** HTML5  BUTTON
 *  @args labeltext: TEXT for Button Label,
 *  func: eventFunction 4 Button Click*/
function aira_createButton(labeltext,func){
  var labelSPAN = document.createElement('SPAN');
  labelSPAN.setAttribute('class', 'wfe_label');
  labelSPAN.innerHTML = labeltext;

  var button1 = document.createElement("BUTTON");
  button1.setAttribute('class', '_aira');
  button1.type     = 'button';
  button1.setAttribute('type', 'button');
  button1.onclick  = function(){
    eval(func);
  };
  //button1.appendChild(labelSPAN);
  button1.innerHTML = labeltext;
  return button1;
}

/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *
 *    テーブル編集用
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/
//編集フォームを複数ださないようにロックをかける．
//true:編集中
formlock = false;

AIRA_TABLE = {
  edit_menu: false,
  edit_table_ele: null
};

var AIRA_TABLE_LINE_ID = "aira_tableL";//CSSファイルによる指定あり
var AIRA_TABLE_COLUMN_ID = "aira_tableC";//CSSファイルによる指定あり

/*
 *テーブルの情報  テーブルにイベント追加
 **/
function appendTableEvent(){

  var table_list = document.getElementsByTagName('table');
  var index =0;
  for(index=0; index < table_list.length; index++){

    table_list[index].ondblclick = function(e){
      console.log(e);
      tableEditMenu(e.pageX, e.pageY);

      var elem;
      if (e.target) {  /* Firefox */
        elem = e.target;
      }
      else if (window.event.srcElement) { /* IE */
        elem = window.event.srcElement;
      }
      AIRA_TABLE.edit_table_ele = returnParentNode(elem, elem, 'TABLE');
    }
  }
}

/*
 *テーブルの情報  テーブルからイベント除去
 **/
function removeTableEvent(){
  var table_list = document.getElementsByTagName('table');
  var index =0;
  for(index=0; index < table_list.length; index++){
    table_list[index].ondblclick = function(e){};
  }
}


/*テーブル編集*/
function tableEditMenu(position_left, position_top){

  if(formlock){}
  else{
    formlock=true;
    //メニュー生成
    var tablemenu_id = 'aira_table_menu';

    var float_div = document.createElement("div");
    float_div.setAttribute('type', 'text');
    float_div.setAttribute('name', 'table_menu');
    float_div.setAttribute('id', tablemenu_id);
    float_div.setAttribute('class', 'aira_editmenu');
    float_div.setAttribute('style','top:'+position_top+'px;'
      +'left:'+position_left+'px;');
    float_div.innerHTML ="-Table Edit-<br/>";

    float_div.appendChild(aira_createButton("Save", "saveTableMenu()"));
    float_div.appendChild(aira_createButton("Edit", "tableAllTextare()"));
    float_div.appendChild(aira_createButton("Cancel", "removeTableMenu()"));

    //---------
    float_div.appendChild(document.createElement('BR'));
    var labelSPAN = document.createElement('SPAN');
    labelSPAN.setAttribute('class', 'wfe_label');
    labelSPAN.innerHTML = "Column:No.";
    float_div.appendChild(labelSPAN);
    var button1 = document.createElement("INPUT");
    button1.type     = 'TEXT';
    button1.id     = AIRA_TABLE_COLUMN_ID;
    float_div.appendChild(button1);
    float_div.appendChild(aira_createButton("Add", "clickAddColumn()"));
    float_div.appendChild(aira_createButton("Delete", "clickDelColumn()"));

    //---------ROW 行
    float_div.appendChild(document.createElement('BR'));
    labelSPAN = document.createElement('SPAN');
    labelSPAN.setAttribute('class', 'wfe_label');
    labelSPAN.innerHTML = "Row   : No.";
    float_div.appendChild(labelSPAN);
    button1 = document.createElement("INPUT");
    button1.type     = 'TEXT';
    button1.id     = AIRA_TABLE_LINE_ID;
    float_div.appendChild(button1);
    float_div.appendChild(aira_createButton("Add", "clickAddLine()"));
    float_div.appendChild(aira_createButton("Delete", "clickDelLine()"));



    var doc_body = document.getElementsByTagName('body');
    if(doc_body != null){
      //編集メニューをアペンド
      var main_body = doc_body[0];
      main_body.appendChild(float_div);

      console.log("tableEditMenu;true");
      AIRA_TABLE.edit_menu = true;
      formlock=true;
    } else{
      console.log("tableEditMenu;false");
      AIRA_TABLE.edit_menu = false;
      formlock=false;
    }
  }
}

function saveTableMenu(){
  //メニュー生成
  var tablemenu_id = 'aira_table_menu';
  var sourcearea_id = 'source_are';
  var menu = document.getElementById(tablemenu_id);
  var source = document.getElementById(sourcearea_id);

  if(source != null){
    AIRA_TABLE.edit_table_ele.innerHTML = source.value;
    console.log("ソース編集")
  }else{
    console.log("コマンド編集");
  }

  removeFromParent(menu);
  AIRA_TABLE.edit_menu = false;
  formlock=false;

  //編集対象のテーブルのセレクタ取得 by inoue 2012-08-01
  WFES.targetSelector=getSelector(AIRA_TABLE.edit_table_ele);
  WFES.editType="";
  
  sendHTML();//編集結果送信
}

function removeTableMenu(){
  //メニュー生成
  var tablemenu_id = 'aira_table_menu';
  var menu = document.getElementById(tablemenu_id);
  removeFromParent(menu);
  AIRA_TABLE.edit_menu = false;
  formlock=false;
}

//テーブルのカラムのnum番目の右に追加　0~(length)  0が一番左  (length)と指定なしは一番左
function tableAddWidthColumns(num){
  var mainTable = AIRA_TABLE.edit_table_ele;
  if(mainTable != null){
    tableTRs = mainTable.getElementsByTagName('TR');
    var indexTR = 0;
    for(indexTR=0; indexTR < tableTRs.length; indexTR++){


      var tableTDs = tableTRs[indexTR].children;
      var tdLength = tableTDs.length;
      var insertIndex = parseInt(num);
      if(insertIndex >= 0 ){} else insertIndex = tdLength;//条件は無意味で意味あるから変更不可

      //----------------
      if(tdLength < insertIndex | tdLength == 0 ){
        alert("code:tableAddWidthColumns01 "+"追加すべきカラム("+num+")の要素が見つからなかった");
      }else{

        if(tdLength == insertIndex){
          //行の最後に追加
          var tmp_parent = tableTRs[indexTR];
          var tmp_td = tableTDs[tdLength-1].cloneNode(true);
          tmp_td.innerHTML = "**********";
          tmp_parent.appendChild(tmp_td);

        }else{

          var copyTDs = new Array();
          var index =null;
          for(index=tdLength-1; index >insertIndex-1; index--){
            copyTDs.push(tableTDs[index].cloneNode(true));
          }
          //コピー終り
          var tmp_parent =   tableTDs[0].parentElement;
          for(index=insertIndex+1; index <tdLength; index++){
            tmp_parent.removeChild(tableTDs[insertIndex+1]);
          }
          tableTDs[insertIndex].innerHTML  = "**********";   //アスタリスク
          while(copyTDs.length >0){
            tmp_parent.appendChild(copyTDs.pop());
          }
        }
      }

    }
  }else{
    alert("テーブルがないよ！");
  }
}

//テーブルのカラムのnum番目を削除　0~(length-1)
function tableDelWidthColumns(num){
  var mainTable = AIRA_TABLE.edit_table_ele;
  if(mainTable != null){
    tableTRs = mainTable.getElementsByTagName('TR');
    var indexTR = 0;
    for(indexTR=0; indexTR < tableTRs.length; indexTR++){
      var tableTDs = tableTRs[indexTR].children;
      var tdLength = tableTDs.length;
      var insertIndex = parseInt(num);
      if(insertIndex >= 0 ){} else insertIndex = tdLength-1;//条件は無意味で意味あるから変更不可

      //----------------
      if(tdLength <= insertIndex | tdLength == 0 ){
        alert("code:tableDelWidthColumns01 "+"削除すべきカラム("+num+")の要素が見つからなかった");
      }else{
        var tmp_parent =   tableTDs[0].parentElement;
        tmp_parent.removeChild(tableTDs[insertIndex]);
      }

    }
  }else{
    alert("テーブルがないよ！");
  }
}

//テーブルの行をnum行目に追加  0〜(length) ０は一番上，(length)，指定なしなら最後の行
function tableAddHeightLines(num){
  var mainTable = AIRA_TABLE.edit_table_ele;
  if(mainTable != null){
    var tableTRs = new Array();
    tableTRs = mainTable.getElementsByTagName('TR');
    var trLength =tableTRs.length;
    var insertIndex = parseInt(num);
    if(insertIndex >= 0 ){} else insertIndex = trLength;//条件は無意味で意味あるから変更不可
    //----------------
    if(trLength < insertIndex | trLength == 0 ){
      alert("code:tableAddHeightLines01 "+"追加すべき行("+num+")の要素が見つからなかった");
    }else{

      if(AIRA.debug) console.log(insertIndex+"行目を追加するっちゃ");
      if(trLength == insertIndex){
        //業のの最後に追加
        var tmp_parent = tableTRs[0].parentElement;
        var tmp_tr = tableTRs[trLength-1].cloneNode(true);
        var ast_index = 0;
        var tmp_tds = tmp_tr.getElementsByTagName('TD');
        try{
          for(ast_index =0; ast_index < tmp_tds.length;ast_index++){
            tmp_tds[ast_index].innerHTML = "**********";
          }
        }catch( ex){
          if(AIRA.debug) console.log("tableAddHeightLines:Error_try");
        }
        tmp_parent.appendChild(tmp_tr);

      }else{

        var copyTRs = new Array();
        var index =null;
        for(index=trLength-1; index >insertIndex-1; index--){
          copyTRs.push(tableTRs[index].cloneNode(true));
        }
        //コピー終り
        var tmp_parent =   tableTRs[0].parentElement;
        for(index=insertIndex+1; index <trLength; index++){
          if(AIRA.debug) console.log(index+"行目を削除中("+(insertIndex+1)+")"+tableTRs.length+"/"+trLength);
          tmp_parent.removeChild(tableTRs[insertIndex+1]);
        }
        //該当行をアスタリスク
        try{
          var ast_index = 0;
          var tmp_tds = tableTRs[insertIndex].getElementsByTagName('TD');
          for(ast_index =0; ast_index < tmp_tds.length;ast_index++){
            tmp_tds[ast_index].innerHTML = "**********";
          }
          tmp_tds = tableTRs[insertIndex].getElementsByTagName('TH');
          for(ast_index =0; ast_index < tmp_tds.length;ast_index++){
            tmp_tds[ast_index].innerHTML = "**********";
          }
        }catch( ex){
          console.log("tableAddHeightLines:Error_try");
        }
        //残りの行を追加してく
        while(copyTRs.length >0){
          tmp_parent.appendChild(copyTRs.pop());
        }
      }
    }

  }else{
    alert("code:tableAddHeightLines02 "+"テーブルがないよ！");
  }
}

//テーブルの行をnum行目を削除する  0〜(length-1) 指定なしなら最後の行
function tableDelHeightLines(num){
  var mainTable = AIRA_TABLE.edit_table_ele;
  if(mainTable != null){
    var tableTRs = new Array();
    tableTRs = mainTable.getElementsByTagName('TR');
    var trLength =tableTRs.length;
    var delIndex = parseInt(num);
    if(delIndex >= 0 ){} else delIndex = trLength-1;//条件は無意味で意味あるから変更不可

    if( trLength <= delIndex | trLength == 0 ){
      alert("code:tableDelHeightLines01 "+"消すべき行("+num+")の要素が見つからなかった");
    }else{
      var tmp_parent =   tableTRs[0].parentElement;
      tmp_parent.removeChild(tableTRs[delIndex]);
    }

  }else{
    alert("code:tableDelHeightLines02 "+"テーブルがないよ！");
  }
}
//<------------------------------------------->
//  テキストボックスで指定された行を追加
function clickAddColumn(){
  var num = document.getElementById(AIRA_TABLE_COLUMN_ID);
  if(num != null){
    num = parseInt(num.value);
    if(AIRA.debug) console.log(num+"列目を追加するっちゃ");
    tableAddWidthColumns(num); //指定された列を追加
  }
}
//  テキストボックスで指定された行を追加
function clickAddLine(){
  var num = document.getElementById(AIRA_TABLE_LINE_ID);
  if(num != null){
    num = parseInt(num.value);
    tableAddHeightLines(num); //指定された行を追加
  }
}
//  テキストボックスで指定された列を削除
function clickDelColumn(){
  var num = document.getElementById(AIRA_TABLE_COLUMN_ID);
  if(num != null){
    num = parseInt(num.value)-1;
    if(AIRA.debug) console.log(num+"列目を消すなり")
    tableDelWidthColumns(num);
  }
}
//  テキストボックスで指定された行を削除
function clickDelLine(){
  var num = document.getElementById(AIRA_TABLE_LINE_ID);
  if(num != null){
    num = parseInt(num.value)-1;
    if(AIRA.debug) console.log(num+"行目を消すなり")
    tableDelHeightLines(num); //指定された行を追加
  }

}


// textarea につける
function tableAllTextare(){
  //メニュー生成
  var tablemenu_id = 'aira_table_menu';
  var sourcearea_id = 'source_are';

  var setDiv = document.getElementById(tablemenu_id);
  if(setDiv != null  & AIRA_TABLE.edit_table_ele != null){

    //var inner_source = AIRA_TABLE.edit_table_ele.innerHTML;
    var sourceArea = document.createElement('textarea');
    sourceArea.setAttribute('type', 'textarea');
    sourceArea.setAttribute('id', sourcearea_id);
    sourceArea.setAttribute('style','width:200px;'+'height:50px;');
    sourceArea.setAttribute('name', 'soucearea');
    sourceArea.value  = AIRA_TABLE.edit_table_ele.innerHTML;

    setDiv.appendChild(sourceArea);

  }else
    console.log("そんなメニューなかった");//________________

}

/*
 *  引数の子要素を親要素から削除する
 *  @return 親要素のノード（親がいない場合にはnull）
 **/
function removeFromParent(childEle){
  var parentNode = childEle.parentNode;
  if(parentNode != null)
    parentNode.removeChild(childEle);
  return parentNode;
}

// nowEle から親要素をたどって　tag を探す
function returnParentNode(searchRootEle, nowEle, tag){
  returnEle = null;
  if(nowEle.tagName === 'body'){
    console.log("error 再帰");
    return null;

  }else if(nowEle.tagName === tag){
    returnEle = nowEle;

  }else{
    console.log(nowEle.tagName);
    nowEle = nowEle.parentNode;
    returnEle = returnParentNode(searchRootEle, nowEle, tag);
  }

  return returnEle;
}

/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *
 *    リスト編集用  UL OL(順序釣っき)
 *
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/
AIRA_LIST = {
  edit_menu: false,
  edit_list_ele: null,
  edit_menu_id: 'aira_list_menu',
  edit_input_num:'aira_list_num'
};

/**  リストの情報 リストOLとULににイベント追加 **/
function appendListEvent(){

  // OL
  var obj_list = document.getElementsByTagName('ol');
  var index =0;
  for(index=0; index < obj_list.length; index++){

    obj_list[index].ondblclick = function(e){

      console.log(e);
      listEditMenu(e.pageX, e.pageY);
      var elem;
      if (e.target) {  /* Firefox */
        elem = e.target;
      }
      else if (window.event.srcElement) { /* IE */
        elem = window.event.srcElement;
      }

      AIRA_LIST.edit_list_ele = returnParentNode(elem, elem, 'OL');

    }
  }

  //UL
  obj_list = document.getElementsByTagName('ul');
  for(index=0; index < obj_list.length; index++){
    obj_list[index].ondblclick = function(e){
      listEditMenu(e.pageX, e.pageY);
      var elem;
      if (e.target) {  /* Firefox */
        elem = e.target;
      }
      else if (window.event.srcElement) { /* IE */
        elem = window.event.srcElement;
      }

      AIRA_LIST.edit_list_ele = returnParentNode(elem, elem, 'UL');

    }
  }
}

/**  リストの情報 リストOLとULのイベントを削除 **/
function removedListEvent(){
  // OL
  var obj_list = document.getElementsByTagName('ol');
  var index =0;
  for(index=0; index < obj_list.length; index++){
    obj_list[index].ondblclick = function(e){}
  }
  //UL
  obj_list = document.getElementsByTagName('ul');
  for(index=0; index < obj_list.length; index++){
    obj_list[index].ondblclick = function(e){}
  }
}


/*リスト編集メニュー*/
function listEditMenu(position_left, position_top){

  if(formlock){}
  else{
    formlock = true;
    //メニュー生成
    var listmenu_id = AIRA_LIST.edit_menu_id;

    var float_div = document.createElement("div");
    float_div.setAttribute('type', 'text');
    float_div.setAttribute('name', 'list_menu');
    float_div.setAttribute('id', listmenu_id);
    float_div.setAttribute('class','aira_editmenu');
    /*
  float_div.setAttribute('style','width:200px;'+'height:100px;'
    +'background-color:#AAAAAA;'+'position:absolute;'
    +'z-index:999999;'+'top:'+position_top+'px;'
    +'left:'+position_left+'px;');
   */
    float_div.setAttribute('style','top:'+position_top+'px;'
      +'left:'+position_left+'px;');

    float_div.innerHTML ='-List Edit Menu-<br/>';
    float_div.appendChild(aira_createButton("Save", "saveListMenu()"));
    float_div.appendChild(aira_createButton("Edit", "listAllTextare4List()"));
    float_div.appendChild(aira_createButton("Cancel", "removeListMenu()"));
    //---------
    float_div.appendChild(document.createElement('BR'));
    labelSPAN = document.createElement('SPAN');
    labelSPAN.setAttribute('class', 'wfe_label');
    labelSPAN.innerHTML = "List No.";
    float_div.appendChild(labelSPAN);
    button1 = document.createElement("INPUT");
    button1.type     = 'TEXT';
    button1.id     = AIRA_LIST.edit_input_num;
    float_div.appendChild(button1);

    float_div.appendChild(aira_createButton("Add", "clickAddList()"));
    float_div.appendChild(aira_createButton("Delete", "clickDelList()"));


    var doc_body = document.getElementsByTagName('body');
    if(doc_body != null){
      //編集メニューをアペンド
      var main_body = doc_body[0];
      main_body.appendChild(float_div);
      AIRA_LIST.edit_menu = true;
    }

  }
}

/**  リストの編集結果の保存 */
function saveListMenu(){
  //メニュー生成
  var listmenu_id = AIRA_LIST.edit_menu_id;
  ;
  var sourcearea_id = 'source_are';
  var menu = document.getElementById(listmenu_id);
  var source = document.getElementById(sourcearea_id);

  if(source != null){
    AIRA_LIST.edit_list_ele.innerHTML = source.value;
  //console.log("ソース編集")
  }else{
  //console.log("コマンド編集");
  }
  removeFromParent(menu);
  AIRA_LIST.edit_menu = false;
  formlock = false;
  
  //編集対象のリストのセレクタ取得 by inoue 2012-08-01
  WFES.targetSelector=getSelector(AIRA_LIST.edit_list_ele);
  WFES.editType="";
  
  sendHTML();//編集結果送信
}

//list メニューの除去
function removeListMenu(){
  var tablemenu_id = AIRA_LIST.edit_menu_id;
  ;
  var menu = document.getElementById(tablemenu_id);
  removeFromParent(menu);
  AIRA_TABLE.edit_menu = false;
  formlock = false;
}


//  リストを追加する
//  0だとリストの一番先頭，LI.length だとリストの一番最後
function listAddLI(num){
  var mainList = AIRA_LIST.edit_list_ele;
  if(mainList != null){
    var listLIs = new Array();
    listLIs = mainList.getElementsByTagName('LI');

    var listLength =listLIs.length;
    var insertIndex = parseInt(num);
    if(insertIndex >= 0 ){} else insertIndex = listLength;//条件は無意味で意味あるから変更不可
    if(listLength < insertIndex | listLength == 0 ){
      alert("code:listAddColumn "+"追加すべきLI("+num+")の要素が見つからなかった");
    }else{
      var copyLIs = new Array();
      var index =null;

      if(listLength == insertIndex){
        //リストの最後に追加
        var tmp_parent = listLIs[0].parentElement;
        var tmp_li = listLIs[listLength-1].cloneNode(true);
        tmp_li.innerHTML  = "**********";
        tmp_parent.appendChild(tmp_li);

      }else{

        //リストの途中に追加
        for(index=listLength-1; index >insertIndex-1; index--){
          copyLIs.push(listLIs[index].cloneNode(true));
        }
        //コピー終り
        var tmp_parent = listLIs[0].parentElement;
        for(index=insertIndex+1; index <listLength; index++){
          console.log(index+"行目を削除中("+(insertIndex+1)+")"+listLIs.length+"/"+listLength);
          tmp_parent.removeChild(listLIs[insertIndex+1]);
        }
        listLIs[insertIndex].innerHTML = "**********";

        while(copyLIs.length >0){
          tmp_parent.appendChild(copyLIs.pop());
        }
      }
    }
  }else{
    alert("リストがないよ！");
  }
}

//  リストを削除する
function listDelLI(num){
  var mainList = AIRA_LIST.edit_list_ele;
  if(mainList != null){

    var listLIs = new Array();
    listLIs = mainList.getElementsByTagName('LI');

    var listLength =listLIs.length;
    var delIndex = parseInt(num);
    if(delIndex >= 0 ){} else delIndex = listLength-1;//条件は無意味で意味あるから変更不可
    if(listLength <= delIndex | listLength == 0 ){
      alert("code:listAddColumn "+"削除すべきLI("+num+")の要素が見つからなかった");
    }else{


      if( listLength <= delIndex | listLength == 0 ){
        alert("code:listDelLI "+"消すべLI("+num+")の要素が見つからなかった");
      }else{
        var tmp_parent =   listLIs[0].parentElement;
        tmp_parent.removeChild(listLIs[delIndex]);
      }

    }
  }else{
    alert("リストがないよ！");
  }
}

//  テキストボックスで指定された行を追加
function clickAddList(){
  var num = document.getElementById(AIRA_LIST.edit_input_num);
  if(num != null){
    num = parseInt(num.value);
    if(AIRA.debug) console.log(num+"行目を追加するっちゃ")
    listAddLI(num); //指定された行を追加
  }
} //  テキストボックスで指定された行を追加
function clickDelList(){
  var num = document.getElementById(AIRA_LIST.edit_input_num);
  if(num != null){
    num = parseInt(num.value)-1;
    if(AIRA.debug) console.log(num+"行目を追加するっちゃ")
    listDelLI(num); //指定された行を追加
  }
}

// textarea につける
function listAllTextare4List(){
  //メニュー生成
  var listmenu_id = 'aira_list_menu';
  var sourcearea_id = 'source_are';

  var setDiv = document.getElementById(listmenu_id);
  if(setDiv != null  & AIRA_LIST.edit_list_ele != null){

    //var inner_source = AIRA_TABLE.edit_table_ele.innerHTML;
    var sourceArea = document.createElement('textarea');
    sourceArea.setAttribute('type', 'textarea');
    sourceArea.setAttribute('id', sourcearea_id);
    sourceArea.setAttribute('style','width:200px;'+'height:50px;');
    sourceArea.setAttribute('name', 'soucearea');
    sourceArea.value  = AIRA_LIST.edit_list_ele.innerHTML;

    setDiv.appendChild(sourceArea);

  }else
    console.log("そんなメニューなかった");//________________

}


/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *    XPathによる相対位置特定
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/


//DOMのXPathを取得
function getXPath(elem, xpath){
  if(!xpath)	xpath = "";
  if(!elem)	return xpath;
  if(!elem.parentNode || elem.nodeName=="BODY")	return _getXPath(elem)+"->"+xpath;
  if(xpath == "")	return getXPath(elem.parentNode, _getXPath(elem));
  return getXPath(elem.parentNode, _getXPath(elem)+"->"+xpath);
}
function _getXPath(elem){
  var txt = "";
  var num = 0;
  if(elem.parentNode){
    for(var i=0;i<elem.parentNode.childNodes.length;i++){
      if(elem.parentNode.childNodes[i]==elem)	num=i;
    }
  }
  txt += num+":"+elem.nodeName;
  if(elem.id != "")	txt += "#"+elem.id;
  if(elem.className != "")	txt += "."+elem.className;
  return txt;
}

//XPathからDOMノードを取得
function getElementByXPath(xpath, elem){
  if(!xpath && !elem)	return document.body;
  if(!xpath)	return elem;
  var x = xpath.split("->");
  if(!elem)	return getElementByXPath(removeArray(x,x[0]).join("->"), document.body);
  if(!x[0])	return elem;
  if(elem.childNodes.length==0)	return elem;
  var info = x[0].match(/^([0-9]+):([^#.]+)#?([^.]*)\.?(.*)$/);
  var next = elem.childNodes[info[1]];
  if(next && next.nodeName==info[2] && next.id==info[3] && next.className==info[4])
    return getElementByXPath(removeArray(x,x[0]).join("->"), next);
  return elem;
}

//配列から指定した要素を削除する
function removeArray(ary, elem){
  var newary = Array();
  for(var i=0;i<ary.length;i++){
    if(ary[i]!=elem)	newary.push(ary[i]);
  }
  return newary;
}


/**
 *  AIRA_RESEACHER.researchEleList から引数のtargetEleに近い要素を探索する。
 *
 * *return CommentPosition.silialize
 *  format: this.relate_x+","+this.relate_y+","+this.x_path
 **/
function getNearestEle4XPath(targetId){
  var targetRootEle = document.getElementById(targetId);
  var targetPosition = getElementPosition(targetRootEle);
  var targetX = targetPosition.x;
  var targetY = targetPosition.y;


  //類似度類似度探索
  var searchMax = AIRA_RESEACHER.researchEleList.length;
  //console.log("探索要素数:"+searchMax);
  var searchIndex = 0;
  var similarIndex = 0;
  var distanceMin = 999999;
  var tmp_distance =999999;
  for(searchIndex=0; searchIndex< searchMax; searchIndex++){
    //距離を計算
    tmp_distance =calDistance(targetX,targetY,AIRA_RESEACHER.researchEleList[searchIndex].x,AIRA_RESEACHER.researchEleList[searchIndex].y);
    if(tmp_distance < distanceMin && tmp_distance > 0){
      distanceMin = tmp_distance;
      similarIndex = searchIndex;
    }

  }

  var tmp_similerEle = getElementPosition(AIRA_RESEACHER.researchEleList[similarIndex].element);
  //対象箇所を色で表示
  //floatingWindow(tmp_similerEle.y, tmp_similerEle.x,tmp_similerEle.w,tmp_similerEle.h);
  //console.log("result xpath:"+AIRA_RESEACHER.researchEleList[similarIndex].xpath);
  var simiObj = AIRA_RESEACHER.researchEleList[similarIndex];//
  //console.log("("+targetX+","+targetY+")"    +simiObj.xpath+"["+simiObj.x+","+simiObj.y+"]->"    +"("+(targetX-simiObj.x)+","+(targetY-simiObj.y)+")");

  var returnInfo = new CommentPosition(targetId);
  returnInfo.x_path = simiObj.xpath;
  returnInfo.relate_x = (targetX-simiObj.x);
  returnInfo.relate_y = (targetY-simiObj.y);
  returnInfo.ele = targetRootEle;


  return returnInfo.silialize();
}

/**
 *XPathが入っている場所からから要素の場所を設定する
 *  <comment_id>のDOMを XPathの情報が入っているdata-xpath<X,Y,XPath>
 *
 */
function setCommentPositionFromXPath( comment_id ){

  var setCommentEle = document.getElementById(comment_id);
  //var XPathInfo = setCommentEle.getAttribute("value")
  var XPathInfo = setCommentEle.getAttribute("data-xpath")
  var valueXPath =XPathInfo.replace(/&gt;/g, ">");
  var arrayInfo = valueXPath.split(",");
  var relateX = parseInt(arrayInfo[0]);
  var relateY = parseInt(arrayInfo[1]);
  var relatePath = arrayInfo[2];
  var relateEle = getElementByXPath(relatePath);//基準となるDOM
  var relateElePosition = getElementPosition(relateEle);
  var commentX = relateElePosition.x + relateX;
  var commentY = relateElePosition.y + relateY;

  setCommentEle.style.left = commentX+"px";
  setCommentEle.style.top  = commentY+"px";

  var nowEle = getElementPosition(setCommentEle);
  console.log(comment_id+","+nowEle.x+","+nowEle.y+",");//hyoka
}

/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
*
*    Selectors APIによる相対位置特定
*
*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/

// 2012-07-13 by inouer

//DOMのセレクタを取得
function getSelector(element){
	var selector="";
	// 自分のセレクタを追加
	if(element.nodeName!="body" && element.nodeName!="BODY"){
		var num = 0;
		var garbageCounter=0;
		if(element.parentNode){
			for(var i=0;i<element.parentNode.childNodes.length;i++){
//				if(element.parentNode.childNodes[i]==element){
//					num=i;
//					break;
//				}
				
				if(element.parentNode.childNodes[i].nodeName.match(/^\#/)){
					// childNodesが拾うゴミノードをカウント
					garbageCounter++;
				}else if(element.parentNode.childNodes[i]==element){
					num=i-garbageCounter+1;
					break;
				}
			}
		}
		selector=element.nodeName+":nth-child("+num+")";
		selector=getSelector(element.parentNode)+">"+selector;
	}
	else{
		selector=element.nodeName;
	}
	return selector;
}

/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *  デバック用関数
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/

//指定した位置にオーバーフローして矩形を表示
function floatingWindow(position_top, position_left,width,height){
  var id_selector_float = "www";

  var float_div = document.createElement("div");

  float_div.setAttribute('type', 'text');
  float_div.setAttribute('name', 'overview');
  float_div.setAttribute('id', id_selector_float);

  float_div.style.width = width;
  float_div.style.height =  height;
  float_div.style.top = position_top;
  float_div.style.left= position_left;
  float_div.style.backgroundColor  = '#55FF55';
  float_div.style.position ='absolute';
  float_div.style.zIndex  = 9999;
  float_div.style.opacity = 0.5;

  var doc_body = document.getElementsByTagName('body');
  if(doc_body != null){
    var main_body = doc_body[0];

    main_body.appendChild(float_div);
    console.log("append now");
  }


  return id_selector_float;
}
function codeEscape(input){
  output = input;

  var replace_rule = new RegExp("\\\+", "g");
  var replace_func1  = function(whole,p1){

    return "0x2B";
  };
  return  input.replace(replace_rule,replace_func1);//base64
}
function codeDecode(input){
  output = input;

  var replace_rule = new RegExp("0x2B", "g");
  var replace_func1  = function(whole,p1){
    console.log("+"+p1);
    return "+";
  };
  return  input.replace(replace_rule,replace_func1);//base64
}

/*付箋型コメントの全削除*/
function removeCommentAll(){

  var divBlocks = document.getElementsByTagName('div');
  var bodyRoot = document.getElementsByTagName('body')[0];
  var index = 0;
  var max = divBlocks.length;
  var tmpStr = "";
  for(index=max-1; index > -1; index--){
    if(divBlocks[index].getAttribute('id') == null) continue;
    tmpStr = ""+divBlocks[index].id;
    if( tmpStr.match(/wfecomment/)){
      console.log("delete"+divBlocks[index].id);
      bodyRoot.removeChild(divBlocks[index]);
    }

  }
  sendHTML();
}


/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *
 *    各ノードの座標取得
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/


AIRA_DOM = {
  mouse_x:0,
  mouse_y:0,
  node_list: new Array(),
  domNode_list: new Array(),
  textNode_list: new Array(),
  dom_size:0
}
//searchDOM(document.body,document.body);

/**
 element: ele,
 w: ele.offsetWidth,
 h: ele.offsetHeight,
 x:0,
 y:0
 **/
function getElementPosition(ele){
  var position = {
    element: ele,
    w: ele.offsetWidth,
    h: ele.offsetHeight,
    x:0,
    y:0
  }
  var current_ele = ele;
  while(current_ele != null){
    position.x = position.x + current_ele.offsetLeft;
    position.y = position.y + current_ele.offsetTop;
    current_ele = current_ele.offsetParent;
  }
  return position;
}

function searchDOM(searchNode,nowNode){

  var children = searchNode.childNodes;
  if(children.length == 0){//もう子供がいない

    if(searchNode.attributes == null)
      AIRA_DOM.textNode_list.push(searchNode);
    else
      AIRA_DOM.domNode_list.push(searchNode);

  }else{
    var index = 0;
    for(index=0; index< children.length; index++){
      AIRA_DOM.node_list.push( searchDOM(children[index], nowNode) );
    }

  }

  return searchNode;
}


AIRA_RESEACHER = {
  max_research_depth: 12,
  researchEleList: new Array()
/**
   *newSet.xpath = getXPath( searchEle);
    newSet.element = searchEle;
    newSet.x = tmp_position.x;
    newSet.y = tmp_position.y;
   **/
}

var PositionEleInfo = function(){
  this.xpath  = "";
  this.element= null;
  this.x      = 0;
  this.y      = 0;

}

/**  */
var CommentPosition = function(eleID){
  this.x_path = "";
  this.relate_x = 0;
  this.relate_y = 0;
  this.id = eleID;
  this.ele = null;
  this.silialize = function(){
    return this.relate_x+","+this.relate_y+","+this.x_path;
  }
}
function isBoxElemet(tagName){
  var blockTag=["BODY","DIV","LI","UL","P","FORM","ADDRESS","BLOCKQUATE","CENTER","DL","H1","H2","H3","H4","H5","H6","HR","OL","PRE","TABLE","TD"];
  for(var index=0; index<blockTag.length; index++){
    if(tagName == blockTag[index]){
      //if(AIRA.debug)console.log("tag match");
      return true;
    }else{
  }
  }
  return false;

}

/**　相対位置を求めるための対象DOMのリストを再帰的に作成する　　*/
reseacherDepth = 0;
function reseacherDOM(searchEle,nowEle){
  reseacherDepth++;
  /*
  var nowparent = searchEle;
  var nowchildren = nowparent.children;//DOM要素
   */
  var nowchildren = searchEle.children;//DOM要素

  //if( nowchildren.length != 0 ){//もう子供がいない
  if( reseacherDepth <= AIRA_RESEACHER.max_research_depth &&  nowchildren.length != 0 ){//もう子供がいない
    var children_index;
    for(children_index =0 ; children_index< nowchildren.length; children_index++){
      reseacherDOM(nowchildren[children_index],nowEle);
    }
  }else{}

  //見た目を構成しない要素は排除
  //if(searchEle.tagName != "SCRIPT"){//ブロックもインラインも基準とする
  if(isBoxElemet(searchEle.tagName)){//ブロックのみを基準とする
    var tmp_id =searchEle.id+"";
    isBoxElemet(searchEle.tagName);
    if(tmp_id.indexOf("wfecomment") != 0 && tmp_id.indexOf("aira") != 0)
    {
      var newSet = new PositionEleInfo();
      newSet.xpath = getXPath( searchEle);
      newSet.element = searchEle;
      tmp_position = getElementPosition(searchEle);
      newSet.x = tmp_position.x;
      newSet.y = tmp_position.y;
      AIRA_RESEACHER.researchEleList.push(newSet);
    }else{
  ////wfeのコメントはここにくる
  //  //airaのもの
  //
  }
  }
  reseacherDepth--;
//return nowparent;
}

/**　相対的位置を求めるためのリスト作成命令　*/
function setDOMPositionList(){
  reseacherDepth = 0;
  AIRA_RESEACHER.researchEleList = new Array();
  reseacherDOM(document.body,null);
  if(AIRA.debug) console.log("setDOMPositionList  array-length:"+AIRA_RESEACHER.researchEleList.length);
}


//  x,y に近い span
function getSearchAnchor(x,y){

  search_anchor = 'aira_anchor';
  var replace_kouho1 =  document.getElementsByClassName(search_anchor);
  search_anchor = "wfe-position-marker";//WFE
  replace_kouho1 =  document.getElementsByName(search_anchor);

  var replace_kouho =replace_kouho1;

  var index=0;
  var nearest_index =0;
  var distance =1000000;

  var left   = 0;
  var top    = 0;
  var left_x = 0;
  var top_y  = 0;

  for(index=0; index<replace_kouho.length; index++){
    /*
    	//大きさ
	divAlpha.style.width	= putWidth  +"px";
	divAlpha.style.height = putHeight +"px";
	//位置
	divAlpha.style.left  = putX + "px";
	divAlpha.style.top   = putY + "px";
     */

    left   = getElementPosition(replace_kouho[index]).x;
    top    = getElementPosition(replace_kouho[index]).y;
    left_x = getElementPosition(replace_kouho[index]).w;
    top_y  = getElementPosition(replace_kouho[index]).h;



    //左上
    var tmp_dis = calDistance(x,y,left,top);
    //console.log(index+":>"+tmp_dis);
    if( tmp_dis < distance ){
      distance = tmp_dis;
      nearest_index = index;
    }
    //console.log(tmp_dis,x,y,left,top,left_x,top_y);

    //右上
    tmp_dis = calDistance(x,y,left+left_x,top);
    //console.log(index+":>"+tmp_dis);
    if( tmp_dis < distance ){
      distance = tmp_dis;
      nearest_index = index;
    }
    //左下
    tmp_dis = calDistance(x,y,left,top+top_y);
    //console.log(index+":>"+tmp_dis);
    if( tmp_dis < distance ){
      distance = tmp_dis;
      nearest_index = index;
    }

    //右下
    tmp_dis = calDistance(x,y,left+left_x,top+top_y);
    //console.log(index+":>"+tmp_dis);
    if( tmp_dis < distance ){
      distance = tmp_dis;
      nearest_index = index;
    }



  }
  //console.log("nearest:"+nearest_index);//__________________________
  //replace_kouho[nearest_index].innerHTML = replace_kouho[nearest_index].innerHTML;

  for(index=replace_kouho.length-1; index > -1; index--){
    if(index == nearest_index){
    //console.log(index+"/"+replace_kouho.length+"::"+replace_kouho[index].outerHTML);//__________________________
    }else{
      //console.log(index+"/"+replace_kouho.length+":"+replace_kouho[index].outerHTML);//__________________________
      replace_kouho[index].outerHTML = replace_kouho[index].innerHTML;
    }
  }

}

//  単純文字列ノードサーチャー
function setSearchAnchorSimple(str){

  var regStr = str;
  search_anchor = 'aira_anchor';
  search_anchor = "wfe-position-marker";//WFE
  var documentPage = document.getElementsByTagName('body')[0];
  var pageSource = documentPage.innerHTML;
  var replace_rule = new RegExp(regStr, "g");
  var replace_after = "<span class='"+search_anchor+"'>"+regStr+"2</span>";
  replace_after = "<span name='"+search_anchor+"'>"+regStr+"2</span>";//  WFE
  //pageSource = pageSource.replace(replace_rule,"<span name='"+search_anchor+"'>22"+str+"<span");
  pageSource = pageSource.replace(replace_rule,replace_after);
  documentPage.innerHTML = pageSource;

  pageSource = documentPage.innerHTML;
  replace_rule = new RegExp(regStr+"2", "g");
  replace_after = regStr;
  pageSource = pageSource.replace(replace_rule,replace_after);

  documentPage.innerHTML = pageSource;

}

//  複雑文字列ノードサーチャー　with 正規表現
function setSearchAnchorReg(str){

  var regArr = str.split("");
  //var regStr = "(\\\s|<[^<>]*>)?"; // 「内藤」対策。"(\\\s|<[^<>]*>)?"は一見不用に見えるが、これがないと「内藤」が編集できなくなる。
  var regStr = ""; //

  for(j=0;j<regArr.length-1;j++){
    //		var temp = regEscape("\\Q"+regArr[j]+"\\E");
    var temp = regEscape(regArr[j]);
    regStr += temp + '(\\\s|<[^<>]*>)*';
  //regStr += temp + '(<[^<>]*>)*';
  }
  console.log("setSearchAnchorReg:"+str);//____________________
  regStr += regEscape(regArr[regArr.length-1]);
  regStr = "("+regStr+")";//グループ化
  //console.log(regStr);//____________________________________________
  search_anchor = 'aira_anchor';
  search_anchor = "wfe-position-marker";//WFE
  var documentPage = document.getElementsByTagName('body')[0];
  var pageSource = documentPage.innerHTML;
  var replace_rule = new RegExp(regStr, "g");
  var replace_func1  = function(whole,p1){
    var replace = "<span name='"+search_anchor+"'>"+p1+"</span>";
    //console.log(replace);
    return replace;
  };
  pageSource = pageSource.replace(replace_rule,replace_func1); //複雑文字列ノードサーチャー
  documentPage.innerHTML = pageSource;


}

/**
 *  距離を計算するが
 */
function calDistance(s_x,s_y,e_x,e_y){

  var x_d = s_x - e_x ;
  var y_d = s_y - e_y ;
  if( x_d < 0)
    x_d = 0 - x_d;

  if( y_d < 0)
    y_d = 0 - y_d;


  x_d = x_d * x_d;
  y_d = y_d * y_d;

  return(x_d + y_d);


}

/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *    _AIRA 保守機能
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/

function createResult() {
  if(httpRequest.readyState == 4) {
    //すべてのデータの受信が完了した

    if(httpRequest.status == 200 || httpRequest.status == 201) {
      // リクエストの処理
      if(httpRequest.responseText != null){
        var res_tmp = eval("["+httpRequest.responseText+"]");
        var res = res_tmp[0];
        if(AIRA.debug) console.log(res);
        if(res.status == 200 ){
          //新規ページ作成成功
          if(AIRA.debug) console.log("newpage:"+res.msg);
          alert("新規ページを下記のURLで作成しました\n"+res.msg);
        }else{
          if(AIRA.debug) console.log("newpage error!:["+res.status+"]"+res.msg);
          alert("新規ページの作成に失敗しました");
        }
      } else {}//http request responce

    }else{}//http request status

  }
}

function createNewpage(){
  var filename = window.prompt("新規に作成するページのファイル名を入力してください\n ex) newpage","");

  console.log("file");//____________________________________
  if(window.XMLHttpRequest) {
    // Firefox, Opera など
    httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType('text/xml');
  } else if(window.ActiveXObject) {
    // IE
    try {
      httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
      httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
    }

  }
  if(filename != null & filename != ''){

    console.log("rrr2r");//____________________________________
    var opt = "code="+AIRA.login_pass;
    opt += "&file="+filename;
    httpRequest.open('GET', AIRA.base_url+AIRA.new_url+"?"+opt, true);
    httpRequest.onreadystatechange = createResult;
    httpRequest.send(null);
  }else{
    alert("新規ページを作成しませんでした．");
    console.log("rrrr");//____________________________________
  }
}


/* パスワード変更  */
function changePwd(){

  var getResultPWD = function(){
    if(window.pwdRequest.readyState == 4) {
      //すべてのデータの受信が完了した
      if(window.pwdRequest.status == 200 || window.pwdRequest.status == 201) {
        // リクエストの処理
        if(window.pwdRequest.responseText != null){
          var res = eval("["+window.pwdRequest.responseText+"]");
          AIRA.login_status = res[0];
          if(AIRA.login_status.status == 200 | AIRA.login_status.status == 300){
            if(AIRA.debug) console.log(AIRA.login_status);//____________________
            AIRA.login_pass = AIRA.login_status.code;
            alert("パスワードを"+AIRA.login_status.code+"に変更しました");
          }else{
            AIRA.login_flag = false;
            if(AIRA.debug)console.log(AIRA.login_status);//____________________
            alert("認証に失敗し変更できませんでした");
            logoutFunc();
          }

        } else {}//http request responce
      }
      window.pwdRequest = null;
    }else{}//http request status

  };


  if( AIRA.login_flag){
    var recode = window.prompt("変更後のパスワードを入力","");
    if(recode != null){
      var code = AIRA.login_pass;
      if(window.XMLHttpRequest) {
        // Firefox, Opera など
        window.pwdRequest = new XMLHttpRequest();
        window.pwdRequest.overrideMimeType('text/xml');
      } else if(window.ActiveXObject) {
        // IE
        try {
          window.pwdRequest = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {
          window.pwdRequest = new ActiveXObject('Microsoft.XMLHTTP');
        }

      }
      var opt = "code="+code+"&recode="+recode;
      //window.pwdRequest.open('GET', AIRA.base_url+AIRA.wfe_url+"?"+opt, true);
      window.pwdRequest.open('GET', AIRA.base_url+"?"+opt, true);
      window.pwdRequest.onreadystatechange = getResultPWD;
      window.pwdRequest.send(null);

    }else{}  //変更をキャンセル
  }else{}//ログインしていない
}


/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *    _AIRA 編集追加機能
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/
/* タイトル変更  */
function changeTitle(){
  var titleEle = null;
  var tmpEle = null;

  tmpEle = document.getElementsByTagName('TITLE');
  if(tmpEle.length==0){
    titleEle = document.createElement('TITLE');
    tmpEle = document.getElementsByTagName('HEAD')[0];
    tmpEle.appendChild(titleEle);
  }else{
    titleEle = tmpEle[0];
  }

  var titleStr = window.prompt("ページのタイトル変更",titleEle.innerHTML);
  if(titleStr!=null){
    titleEle.innerHTML = titleStr;
    
    WFES.editType = "editTitle";
    
    sendHTML();//プロンプトでキャンセルされてないら送信
  }
}

/* 背景色変更  */
function changeBgcolor(){
  var bodyEle = null;
  var tmpEle = null;

  bodyEle = document.getElementsByTagName('BODY')[0];
  var bgcolor = bodyEle.getAttribute("bgcolor");
  var bgcolor = window.prompt("背景色変更\n（指定フォーマット#FFFFFF）",bgcolor);

  if(bgcolor!=null){
    var reg = new RegExp("^#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]$", "i");
    if (bgcolor.match(reg)) {
      bodyEle.setAttribute("bgcolor", bgcolor);
      sendHTML();//プロンプトでキャンセルされてないら送信

    }else{
      alert("指定フォーマットは６桁の１６進数　RGBです　例）#F0F0F0");
      changeBgcolor();
    }
  }
}

/* リンクの文字列を修正可能に */

tmpLink = null;
tmpLinkParent = null
function dummyFunc(){
  return false;
}

function avoidLinkArea(){
  var nowEdit = document.getElementById('wfe-inline-editor');
  if(nowEdit != null){
    var parent = nowEdit.parentElement;
    if(parent.tagName == 'A'){
      tmpLink = parent.getAttribute('href');
      parent.setAttribute('href','#inlinetextfield');
      parent.setAttribute('href','javascript:void(0);');

      if (parent.addEventListener){
        parent.addEventListener('click', dummyFunc, false);
        parent.onclick = dummyFunc;
        console.log(parent.onclick);
      } else if (parent.attachEvent){
        parent.attachEvent('onclick', dummyFunc);
      }


    }
  }
  return false;
}

function bypassLinkArea(){
  var parent = null;
  var nowEdit = document.getElementById('wfe-inline-editor');
  if(nowEdit != null){
     parent = nowEdit.parentElement;
    if(parent.tagName == 'A'){
      tmpLinkParent = parent;
      parent.setAttribute('href',tmpLink);
      setTimeout("resetLinkClick();",2000);
    }
  }
  //return parent;
  return false;
}

function resetLinkClick(){
   tmpLinkParent.onclick = '';
   tmpLinkParent = null;
}

/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *    _AIRA 画像機能
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/


var imgmenu_id = 'aira_img_menu';

//ファイルの読み込みをおこなう
function handleFileSelectEdit(evt) {
  var files = evt.target.files; // FileList object

  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {

    // Only process image files.
    if (!f.type.match('image.*')) {
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {

      return function(e) {
        console.log(e);

        //2012-4-10 挿入した画像をアップロードしてサムネイルのために再取得 by inoue
        $.ajax({
			url : AIRA.base_url+"/uploadimg",
			type: "POST",
			data: {file: e.target.result},
			success: function(res){
				alert(res);

				$.ajax({
					url : AIRA.base_url+res,
					type: "GET",
					success: function(image){
						// Render thumbnail.
				        var span = document.createElement('span');
				        span.innerHTML = ['<img class="thumb" src="', image,
				        '" title="', res, '"/>'].join('');
				        document.getElementById(imgmenu_id).insertBefore(span, null);

					}
				});

//				// Render thumbnail.
//		        var span = document.createElement('span');
//		        span.innerHTML = ['<img class="thumb" src="', AIRA.base_url+res,
//		        '" title="', theFile.name, '"/>'].join('');
//		        document.getElementById(imgmenu_id).insertBefore(span, null);
			}
		});

//        // Render thumbnail.
//        var span = document.createElement('span');
//        span.innerHTML = ['<img class="thumb" src="', e.target.result,
//        '" title="', theFile.name, '"/>'].join('');
//        document.getElementById(imgmenu_id).insertBefore(span, null);

      };
    })(f);

    reader.readAsDataURL(f);//ファイル読み込んでBASE64

  }
}

/*画像アップメニュー*/
function addImgMenu(position_left, position_top){
  //メニュー生成


  var float_div = document.createElement("div");
  float_div.setAttribute('type', 'text');
  float_div.setAttribute('name', 'img_menu');
  float_div.setAttribute('id', imgmenu_id);
  float_div.setAttribute('class','aira_editmenu');
  float_div.setAttribute('style','top:'+position_top+'px;'
    +'left:'+position_left+'px;');

  float_div.innerHTML ='画像アップ';
  float_div.appendChild(aira_createButton("固定", "setImg2Comment('"+imgmenu_id+"')"));
  float_div.appendChild(aira_createButton("キャンセル", "removeImgMenu('"+imgmenu_id+"')"));
  float_div.appendChild(document.createElement('BR'));
  float_div.appendChild(aira_createButton("拡大", "setImgZoom('"+imgmenu_id+"',true)"));
  float_div.appendChild(aira_createButton("縮小", "setImgZoom('"+imgmenu_id+"',false)"));
  float_div.appendChild(document.createElement('BR'));

  var inputEle = document.createElement('INPUT');
  inputEle.setAttribute('type', 'file');
  inputEle.setAttribute('id', 'editfile');
  float_div.appendChild(inputEle);

  var doc_body = document.getElementsByTagName('body');
  if(doc_body != null){
    //編集メニューをアペンド
    var main_body = doc_body[0];
    main_body.appendChild(float_div);

    document.getElementById('editfile').addEventListener('change', handleFileSelectEdit, false);
  }
}

//画像編集メニュー削除
function removeImgMenu(menu_id){
  console.log("表示中のID"+menu_id);
  var menu = document.getElementById(menu_id);
  removeFromParent(menu);
}

//画像をコメントモードに変更したい
function setImg2Comment(menu_id){
  var menu = document.getElementById(menu_id);
  var imgEle = menu.getElementsByTagName('IMG');//画像を取得
  if(imgEle==null){
    removeImgMenu(menu_id)
  }else{
    //画像を取り出す
    var imgClone = imgEle[0].cloneNode(true)

    var layoj = document.createElement('div') ;
    var k=1;
    while(document.getElementById('wfecomment' + k) != null)k++;

    var tempCommentID = 'wfecomment' + k;
    layoj.setAttribute('id', tempCommentID);
    layoj.style.position = "absolute";
    layoj.style.left = mMouse.x +"px";
    layoj.style.top = mMouse.y +"px";
    layoj.style.color = "black";
    layoj.style.backgroundColor = "transparent";
    layoj.style.zIndex = 10;
    var styleStrX = "position: absolute; color: black; background-color: transparent; z-index: 10; left: "+mMouse.x+"px; top: "+mMouse.y+"px;";
    layoj.setAttribute('style',styleStrX);
    // Render thumbnail.
    var span = document.createElement('span');
    layoj.innerHTML = ['<img class="thumb" ',
    ' title="', imgClone.title,
    '"  style="width:',imgClone.width,'px;height:',imgClone.height,"px",
    '"  src="', imgClone.src,'"/>'].join('');


    //layoj.appendChild(span);

	//2012-4-3 bodyではなく隠れiframe要素を除いたdivに追加する by inoue
    //document.getElementsByTagName('BODY')[0].appendChild(layoj);
	document.getElementById('body_part').appendChild(layoj);

    var menu = document.getElementById(menu_id);
    removeFromParent(menu);


    var getXpathInfo = getNearestEle4XPath(tempCommentID);
    layoj.setAttribute("data-xpath", getXpathInfo);//valueは仕様的には存在しない

    eval('setCommentEvent();');//コメントにイベント付加する
    sendHTML();//hozonn
  }
}


function setImgZoom(menu_id,zoomflag){
  var menu = document.getElementById(menu_id);
  var imgEle = menu.getElementsByTagName('IMG');//画像を取得
  if(imgEle==null){
    removeImgMenu(menu_id)
  }else{
    //画像を取り出す

    var now_W = imgEle[0].width;
    var now_H = imgEle[0].height;
    if(zoomflag){// trueなら拡大
      imgEle[0].width = parseInt( now_W *1.1 );
      imgEle[0].height = parseInt( now_H *1.1 );
    }else{

      imgEle[0].width = parseInt( now_W *0.9 );
      imgEle[0].height = parseInt( now_H *0.9 );
    }
    console.log(now_W+"x"+now_H+">>"+imgEle[0].width+"x"+imgEle[0].height);
  }
}


/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
*
*
*    評価実験　<span id="hyoka1"></span>
*
*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/
function hyokaHeader(){
  var k=1;

  console.log("ウィンドウサイズ 横　縦,"+window.innerWidth+","+window.innerHeight+",");
  while(document.getElementById('hyoka' + k) != null){

    var target = document.getElementById('hyoka' + k);
    var targetInfo = getElementPosition(target);
    console.log(target.id+","+targetInfo.x+","+targetInfo.y+",");
    k++;
  }
  AIRA_RESEACHER.max_research_depth = getMaxDepth(document.body);
  //AIRA_RESEACHER.max_research_depth = getMaxDepth(document.body) -2 ;
  //AIRA_RESEACHER.max_research_depth = 0;
  console.log("評価の深さ,"+AIRA_RESEACHER.max_research_depth+",/"+getMaxDepth(document.body)+"");


}



/**　DOM ツリーの最大の深さを求める　　*/
maxTreeDepth=0;
searchTreeDepth = 0;
function getMaxDepth(searchEle){
  searchTreeDepth++;
  if(maxTreeDepth < searchTreeDepth){
    maxTreeDepth = searchTreeDepth;//
  }
  var nowchildren = searchEle.children;//DOM要素

  if( nowchildren.length != 0 ){//もう子供がいない
    var children_index;
    for(children_index =0 ; children_index< nowchildren.length; children_index++){
      getMaxDepth(nowchildren[children_index]);
    }
  }else{}



  searchTreeDepth--;
  return maxTreeDepth;
}

hyokaHeader();

/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *    _AIRAイベント付加
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/
appendTableEvent();//テーブルの編集
setDOMPositionList();//相対位置
appendListEvent();//リストの編集



function css_load_check(){
  var css_link = document.getElementById("wfe_css_append01");
  if(css_link){
    console.log("cssある");
  }else{
    console.log("cssない");

    init_wfe_css_append();//wfe.css
    setCommentEvent();
    appendTableEvent();
    appendListEvent();//リストの編集
  }


}

/**バックのajax通信停止　*/
function bgdlstop(){
  return window.clearTimeout(AIRA.timerID);
}



/*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_
 *
 *
 *    AIRA JS LOAD
 *
 *_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*/
/*最初の考え
  init_old_wfe_append3();//wfe5colorpicker.js   (aira_loaded でappend)
  init_old_wfe_append4();//wfe5autoChecker.js  (aira_loaded でappend)
 */

AIRA.table  =   AIRA_TABLE;
AIRA.list   =   AIRA_LIST;
AIRA.dom    =   AIRA_DOM;
AIRA.reseacher =AIRA_RESEACHER;
AIRA.timerID = 0;
AIRA.stop = bgdlstop;


///init_old_wfe_append2();// next >  wfe5a.js
init_old_wfe_append6();//next >aira_extend_post.js
