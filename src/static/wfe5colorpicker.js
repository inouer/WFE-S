var r,g,b = 0;

var targetObj;
function color_picker_clicked(colorPixelObject,flug) {
  colorCode = colorPixelObject.getAttribute('bgcolor');
  document.colorTextForm.colorText.value = colorCode;
  if(flug == "backgroundColor")
    document.getElementById(targetObj).style.backgroundColor = 
    colorCode;
  else if(flug == "color"){
    document.getElementById(targetObj).style.color = colorCode;
  }
}
function color_picker_colored( colorCode,flug) {
  if(flug == "backgroundColor")
    document.getElementById(targetObj).style.backgroundColor = 
    colorCode;
  else if(flug == "color"){
    document.getElementById(targetObj).style.color = colorCode;
  }
}

function HSVtoRGB(h,s,v){
  r = g = b = 0;
  if (s < 0) s = 0;
  if (s > 1) s = 1;
  if (v < 0) v = 0;
  if (v > 1) v = 1;
  h = h % 360;
  if (h < 0) h = h + 360;
  h = h / 60;
  i = Math.floor(h);
  f = h - i;
  p1 = v * (1 - s);
  p2 = v * (1 - s*f);
  p3 = v * (1 - s*(1 - f));
  if (i == 0) {
    r = v;
    g = p3;
    b = p1;
  }
  if (i == 1) {
    r = p2;
    g = v;
    b = p1;
  }
  if (i == 2) {
    r = p1;
    g = v;
    b = p3;
  }
  if (i == 3) {
    r = p1;
    g = p2;
    b = v;
  }
  if (i == 4) {
    r = p3;
    g = p1;
    b = v;
  }
  if (i == 5) {
    r = v;
    g = p1;
    b = p2;
  }
}

function writeBar(Hx,Sx,Vx,flug){
  HSVtoRGB(Hx,Sx,Vx);
  r = Math.floor(r * 255).toString(16);
  g = Math.floor(g * 255).toString(16);
  b = Math.floor(b * 255).toString(16);
  if (r.length < 2) r = "0" + r;
  if (g.length < 2) g = "0" + g;
  if (b.length < 2) b = "0" + b;
  c = "#"+r+g+b;
  cc = r + g + b;
  //var tempStr = "<td bgcolor='"+c+"' name='"+cc+"' onClick='remove_picker();' onmouseover='color_picker_clicked( this,\""+flug+"\")' width='10' height='10'><img src='toka.gif' width='10' height='10'></td>";
  var tempStr = "<td bgcolor='"+c+"' name='"+cc+"' onClick='remove_picker();' onmouseover='color_picker_clicked( this,\""+flug+"\")' width='10' height='10'></td>";
  
  return tempStr;
}

function remove_picker(){
  var layobj = document.getElementById('colorpicker');
  layobj.parentNode.removeChild(layobj);
}

function output_picker(x,y,obj,flug){
  targetObj = obj;
  var layoj0 = document.createElement('div')
  layoj0.setAttribute('id','colorpicker');
  layoj0.setAttribute('name','colorpicker');
  layoj0.style.position = "absolute";
  layoj0.style.border = "1px solid black";
  layoj0.style.left = x+"px";
  layoj0.style.top = y+"px";
  layoj0.style.backgroundColor = "#aaaaaa";
  layoj0.style.zIndex = 30000;
  var htmlStr = "<span bgcolor='transparent' onClick='remove_picker();' onmouseover='color_picker_clicked( this, \""+flug+"\")' style='font-weight: bold;'>Transparent</span>"
  htmlStr += "<table cellpadding=0 cellspacing=0 border=0>";
  for (H=0; H<360 ; H+=30){
    htmlStr += "<tr>";
    for (S=0; S<1; S+=0.15) htmlStr += writeBar(H,S,1,flug);
    for (V=0; V<1; V+=0.15) htmlStr +=  writeBar(H,1,1-V,flug);
    htmlStr += "</tr>";
  }
  htmlStr += "</table>";
  htmlStr += "<form name='colorTextForm'><input name='colorText' type='text' size='8' value='#'><input type='button'  value='submit' onclick='color_picker_colored(document.colorTextForm.colorText.value,\""+flug+"\");remove_picker();'></form>";
  layoj0.innerHTML =htmlStr;
  document.body.appendChild(layoj0);
}