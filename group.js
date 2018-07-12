function Group(id, node, type){
  // DOM Element creation
  this.domElement = document.createElement('div');
  this.domElement.classList.add('group');
  this.type = type;
  this.domElement.classList.add(type ? 'supp' : 'opp');
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
// }
    //DEBUGGING PURPOSES
  var that=this
  this.domElement.ondblclick = function (e){
    that.changeRelation();
  }
}
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
    var pathColor = this.type ? '#409966' : '#ff0000';
    aPaths[i].path.setAttributeNS(null, 'stroke', pathColor);
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
    var pathColor = this.type ? '#409966' : '#ff0000';
    aPaths[i].path.setAttributeNS(null, 'stroke', pathColor);
  }
}

Group.prototype.createPath = function(a, b){
  var xModifier=5;
  var yModifier=Math.abs(a.y-b.y);
  if(Math.abs(a.x-b.x)<20){
    return path = SvgPathGenerator()
                      .moveTo(a.x,a.y)
                      .lineTo(b.x,b.y)
                      .end();
  }
  aControlPointX=a.x-xModifier;
  aControlPointY=a.y+yModifier;
  bControlPointX=b.x+xModifier;
  bControlPointY=b.y-yModifier;
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
  input.createPath(this.type);
  if(this.type){
    input.parentNode.childNodes.supporting.push(this);
  }else{
    input.parentNode.childNodes.opposing.push(this);
  }
  input.parentNode.connected = true;
};

Group.prototype.moveTo = function(point){
  if ( typeof point.y == 'number' ) {
    this.domElement.style.top = ( point.y ) + 'px';
    this.domElement.style.left = point.x + 'px';
  }
  if ( typeof point.y == 'string' ) {
    this.domElement.style.top = ( point.y );
    this.domElement.style.left = point.x;
  }
  this.updatePosition();
  this.alignGroup()
};

Group.prototype.initUI = function(){
  var that = this;
  // Make draggable
  $(this.domElement).draggable({
    containment: 'window',
    cancel: '.connection,.output',
    cursor: 'move',
    drag: function(event, ui){
      that.updatePosition();
      that.alignGroup();
    },
    stop: function(event, ui){
      that.alignGroup();
    }
  }).droppable({
  accept: ".node",
  tolerance: "pointer",
  hoverClass: function () {
    if ( that.type ) {
      return 'drop-supp';
    } else {
      return 'drop-opp';
    }
  },
  drop: function( event, ui ) {
    that.addNode( ui.draggable[0].node );
    that.updateShape();
    that.alignNode( ui.draggable[0].node );
    var currentPosition = getNodePosition(that);
    currentPosition.x = currentPosition.x - 85;
    that.moveTo(currentPosition);
    that.parentNode.arrangeGroups();
  },
   out: function( event, ui ) {

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
  _.pull(this.nodeGroup,node);
  if(this.nodeGroup.length<1){
    if(this.type){
      _.pull(this.parentNode.childNodes.supporting,this)
      if (this.parentNode.childNodes.supporting.length == 0 && this.parentNode.childNodes.supporting.length == 0) {
        this.parentNode.connected = false;
      }
    }else {
      _.pull(this.parentNode.childNodes.opposing,this)
      if (this.parentNode.childNodes.supporting.length == 0 && this.parentNode.childNodes.supporting.length == 0) {
        this.parentNode.connected = false;
      }
    }
  }
  node.removeFromGroup();
  this.alignGroup();
}

Group.prototype.updateShape = function () {
  var count = this.nodeGroup.length;
  var width = 170;
  if (count) {
    this.domElement.style.width = count * width + 'px';
    this.updatePosition();
  }
  if (count == 0) {
    this.domElement.remove();
  }
}

Group.prototype.alignNode = function (node) {
  var count = this.nodeGroup.length;
  var unit = 174;
  var nodeStyles = node.domElement.style;
  var groupPosition = getNodePosition(this);
  nodeStyles.left = groupPosition.x + (unit * (count - 1));
  nodeStyles.top = groupPosition.y + 7;
}

Group.prototype.alignGroup = function () {
  var that = this;
  this.nodeGroup.map( function( node, idx ) {
    var count = that.nodeGroup.length;
    var unit = 174;
    var nodeStyles = node.domElement.style;
    var groupPosition = getNodePosition(that);
    nodeStyles.left = groupPosition.x + (unit * idx);
    nodeStyles.top = groupPosition.y + 7;
  })
}

Group.prototype.detachInput = function(input){
  var index = -1;
  for(var i = 0; i < this.attachedPaths.length; i++){
    if(this.attachedPaths[i].input == input)
      index = i;
  };

  if(index >= 0){
    this.attachedPaths[index].path.removeAttribute('d');
    this.attachedPaths[index].input.node = null;
    this.attachedPaths.splice(index, 1);
  }

  if(this.attachedPaths.length <= 0){
    this.domElement.classList.remove('connected');
  }
  this.nodeGroup.map( function ( node ) {
    node.removeFromGroup()
  })
  input.domElement.classList.remove('filled');
  input.domElement.classList.add('empty');
};

Group.prototype.createAt = function( parent){
  var parentPosition = getNodePosition(parent);
  var parentHeight = parent.calcHeight();
  parentPosition.y = parentPosition.y + 70 + parentHeight + window.scrollY;

  if ( typeof parentPosition.y == 'number' ) {
    this.domElement.style.top = parentPosition.y + 'px';
    this.domElement.style.left = parentPosition.x + 'px';
  }
  if ( typeof parentPosition.y == 'string' ) {
    this.domElement.style.top = parentPosition.y;
    this.domElement.style.left = parentPosition.x;
  }
  this.updatePosition();
  this.alignGroup()
};

// Group.prototype.allTheChildren = function() {
//   var nodeInGroup = this.nodeGroup;
//   var unit = 175;
//   var width = nodeInGroup.length *  unit;
//   var halfW = width / 2; //control the space between nodes;
//   var quartW = width / 4 ;
//   var parent = this;
//   var numElements = 2; //to count the number of nodes in all the groups
// // counting the number of nodes in all the groups
//   var control = 2;
//   nodeInGroup.map( function( node ){
//     var childrens = node.childNodes;
//     control -= 1
//     for ( var group in childrens ) {
//       childrens[ group ].map( function( group ) {
//         if ( group.nodeGroup ) {
//           group.nodeGroup.map( function( node ) {
//             numElements -= 1
//           })
//         }
//       })
//     }
//   })
//   if ( numElements < control ){
//     nodeInGroup.map( function( node ) {
//       var childrens = node.childNodes;
//       for ( var group in childrens ) {
//         childrens[ group ].map( function( group ) {
//           if ( group.nodeGroup ) {
//             var individualPosition = getNodePosition( parent );
//             individualPosition.y = individualPosition.y + 127;
//             individualPosition.x = individualPosition.x + ( quartW * numElements ) ;
//             group.moveTo( individualPosition );
//             group.updatePosition();
//             var numNodes = group.nodeGroup.length;
//             numElements += ( 2 * numNodes );
//           }
//         })
//       }
//     })
//   }
// }

Group.prototype.belongsTo = function () {
  var nodeParent = this.attachedPaths[0].input.parentNode;
  if ( nodeParent.group ) {
    if ( nodeParent.group.nodeGroup.length > 1 ){
      return nodeParent.group;
    }
  } else {
    return false;
  }
}

Group.prototype.changeRelation = function() {
  var parentGroups = this.attachedPaths[0].input.parentNode.childNodes;
  var outPath = this.output;
  var inPath = this.attachedPaths[0].input.parentNode.supportInput;
  var removeFrom = this.type ? parentGroups.supporting : parentGroups.opposing;
  var addTo = this.type ? parentGroups.opposing : parentGroups.supporting;
  _.pull( removeFrom, this );
  this.domElement.classList.remove( this.type ? 'supp' : 'opp' );
  this.domElement.classList.add( this.type ? 'opp' : 'supp' );
  this.type = this.type ? false : true;
  addTo.push( this );
  color = this.type ? '#409966' : '#ff0000';
  outPath.path.setAttributeNS(null, 'stroke', color);
  var outColor = outPath.path.getAttributeNS(null, 'stroke');
  if ( inPath.node.domElement == outPath.parentNode.domElement ) {
    inPath.path.setAttributeNS(null, 'stroke', outColor);
  }
}

Group.prototype.height = function() {
  return this.domElement.clientHeight;
}
