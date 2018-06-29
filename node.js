function Node(name,id,root=false){
  // DOM Element creation
  this.name=name;
  this.root=root
  this.domElement = document.createElement('div');
  this.domElement.classList.add('node');
  this.domElement.classList.add('post');
  this.domElement.classList.add('draggable');
  this.domElement.classList.add('ui-widget-content');
  this.domElement.id=id;
  this.id=id
  this.domElement.node = this;
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
    console.log("Id:",that.id);
    //console.log("Parent:",that.attachedPaths[0] ? that.attachedPaths[0].input.parentNode : null);
    console.log("Children:",that.childNodes);
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
};

Node.prototype.createPath = function(a, b){
  aControlPointX=a.x-5;
  aControlPointY=a.y+120;
  bControlPointX=b.x+5;
  bControlPointY=b.y-120;
  return path = SvgPathGenerator()
                  .moveTo(a.x,a.y)
                  .curveTo(aControlPointX,aControlPointY,bControlPointX,bControlPointY,b.x,b.y)
                  .end();
};

Node.prototype.connectTo = function(input){
  input.node = this;
  this.group = createGroup(null, this.currentPosition(), input.node)
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
    drag: function(event, ui){
      that.updatePosition();
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
