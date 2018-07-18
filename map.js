
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
  if (!argmap.root.includes(node) && node.connected == true) {
    argmap.root.push(node);
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

function getPositionAtOrigin(element){
  var nodePos = {
    y : element.domElement.offsetTop+element.domElement.offsetHeight/2,
    x : element.domElement.offsetLeft+element.domElement.offsetWidth/2
  }
  return nodePos;
}

// AVOID COLLISION
function nodesInLevel( level ) {
  var nodeAtLevel = [];
  var tmpOrder = [];
  argmap.nodeReference.forEach( function( node ) {
    if ( node.root != true && node.group != null){
      if ( node.group.level == level ) {
        tmpOrder.push( node )
      }
    }
  })
  // sort by position on x axis
  tmpOrder.sort( function( a, b ) {
    var a = getNodePosition(a).x;
    var b = getNodePosition(b).x;
    return a - b;
  })
  // re-sort by group order
  tmpOrder.forEach( function( node ) {
    if ( node.group.nodeGroup.length == 1 ) {
      nodeAtLevel.push( node );
    } else if ( node.group.nodeGroup.length > 1  ) {
      node.group.nodeGroup.forEach( function( node ) {
        if ( !nodeAtLevel.includes( node ) ){
          nodeAtLevel.push( node );
        }
      })
    }
  })
  return nodeAtLevel;
}

function countNodesInLevel( arrNodes ) {
  return arrNodes.length;
}

function getMaxLevel() {
  var maxLvl = 0;
  argmap.nodeReference.forEach( function( node ) {
    if ( node.root != true && node.group != null ){
      if ( node.group.level > maxLvl ) {
        maxLvl = node.group.level
      }
    }
  })
  return maxLvl
}

function alignNodesInlevel( level ) {
  var arrNodes= nodesInLevel( level );
  var lenghtArrNodes = countNodesInLevel( arrNodes );
  var unit = 85;
  var width = lenghtArrNodes *  unit;
  var halfW = width / 2; //control the space between nodes;
  var quartW = width / 4 ;
  var parentHeight = 0;
  var root = null;
  var numElem = 1 - lenghtArrNodes;
  var height = getNodePosition( arrNodes[ 0 ].group ).y;
  argmap.nodeReference.forEach( function( node ) {
    if( node.root == true) {
      root = node;
    }
  })
  for ( var i = 0; i < lenghtArrNodes; i++ ){
    var node = arrNodes[i];
    var group = node.group;
    var individualPosition = getNodePosition( root );
    individualPosition.y = height + window.scrollY;
    individualPosition.x = individualPosition.x + ( unit * numElem ) ;
    group.moveTo( individualPosition );

    group.updatePosition();
    group.updatePositionWithoutChildren();

    var numNodes = group.nodeGroup.length;
    i = numNodes > 1 ? i + numNodes -1 : i;
    numElem += 2 * numNodes;
  }

}
