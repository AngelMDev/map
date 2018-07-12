
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
var root = [];

function createNode(id=uniqueId(),text=null,coords={x: 180, y: 70}){
  var title=$('#title').val();
  if(text===null)
    var text = $('#text-area').val();
  // id = uniqueId();
  var mynode = new Node(title,id);
  mynode.moveTo(coords);
  mynode.addContent(text);
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

function saveMap() {
  root = [];
  nodeReference.map(function(node){
    node.lookForRoot();
  })
  rootJson(root[0]);
  return dataJson;
}

function defineRoot(node) {
  if (!root.includes(node) && node.connected == true) {
    root.push(node);
  }
}

var text = function(node){
  var textContent = "";
  textContent = node.domElement.children[4].innerHTML;
  return textContent;
}

var support = function(node){
  var supp = [];
  node.childNodes.supporting.map(function(ele){
    supp.push(ele.nodeGroup);
  })
  return supp;
}

var oppose = function(node){
  var opp = [];
  node.childNodes.opposing.map(function(ele){
    opp.push(ele.nodeGroup);
  })
  return opp;
}


var dataJson = {
  formatVersion : 0,
  id : 'root',
  ideas : {
    1 : {}
  }
}
var rootJson = function( root ) {
  var json = dataJson['ideas'][1];
  if ( root ) {
    json.title = text( root );
    json.id = '1';
    json.ideas = {};
    json.position = getNodePosition(root);
  }
  var newJson = json['ideas'];

  var numGroups = 1;
  var pros = support( root );
  var cons = oppose( root );
  evalGroups( pros, cons, newJson, numGroups);

}

var evalGroups = function( pros, cons, json, count ){
  if ( pros.length > 0 ) {
    pros.map( function( groups ) {
      createJSONGroup( pros, json, count, 'supporting')
      count += 1;
    })
  }
  if ( cons.length > 0 ) {
    cons.map( function( groups ) {
      createJSONGroup( cons, json, count, 'opposing')
      count += 1;
    })
  }
}

var createJSONGroup = function( arr, json, count, type ) {
    json[count] = {
      title : 'group',
      id : uniqueId(),
      attr : {
        group : type
      },
      ideas: {}
    }
    var newJson = json[count]['ideas']
    groupContent( arr, newJson )
}

var groupContent = function( arr, json ) {
  arr[0].map(function(node, idx) {
    json[idx+1] = {};
    json[idx+1].title = text(node);
    json[idx+1].id = uniqueId();
    json[idx+1].position = getNodePosition(node);

    var subGroups = 1;
    var subpros = support( node );
    var subcons = oppose( node );
    if ( subpros.length > 0 || subcons.length > 0 ){
      json[idx+1].ideas = {};
      var newJson = json[idx+1].ideas
    }
    evalGroups( subpros, subcons, newJson, subGroups);
  })
}

var getNodePosition = function( node ) {
  var nodePos = {
   y : Number(node.domElement.style.top.slice(0,-2)),
   x : Number(node.domElement.style.left.slice(0,-2))
 }
 return nodePos;
}

// root=createNode("Root");
// ch1=createNode("Child_1",{x: 200, y: 150});
// ch2=createNode("Child_2",{x: 220, y: 230});
// ch1.connectTo(root.supportInput);
// root.updatePosition();
// ch1.updatePosition();
// ch2.updatePosition();

//{id: 0, content: ""}
startingX = 40;
startingY = 120;
xMargin = 190;
yMargin = 80;
columnSize=4;
column=0;
row=0;

function displayNodes(nodeArray){
  for(var i=0;i<nodeArray.length;i++){
    if(column>=columnSize){
      column=0;
      row++;
    }
      node=nodeArray[i];
      createNode(node.id,node.content,{x:startingX + xMargin*column,y:startingY + yMargin*row})
      column++;
    }
}

//Random Node Generator
qty=10;
nodeArray=[{id:"root",content:"bla"}]
for(var j=0;j<qty;j++){
  fakeContent=Math.random().toString(36);
  nodeArray.push({id:j,content:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"})
}

displayNodes(nodeArray);

function remove(array, element) {
    const index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}

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
