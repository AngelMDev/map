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
    var diff = {
      x: b.x - a.x,
      y: b.y - a.y
    };

    var pathStr = 'M' + a.x + ',' + a.y + ' ';
    pathStr += 'C';
    pathStr += a.x + diff.x / 3 * 2 + ',' + a.y + ' ';
    pathStr += a.x + diff.x / 3 + ',' + b.y + ' ';
    pathStr += b.x + ',' + b.y;
    return pathStr;
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
    console.log("click")
    mouse.currentInput.path.removeAttribute('d');
    if(mouse.currentInput.node){
      // mouse.currentInput.node.detachInput(mouse.currentInput);
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
var root = [];
function createNode(){
  var title=$('#title').val();
  var area = $('#text-area').val();
  id = uniqueId();
  var mynode = new Node(title,id);
  mynode.moveTo({x: 180, y: 70});
  mynode.addContent(area);
  mynode.initUI();
  nodeReference.push(mynode)
}


function deleteDiv(ele) {
  $(ele.parentElement).remove();
}

function saveMap() {
  root = [];
  nodeReference.map(function(node){
    node.root();
  })
  // var lastNode = nodeReference[nodeReference.length-1];
  // lastNode.root();

}

function defineRoot(node) {
  if (!root.includes(node)) {
    root.push(node);
  }
}

function getContentNode(){
  var content = root[0].domElement.children[2].innerHTML;
  console.log(content);
}

function createJSON(){
  var data = {
    "id": "root",
    "ideas": {}
  }


}
