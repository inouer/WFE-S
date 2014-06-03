$(document).ready(function(){
	var start = $("#wfeAutoChecker").getAttribute('content');
	var now = new Date();
	var time = now*1 - start;
	console.log(time);
}