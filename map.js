
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

amp=document.getElementById("amp")

var zoomValue=1
function zoomIn(){
  if(zoomValue>=1.5) return;
  $("#amp").animate({zoom: zoomValue+=0.1}, 'fast');
}
function zoomOut(){
  if(zoomValue<=0.5) return;
  $("#amp").animate({zoom: zoomValue-=0.1}, 'fast');
}
function zoomReset(){
  $("#amp").animate({zoom: zoomValue=1}, 'fast');
}

function getPositionAtOrigin(element){
  var nodePos = {
    y : element.domElement.offsetTop+element.domElement.offsetHeight/2,
    x : element.domElement.offsetLeft+element.domElement.offsetWidth/2
  }
  return nodePos;
}

//JQUERY-UI OVERRIDE
$.ui.ddmanager.prepareOffsets = function( t, event ) {

  var i, j,
      m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
      type = event ? event.type : null, // workaround for #2317
      list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();

  droppablesLoop: for ( i = 0; i < m.length; i++ ) {

      // No disabled and non-accepted
      if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ], ( t.currentItem || t.element ) ) ) ) {
          continue;
      }

      // Filter out elements in the current dragged item
      for ( j = 0; j < list.length; j++ ) {
          if ( list[ j ] === m[ i ].element[ 0 ] ) {
              m[ i ].proportions().height = 0;
              continue droppablesLoop;
          }
      }

      m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
      if ( !m[ i ].visible ) {
          continue;
      }

      // Activate the droppable if used directly from draggables
      if ( type === "mousedown" ) {
          m[ i ]._activate.call( m[ i ], event );
      }

      m[ i ].offset = {top:m[ i ].element.offset().top*(zoomValue) , left:m[ i ].element.offset().left*(zoomValue)};
      m[ i ].proportions({ width: m[ i ].element[ 0 ].offsetWidth * (zoomValue), height: m[ i ].element[ 0 ].offsetHeight * (zoomValue) });
  }

};