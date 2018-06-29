function Group(id, node ){
  // DOM Element creation
  this.domElement = document.createElement('div');
  this.domElement.classList.add('group');
  // this.domElement.classList.add('post');
  this.domElement.classList.add('draggable');
  this.domElement.classList.add('ui-widget-content');
  this.domElement.id=id;
  this.id=id
  // Create output visual
  this.output = new NodeOutput(this);
  this.domElement.appendChild(this.output.domElement);
  // Relationships
  this.parentNode=null;
  // Node Stuffs
  this.nodeGroup = [];
  this.nodeGroup.push(node);
  this.connected = false;
  this.attachedPaths = [];
}
    //DEBUGGING PURPOSES
//   var that=this
//   this.domElement.onclick = function (e){
//     // console.log("Id:",that.id);
//     // console.log("Parent:",that.attachedPaths[0] ? that.attachedPaths[0].input.parentNode : null);
//     // console.log("Children:",that.childNodes);
//     // console.log("===");
//   }
// }
Group.prototype.whosYourDaddy = function(){
  if (this.attachedPaths != 0){
    return this.attachedPaths[0].input.parentNode;
  } else {
    return false;
  }
}

Group.prototype.root = function(){
  if (!this.whosYourDaddy()) {
    var rootEle = this.inputs[0].parentNode;
    defineRoot(rootEle);
  } else {
    var parent = this.whosYourDaddy();
    parent.root();
  }
}

Group.prototype.getOutputPoint = function(){
  var tmp = this.domElement.firstElementChild;
  var offset = GetFullOffset(tmp);
  return {
    x: offset.left + tmp.offsetWidth / 2,
    y: offset.top + tmp.offsetHeight / 2
  };
};

Group.prototype.ownsInput = function(input){
  for(var i = 0; i < this.inputs.length; i++){
    if(this.inputs[i] == input)
      return true;
  }
  return false;
};

Group.prototype.updatePosition = function(){
  var outPoint = this.getOutputPoint();
  var aPaths = this.attachedPaths;
  for(var i = 0; i < aPaths.length; i++){
    var iPoint = aPaths[i].input.getAttachPoint();
    var pathStr = this.createPath(iPoint, outPoint);
    aPaths[i].path.setAttributeNS(null, 'd', pathStr);
  }
  for(var j = 0; j < this.nodeGroup.length; j++){
    this.nodeGroup[j].updatePosition();
  }
};

Group.prototype.updatePositionWithoutChildren = function(){
  var outPoint = this.getOutputPoint();
  var aPaths = this.attachedPaths;
  for(var i = 0; i < aPaths.length; i++){
    var iPoint = aPaths[i].input.getAttachPoint();
    var pathStr = this.createPath(iPoint, outPoint);
    aPaths[i].path.setAttributeNS(null, 'd', pathStr);
  }
}

Group.prototype.createPath = function(a, b){
  aControlPointX=a.x-5;
  aControlPointY=a.y+120;
  bControlPointX=b.x+5;
  bControlPointY=b.y-120;
  return path = SvgPathGenerator()
                  .moveTo(a.x,a.y)
                  .curveTo(aControlPointX,aControlPointY,bControlPointX,bControlPointY,b.x,b.y)
                  .end();
};

Group.prototype.connectTo = function(input){
  if(this.parentNode==input.parentNode)
    return;
  input.node = this;
  this.connected = true;
  this.domElement.classList.add('connected');
  input.domElement.classList.remove('empty');
  input.domElement.classList.add('filled');
  this.parentNode=input.parentNode;
  this.attachedPaths.push({
    input: input,
    path: input.path
  });
  var iPoint = input.getAttachPoint();
  var oPoint = this.getOutputPoint();
  var pathStr = this.createPath(iPoint, oPoint);
  input.path.setAttributeNS(null, 'd',pathStr);
  this.output.path=input.path;
  input.createPath();
  if(input.supports){
    input.parentNode.childNodes.supporting.push(this);
  }else{
    input.parentNode.childNodes.opposing.push(this);
  }
};

Group.prototype.moveTo = function(point){
  if ( typeof point.y == 'number' ) {
    this.domElement.style.top = point.y + 'px';
    this.domElement.style.left = point.x + 'px';
  }
  if ( typeof point.y == 'string' ) {
    this.domElement.style.top = point.y;
    this.domElement.style.left = point.x;
  }
  this.updatePosition();
  //TODO Make nodes inside this group move with the group
};

Group.prototype.initUI = function(){
  var that = this;
  // Make draggable
  $(this.domElement).draggable({
    containment: 'window',
    cancel: '.connection,.output',
    drag: function(event, ui){
      that.updatePosition();
    }
  }).droppable({
  accept: ".node",
  hoverClass: "drop-hover",
  drop: function( event, ui ) {
    var t = ui.draggable[0].node.domElement.style;
    console.log(t);
    that.addNode( ui.draggable[0].node )
    that.updateShape();
    that.updatePosition();
  },
  out: function( event, ui ) {
    that.removeNode( ui.draggable[0].node )
    that.updateShape();
    that.updatePosition();
  }
});
  // Fix positioning
  this.domElement.style.position = 'absolute';

  document.body.append(this.domElement);
  // Update Visual
  this.updatePosition();
};

Group.prototype.addNode = function (node) {
  if ( !this.nodeGroup.includes(node) ){
    this.nodeGroup.push( node )
    node.addToGroup(this);
  }
}

Group.prototype.removeNode = function (node) {
  _.pull(this.nodeGroup,node)
  node.removeFromGroup();
}

Group.prototype.updateShape = function () {
  var count = this.nodeGroup.length;
  var width = 170;
  if ( count ) {
    this.domElement.style.width = count * width + 'px';
  }
  if ( count == 0 ) {
    delete this;
    console.log(this);
  }
}
