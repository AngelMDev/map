function Node(name,id,root=false){
  // DOM Element creation
  this.name=name;
  this.root=root
  this.domElement = document.createElement('div');
  this.domElement.classList.add('node');
  this.domElement.classList.add('post');
  this.domElement.classList.add('draggable');
  this.domElement.classList.add('ui-widget-content');
  this.domElement.node = this;
  this.domElement.id=id;
  this.id=id
  //Create Droppable areas
  this.suppArea = this.createDroppableArea(true);
  this.oppArea = this.createDroppableArea(false);
  // Create output visual
  if(!root){
    this.output = new NodeOutput(this);
    this.domElement.appendChild(this.output.domElement);
  }
  // Relationships
  this.childNodes={supporting:[], opposing:[]}
  this.group=null;
  // Node Stuffs
  this.value = '';
  this.inputs = [];
  this.connected = false;
  // Create inputs
  this.supportInput = this.addInput(true);
  // this.opposeInput = this.addInput(false);
  // SVG Connectors
  //this.attachedPaths = [];

    //DEBUGGING PURPOSES
  var that=this
  this.domElement.onclick = function (e){
    // console.log("Id:",that.id);
    // console.log("Node:",that);
    // console.log("Group:",that.group);
    // console.log("Parent:",that.group ? that.group.parentNode : null);
    // console.log("Children:",that.childNodes);
    // console.log("===");
    builder.selectNode( that );
  }

  this.domElement.ondblclick = function (e){
    // var input = document.createElement( 'textarea' );
    // input.classList.add( 'customInput' );
    // that.domElement.appendChild( input );
    // input.focus();
    // that.domElement.children[ 4 ].inputMode;
  }
}


Node.prototype.whosYourDaddy = function(){
  if ( this.group != null){
    return this.group.parentNode
  } else {
    return false;
  }
}

Node.prototype.lookForRoot = function(){
  if (!this.whosYourDaddy()) {
    var rootEle = this;
    defineRoot(rootEle);
  } else {
    var parent = this.whosYourDaddy();
    parent.lookForRoot();
  }
}

Node.prototype.createDroppableArea = function(supports){
  area=document.createElement('div');
  area.classList.add(supports ? 'area_support' : 'area_oppose');
  this.domElement.appendChild(area);
  return area;
}

Node.prototype.addInput = function(supports){
  var input = new NodeInput(supports,this);
  this.inputs.push(input);
  this.domElement.appendChild(input.domElement);
  return input;
};

Node.prototype.addContent=function(content = 'Click here to edit'){
  div=document.createElement('div');
  div.innerHTML=content;
  div.classList.add('wrap');
  div.setAttribute( 'contenteditable', true );
  this.domElement.appendChild(div);
}

Node.prototype.removeFromGroup = function(){
  $(this.output.domElement).removeClass('hidden');
  this.group=null;
};

Node.prototype.addToGroup = function (group){
  $(this.output.domElement).addClass('hidden');
  this.group=group;
}

Node.prototype.ownsInput = function(input){
  for(var i = 0; i < this.inputs.length; i++){
    if(this.inputs[i] == input)
      return true;
  }
  return false;
};

Node.prototype.updatePosition = function(){
  for(var j = 0; j < this.inputs.length; j++){
    if(this.inputs[j].node != null){
      var iP = this.inputs[j].getAttachPoint();
      var oP = this.inputs[j].node.getOutputPoint();
      var pStr = this.createPath(iP, oP);
      this.inputs[j].path.setAttributeNS(null, 'd', pStr);
    }
  }
  for(var k=0;k<this.childNodes.supporting.length;k++){
    this.childNodes.supporting[k].updatePosition();
  }
  for(var k=0;k<this.childNodes.opposing.length;k++){
    this.childNodes.opposing[k].updatePosition();
  }
  if(this.group) {
    this.group.parentNode.updatePositionWithoutChildren();
  }
    //this.dontOverlap();
};

Node.prototype.dontOverlap = function(){
  _x=this.domElement.getBoundingClientRect().x;
  _y=this.domElement.getBoundingClientRect().y;
  _height=this.domElement.offsetHeight;
  _width=this.domElement.offsetWidth;
  a={x:_x,y:_y,height:_height,width:_width};
  that=this;
  nodeReference.forEach(function(node){
    _x=node.domElement.getBoundingClientRect().x;
    _y=node.domElement.getBoundingClientRect().y;
    _height=node.domElement.offsetHeight;
    _width=node.domElement.offsetWidth;
    b={x:_x,y:_y,height:_height,width:_width};
    if(that!=node){
      if(that.isColliding(a,b)){
        console.log("Collision between",that.id,"and",node.id);
        console.log(a,b);
      }
    }
  });
};

Node.prototype.isColliding = function (a, b) {
  return !(
    ((a.y + a.height) < (b.y)) ||
    (a.y > (b.y + b.height)) ||
    ((a.x + a.width) < b.x) ||
    (a.x > (b.x + b.width))
  );
};

Node.prototype.updatePositionWithoutChildren = function(){
  for(var j = 0; j < this.inputs.length; j++){
    if(this.inputs[j].node != null){
      var iP = this.inputs[j].getAttachPoint();
      var oP = this.inputs[j].node.getOutputPoint();
      var pStr = this.createPath(iP, oP);
      this.inputs[j].path.setAttributeNS(null, 'd', pStr);
    }
  }
};

Node.prototype.createPath = function(a, b){
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
};

Node.prototype.connectTo = function(input, type){
  input.node = this;
  this.group = createGroup(null, this.currentPosition(), input.node, type)
  this.group.connectTo(input)
  $(this.output.domElement).addClass('hidden');
};

Node.prototype.moveTo = function(point){
  if ( typeof point.y == 'number' ) {
    this.domElement.style.top = point.y + 'px';
    this.domElement.style.left = point.x + 'px';
  }
  if ( typeof point.y == 'string' ) {
    this.domElement.style.top = point.y;
    this.domElement.style.left = point.x;
  }
  this.updatePosition();
};

Node.prototype.initUI = function(){
  var that = this;
  // Make draggable
  $(this.domElement).draggable({
    containment: 'window',
    cancel: '.connection,.output',
    opacity: 0.7,
    zIndex: 100,
    cursor: 'move',
    drag: function(event, ui){
      that.updatePosition();
      if (that.group) {
        const groupPos = getNodePosition(that.group);
        const group = that.group
        var nodePos = that.currentPosition();
        if ( Math.abs(groupPos.y - nodePos.y) > 11 || Math.abs(groupPos.x - nodePos.x) > 15 ) {
          group.removeNode(that);
          if(group.nodeGroup.length<1){
            group.attachedPaths[0].input.path.removeAttribute('d')
            group.detachInput(group.attachedPaths[0].input);
            group.attachedPaths=[];
          }
          group.updateShape();
          group.parentNode.childrenPosition();
          group.parentNode.applyToChildren();
          group.parentNode.updatePosition();
          group.updatePosition();
        };
      }
    }
  })

    $(this.suppArea).droppable({
  accept: ".node",
  tolerance: "pointer",
  hoverClass: 'parent-child-supp',
  activate: function (event, ui) {
  },
  drop: function( event, ui ) {
    var childNode = ui.draggable[0].node;
    var parentInput = that.inputs[0];

    childNode.connectTo(parentInput, true);
    childNode.group.createAt( that );

    that.initialArrangement(childNode.group);
  }
});

$(this.oppArea).droppable({
  accept: ".node",
  tolerance: "pointer",
  hoverClass: 'parent-child-opp',
  activate: function (event, ui) {
  },
  drop: function( event, ui ) {
    var childNode = ui.draggable[0].node;
    var parentInput = that.inputs[0];

    childNode.connectTo(parentInput, false);
    childNode.group.createAt( that );

    that.initialArrangement(childNode.group);
  }
});

  // Fix positioning
  this.domElement.style.position = 'absolute';

  document.body.append(this.domElement);
  // Update Visual
  this.updatePosition();
};

Node.prototype.currentPosition = function() {
  var pos = {
    x : Number(this.domElement.style.left.slice(0,-2)),
    y : Number(this.domElement.style.top.slice(0,-2))
  }
  return pos;
}

Node.prototype.initialArrangement = function(group){
  currentPosition=getNodePosition(this);
  currentPosition.y=currentPosition.y+this.domElement.offsetHeight + 40;
  group.moveTo(currentPosition);
  this.arrangeGroups();
}

Node.prototype.arrangeGroups = function () {
  supportGroupCount=this.childNodes.supporting.length;
  opposeGroupCount=this.childNodes.opposing.length;
  totalCount=supportGroupCount+opposeGroupCount;
  //When there's no child/only 1 child node
  if (totalCount == 0 || totalCount == 1) return;
  spacing=15;
  nodeWidth=166;
  currentPosition=getNodePosition(this);
  direction=1;
  //When this node only has either opposing OR supporting views
  if(supportGroupCount==0||opposeGroupCount==0){
    if(supportGroupCount!=0){
      nonEmptyGroup=this.childNodes.supporting;
      nonEmptyGroupCount=supportGroupCount;
    }else{
      nonEmptyGroup=this.childNodes.opposing;
      nonEmptyGroupCount=opposeGroupCount;
    }
    rightWidthSum=nonEmptyGroup[0].domElement.offsetWidth+spacing;
    leftWidthSum=nonEmptyGroup[0].domElement.offsetWidth+spacing;
    for(var i=0;i<nonEmptyGroupCount;i++){
      if(i!=0){
        group=nonEmptyGroup[i];
        groupPosition=getNodePosition(group);
        if(direction>0){
          groupPosition.x = currentPosition.x + (rightWidthSum+spacing) * direction;
          rightWidthSum += group.domElement.offsetWidth+spacing;
        }else{
          groupPosition.x = currentPosition.x + (leftWidthSum+spacing) * direction;
          leftWidthSum += group.domElement.offsetWidth+spacing;
        }
        group.moveTo(groupPosition);
        direction*=-1;
      }
    }
    //When this node has both opposing and supporting children views
  }else{
    for (var stance in this.childNodes) {
      widthSum=nodeWidth;
      for(var i=0;i<this.childNodes[stance].length;i++){
        group=this.childNodes[stance][i];
        groupPosition=getNodePosition(group);
        groupPosition.x = currentPosition.x + (widthSum+spacing+group.domElement.offsetWidth/2) * direction;
        widthSum += group.domElement.offsetWidth+spacing;
        group.moveTo(groupPosition);
        
      }
      direction*=-1;
    }
  }
  this.updatePosition();
}

// Node.prototype.childrenPosition = function() {
//   var halfW = 180; //control the space between nodes;
//   var parent = this;
//   var numElements = 0; //to count the number of nodes in all the groups
// // counting the number of nodes in all the groups
//   var children = this.childNodes;
//   for (var stance in children) {
//     children[stance].forEach(function(group) {
//       numElements +=group.nodeGroup.length;
//     });
//   }
// // center the child with the parent

//   for (var stance in children) {
//     var placement = (stance == "supporting") ? 1 : -1
//     var count=0;
//     children[stance].forEach(function(group) {
//       var individualPosition = getNodePosition(parent);
//       individualPosition.y = individualPosition.y + parent.domElement.offsetHeight + 40;
//       if(numElements!=1){
//         if (count==0){
//           count=1;
//         }
//         console.log(individualPosition)
//         individualPosition.x = individualPosition.x + (count * halfW * placement * group.nodeGroup.length);
//       }
//       group.moveTo(individualPosition);
//       group.updatePosition();
//       count++;
//     });
//   }
// }

Node.prototype.applyToChildren = function() {
  var childrens = this.childNodes;
  for ( var group in childrens ) {
    childrens[ group ].map( function( group ) {
      if ( group ) {
        group.nodeGroup.map( function( node ) {
          node.arrangeGroups();
        })
      }
      group.updatePosition();
    })
  }
}
