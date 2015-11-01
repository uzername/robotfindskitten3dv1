/* 
 * load items base from xml
 */
var nkicollection; //names of nki s
function loadbase(filepath) { 
if (window.XMLHttpRequest)  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else   {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.open("GET",filepath,false);
xmlhttp.send();
xmlDoc=xmlhttp.responseXML; 

var x=xmlDoc.getElementsByTagName("item");
var itmcollection = new Array();
for (i=0;i<x.length;i++)   { 
        itmcollection.push(x[i].childNodes[0].nodeValue);
    }
return itmcollection;    
}