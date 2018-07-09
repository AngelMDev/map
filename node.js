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
  this.opposeInput = this.addInput(false);
  // SVG Connectors
  //this.attachedPaths = [];

    //DEBUGGING PURPOSES
  var that=this
  this.domElement.onclick = function (e){
    // console.log("Id:",that.id);
    // console.log("Group:",that.group);
    // console.log("Parent:",that.group ? that.group.parentNode : null);
    // console.log("Children:",that.childNodes);
    console.log( that);
    console.log("===");
  }
}
Node.prototype.whosYourDaddy = function(){
  if (this.attachedPaths != 0){
    return this.attachedPaths[0].input.parentNode;
  } else {
    return false;
  }
}

Node.prototype.root = function(){
  if (!this.whosYourDaddy()) {
    var rootEle = this.inputs[0].parentNode;
    defineRoot(rootEle);
  } else {
    var parent = this.whosYourDaddy();
    parent.root();
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

Node.prototype.addContent=function(content){
  div=document.createElement('div');
  div.innerHTML=content;
  div.classList.add('wrap');
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
  if(this.group)
    this.group.parentNode.updatePositionWithoutChildren();
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

Node.prototype.connectTo = function(input){
  input.node = this;
  this.group = createGroup(null, this.currentPosition(), input.node, input.supports)
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

    childNode.connectTo(parentInput);
    childNode.group.createAt( that );

    that.childrenPosition( );
    that.applyToChildren( );

    if ( that.group ) {
      that.group.allTheChildren();
    }
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
    var parentInput = that.inputs[1];

    childNode.connectTo(parentInput);
    childNode.group.createAt( that );

    that.childrenPosition( );
    that.applyToChildren( );

    if ( that.group ) {
      that.group.allTheChildren();
    }
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

Node.prototype.childrenPosition = function() {
  var halfW = 90; //control the space between nodes;
  var parent = this;
  var numElements = 1; //to count the number of nodes in all the groups
// counting the number of nodes in all the groups
  var keys = Object.keys( this.childNodes )
  var childrens = this.childNodes;
  for ( var group in childrens ) {
    childrens[ group ].map( function( group ) {
      if ( group ) {
        group.nodeGroup.map( function( node ) {
          numElements -= 1
        })
      }
    })
  }
// center the child with the parent
  if ( numElements == 0 ) {
    for ( var group in childrens ) {
      childrens[ group ].map( function( group ) {
        if ( group ) {
          var individualPosition = getNodePosition( parent );
          individualPosition.y = individualPosition.y + 120;
          group.moveTo( individualPosition );

          group.updatePosition();
          group.updatePositionWithoutChildren();
        }
      })
    }
  }
// moving each node acording to the groups
  if ( numElements < 0 ){
    for ( var group in childrens ) {
      childrens[ group ].map( function( group ) {
        if ( group ) {
          var individualPosition = getNodePosition( parent );
          individualPosition.y = individualPosition.y + 120;
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
  var childrens = this.childNodes;
  for ( var group in childrens ) {
    childrens[ group ].map( function( group ) {
      if ( group ) {
        group.nodeGroup.map( function( node ) {
          node.childrenPosition();
        })
      }
      group.updatePosition();
      group.updatePositionWithoutChildren();
    })
  }
}
