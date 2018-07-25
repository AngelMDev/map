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
  // SVG Connectors

    //DEBUGGING PURPOSES
  var that=this
  this.domElement.onclick = function (e){
     // if(that.root) console.log("root node");
    console.log(that);
    console.log("Id:",that.id);
    console.log(that.domElement.clientHeight);
    //console.log("Node:",that.inputs[0].domElement.style.top = that.domElement.clientHeight-8);
    console.log("Group:",that.group);
    console.log("Parent:",that.group ? that.group.parentNode : null);
    console.log("Children:",that.childNodes);
    console.log("===");
    // that.addCues();
    argmap.selectNode( that );
  }

  $('body').on('dblclick','.node .wrap', function(){
    $(this).focus();
    document.execCommand( 'selectAll', true);
    $(this).on("keydown", function( event ) {
      if (event.keyCode === 13) {
        event.preventDefault();
        $(this).blur();
      }
    })
  });
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

Node.prototype.addContent=function( content = 'Click here to edit', editable = true ){
  div=document.createElement('div');
  div.innerHTML=content;
  div.classList.add('wrap');
  div.setAttribute( 'contenteditable', editable );
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
      //this.inputs[j].path.setAttributeNS(null, 'd', pStr);
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
  if(this.collapsedNode){
    this.collapsedNode.moveTo(getNodePosition(this));
    this.collapsedNode.updatePosition();
  }
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
      //this.inputs[j].path.setAttributeNS(null, 'd', pStr);
    }
  }
};

Node.prototype.createPath = function(a, b){
  return null;
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

Node.prototype.connectTo = function(input, type){
  input.node = this;
  this.group = createGroup(null, this.currentPosition(), input.node, type)
  this.group.connectTo(input)
  $(this.output.domElement).addClass('hidden');
};

Node.prototype.moveTo = function( point ){
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
    containment: 'parent',
    cancel: '.connection,.output',
    opacity: 0.7,
    zIndex: 100,
    cursor: 'move',
    refreshPositions: true,
    drag: function(event, ui){
      //Fix draggable positioning when zoomed in/out
      var factor = (1 / zoomValue) - 1;
      ui.position.top += Math.round((ui.position.top - ui.originalPosition.top) * factor);
      ui.position.left += Math.round((ui.position.left - ui.originalPosition.left) * factor);
      that.updatePosition();
      if (that.group) {
        var group=that.group;
        const groupPos = getNodePosition(group);
        var nodePos = that.currentPosition();
        if ( Math.abs(groupPos.y - nodePos.y) > 11 || Math.abs(groupPos.x - nodePos.x) > 15 ) {
          that.removeNodeFromGroup();
        }
      }
    },
    stop: function(e, ui){
      if(that.collapsedNode){
        that.propagateMoveTo({
          x: getNodePosition(that).x-ui.originalPosition.left,
          y: getNodePosition(that).y-ui.originalPosition.top
        });
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
    if(childNode.root) debugger;
    var parentInput = that.inputs[0];

    childNode.connectTo(parentInput, true);
    childNode.group.createAt( that );

    that.childrenPosition( );
    that.applyToChildren( );

    that.countNode();
    if ( that.group ) {
      that.group.numOfNodes();
    }
    argmap.selectNode( childNode );
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

    that.childrenPosition( );
    that.applyToChildren( );

    that.countNode();
    if ( that.group ) {
      that.group.numOfNodes() ;
    }
    argmap.selectNode( childNode );
  }
});

  // Fix positioning
  this.domElement.style.position = 'absolute';
  $('#amp').append(this.domElement);
  // Update Visual
  this.updatePosition();
};

Node.prototype.removeNodeFromGroup = function(){
  var group=this.group;
  if (!group) return;
    group.removeNode(this);
    if(group.nodeGroup.length<1){
      group.attachedPaths[0].input.path.removeAttribute('d')
      group.detachInput(group.attachedPaths[0].input);
      group.attachedPaths=[];
    }
    group.updateShape();
    group.parentNode.childrenPosition();
    group.parentNode.applyToChildren();

    group.parentNode.countNode();
    if ( group.parentNode.group ) {
      group.numOfNodes();
    }

    group.parentNode.updatePosition();
    group.updatePosition();
  
}

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
  // this.arrangeGroups();
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
    leftWidthSum=0
    for(var i=0;i<nonEmptyGroupCount;i++){
      if(i!=0){
        group=nonEmptyGroup[i];
        groupPosition=getNodePosition(group);
        if(direction>0){
          groupPosition.x = currentPosition.x + (rightWidthSum+spacing) * direction;
          rightWidthSum += group.domElement.offsetWidth+spacing;
        }else{
          groupPosition.x = currentPosition.x + (leftWidthSum+spacing+group.domElement.offsetWidth) * direction;
          leftWidthSum += group.domElement.offsetWidth+spacing;
        }
        group.moveTo(groupPosition);
        direction*=-1;
      }
    }
    //When this node has both opposing and supporting children views
  }else{
    stance="supporting";
    var widthSum=nodeWidth;
    for(var i=0;i<this.childNodes[stance].length;i++){
      group=this.childNodes[stance][i];
      groupPosition=getNodePosition(group);
      groupPosition.x = currentPosition.x + (widthSum+spacing);
      widthSum += group.domElement.offsetWidth+spacing;
      group.moveTo(groupPosition);
    }
    stance="opposing";
    var widthSum=0
    for(var i=0;i<this.childNodes[stance].length;i++){
      group=this.childNodes[stance][i];
      groupPosition=getNodePosition(group);
      groupPosition.x = currentPosition.x - (widthSum+spacing+group.domElement.offsetWidth);
      widthSum += group.domElement.offsetWidth+spacing;
      group.moveTo(groupPosition);
    }
  }
  this.updatePosition();
}

Node.prototype.childrenPosition = function( halfW = 85) {
  // var halfW = 85; //control the space between nodes;
  var spacing = halfW;
  var parent = this;
  var numElements = 1; //to count the number of nodes in all the groups
// counting the number of nodes in all the groups
  var keys = Object.keys( this.childNodes )
  var children = this.childNodes;
  for ( var group in children ) {
    children[ group ].map( function( group ) {
      group.spacing = spacing;
      if ( group ) {
        group.nodeGroup.map( function( node ) {
          numElements -= 1
        })
      }
    })
  }
// center the child with the parent
  if ( numElements == 0 ) {
    for ( var group in children ) {
      children[ group ].map( function( group ) {
        if ( group ) {
          var individualPosition = getNodePosition( parent );
          var parentHeight = parent.calcHeight();
          individualPosition.y = individualPosition.y + 70 + parentHeight + window.scrollY;;
          group.moveTo( individualPosition );

          group.updatePosition();
          group.updatePositionWithoutChildren();
        }
      })
    }
  }
// moving each group acording to the groups
  if ( numElements < 0 ){
    for ( var group in children ) {
      children[ group ].map( function( group ) {
        if ( group ) {
          var individualPosition = getNodePosition( parent );
          var parentHeight = parent.calcHeight();
          individualPosition.y = individualPosition.y + 70 + parentHeight + window.scrollY;;
          individualPosition.x = individualPosition.x + ( halfW * numElements ) ;
          group.moveTo( individualPosition );

          group.updatePosition();
          group.updatePositionWithoutChildren();

          var numNodes = group.nodeGroup.length;
          numElements += ( 2 * numNodes );
        }
      })
    }
  }

}

Node.prototype.applyToChildren = function() {
  var children = this.childNodes;
  for ( var group in children ) {
    children[ group ].map( function( group ) {
      if ( group ) {
        group.nodeGroup.map( function( node ) {
            node.childrenPosition();
        })
      }
      group.updatePosition();
    })
  }
}

Node.prototype.calcHeight = function() {
  return this.domElement.offsetHeight;
}

//Collapsible functionality logic
Node.prototype.collapseChildren = function(){
  childCount=0;
  this.childNodes["supporting"].forEach((group)=>{
    group.hide();
    childCount++;
  })
  this.childNodes["opposing"].forEach((group)=>{
    group.hide();
    childCount++;
  })
  this.updatePosition();
  if(!this.collapsedNode && childCount > 0){
    this.collapsedNode=new CollapsedNode(this);
  }
}

Node.prototype.expandChildren = function(){
  this.childNodes["supporting"].forEach((group)=>{
    group.show();
  })
  this.childNodes["opposing"].forEach((group)=>{
    group.show();
  })
  setTimeout(()=>this.updatePosition(),260);
  if (!this.collapsedNode) return;
  this.collapsedNode.domElement.remove();
  this.collapsedNode.path.removeAttribute('d');
  this.collapsedNode=null;
}

Node.prototype.hide = function(){
  if(this.collapsedNode) {
    this.collapsedNode.hide();
  }
  $(this.domElement).addClass('hide');
  this.childNodes["supporting"].forEach((group)=>{
    group.hide();
  })
  this.childNodes["opposing"].forEach((group)=>{
    group.hide();
  })
}

Node.prototype.show = function(){
  $(this.domElement).removeClass('hide');
  if(this.collapsedNode) {
    this.collapsedNode.show();
    return;
  }
  this.childNodes["supporting"].forEach((group)=>{
    group.show();
  })
  this.childNodes["opposing"].forEach((group)=>{
    group.show();
  })
}

//Move children with parent
Node.prototype.propagateMoveTo = function(point){
  for(stance in this.childNodes){
    this.childNodes[stance].forEach((group)=>{
      group.propagateMoveTo(point);
    })
  }
}

Node.prototype.moveCollapsedWithParentGroup = function(point){
  if (!this.collapsedNode) return;
  this.propagateMoveTo(point);
}

Node.prototype.addCues = function( type ) {
  var classes = {
    group: 'group-prob',
    child: 'child-prob'
  }
  var text = {
    group: "S",
    child: 'C'
  }
  // var ran = Math.floor((Math.random() * 2) + 1 );
  cue = document.createElement('div');
  cue.classList.add(classes[type])
  cue.innerHTML = text[type];
  this.domElement.append(cue)
}

Node.prototype.countNode = function() {
  // counting the number of nodes in all the groups
  var numOfNodes = 0;
  var keys = Object.keys( this.childNodes )
  var children = this.childNodes;
  var childrenLvl = this.group != null ? this.group.level + 1 : 1;
  var that = this;
  var maxLvl = getMaxLevel();
  for ( var group in children ) {
    children[ group ].map( function( group ) {
      if ( group ) {
        group.nodeGroup.map( function( node ) {
          numOfNodes += 1;
        })
      }
    })
  }
  if ( numOfNodes > 0 ) {
    for( var i = childrenLvl; i <= maxLvl; i++){
      alignNodesInlevel( i );
    }
  }
}

Node.prototype.hasSiblings = function( parent ) {
  if ( this.group.type == true && ( parent.childNodes.supporting.length > 1 || parent.childNodes.opposing.length > 0 ) ) {
    return true;
  } else if ( this.group.type == false && ( parent.childNodes.opposing.length > 1 || parent.childNodes.supporting.length > 0 ) ) {
    return true;
  } else {
  return false; }
}

Node.prototype.hasChildren = function(){
  returnValue=false;
  for(var stance in this.childNodes){
    this.childNodes[stance].forEach((group)=>{      
      returnValue=true; //because js is retarded
      return;
    });
  }
  return returnValue;
}
