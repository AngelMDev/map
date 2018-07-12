
var uniqueId = function() {
  return Math.random().toString(36).substr(2, 16);
};
// SVG SETUP
// ===========
var svg = document.getElementById('svg');
svg.ns = svg.namespaceURI;

// MOUSE SETUP
// =============
var mouse = {
  currentInput: null,
  createPath: function(a, b){
    var xModifier=5;
    var yModifier=Math.abs(a.y-b.y);
    if(Math.abs(a.x-b.x)<20){
      xModifier=0;
    }
    aControlPointX=a.x-xModifier;
    aControlPointY=a.y+yModifier;
    bControlPointX=b.x+xModifier;
    bControlPointY=b.y-yModifier;
    return path = SvgPathGenerator()
                    .moveTo(a.x,a.y)
                    .curveTo(aControlPointX,aControlPointY,bControlPointX,bControlPointY,b.x,b.y)
                    .end();
   }
};
//Nontouch devices
window.onmousemove = function(e){
  if(mouse.currentInput){
    var p = mouse.currentInput.path;
    var iP = mouse.currentInput.getAttachPoint();
    var oP = {x: e.pageX, y: e.pageY};
    var s = mouse.createPath(iP, oP);
    p.setAttributeNS(null, 'd', s);
  }
};
//Touch devices
window.ontouchmove = function(e){
  if(mouse.currentInput){
    var p = mouse.currentInput.path;
    var iP = mouse.currentInput.getAttachPoint();
    var oP = {x: e.touches[0].pageX, y: e.touches[0].pageY};
    var s = mouse.createPath(iP, oP);
    p.setAttributeNS(null, 'd', s);
  }
}

window.onclick = function(e){
  if(mouse.currentInput){
    mouse.currentInput.path.removeAttribute('d');
    if(mouse.currentInput.node){
      mouse.currentInput.node.detachInput(mouse.currentInput);
    }
    mouse.currentInput = null;
  }
};

// CLEAN UP AND ACTUAL CODE [WIP]
// ================================

function GetFullOffset(element){
  var offset = {
    top: element.offsetTop,
    left: element.offsetLeft,
  };

  if(element.offsetParent){
    var po = GetFullOffset(element.offsetParent);
    offset.top += po.top;
    offset.left += po.left;
    return offset;
  }
  else
    return offset;
}
//===================MY CODE===================

var nodeReference = [];

function createNode( id = uniqueId(), text = null, coords = { x : 180, y : 70 } ){
  id = uniqueId();
  var mynode = new Node( title = null, id );
  mynode.moveTo(coords);
  mynode.addContent( text, false );
  mynode.initUI();
  nodeReference.push(mynode)
  return mynode;
}

function createGroup(text=null,coords={x: 480, y: 70}, node, type ){
  id = uniqueId();
  var myGroup = new Group(id, node, type);
  myGroup.moveTo(coords);
  myGroup.initUI();
  return myGroup;
}

function deleteDiv(ele) {
  $(ele.parentElement).remove();
}

function defineRoot(node) {
  if (!root.includes(node) && node.connected == true) {
    root.push(node);
  }
}

var getNodePosition = function( node ) {
  var nodePos = {
   y : node.domElement.offsetTop,
   x : node.domElement.offsetLeft
 }
 return nodePos;
}

//Zoom Functionality stuff (doesn't work)
amp=document.getElementById("amp")
nodeReference.forEach(function(node){
  amp.appendChild(node.domElement);
})

var zoomValue=1
function zoomIn(){
  $("#amp").animate({zoom: zoomValue+=0.1}, "slow");
}
function zoomOut(){
  $("#amp").animate({zoom: zoomValue-=0.1}, "slow");
}
