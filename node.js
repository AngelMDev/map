function Node(name,id){
  // DOM Element creation
  this.domElement = document.createElement('div');
  this.domElement.classList.add('node');
  this.domElement.classList.add('post');
  this.domElement.classList.add('draggable');
  this.domElement.classList.add('ui-widget-content');
  this.domElement.id=id;
  this.id=id
  // Create output visual
  this.output = new NodeOutput(this);
  this.domElement.appendChild(this.output.domElement);
  // Relationships
  this.parentNode=null;
  this.childNodes={supporting:[], opposing:[]}
  // Node Stuffs
  this.value = '';
  this.inputs = [];
  this.connected = false;
  // Create inputs
  this.supportInput = this.addInput(true);
  this.opposeInput = this.addInput(false);
  // SVG Connectors
  this.attachedPaths = [];

    //DEBUGGING PURPOSES
  var that=this
  this.domElement.onclick = function (e){
    // console.log("Id:",that.id);
    // console.log("Parent:",that.attachedPaths[0] ? that.attachedPaths[0].input.parentNode : null);
    // console.log("Children:",that.childNodes);
    // console.log("===");
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

Node.prototype.getOutputPoint = function(){
  var tmp = this.domElement.firstElementChild;
  var offset = GetFullOffset(tmp);
  return {
    x: offset.left + tmp.offsetWidth / 2,
    y: offset.top + tmp.offsetHeight / 2
  };
};

Node.prototype.addInput = function(supports){
  var input = new NodeInput(supports,this);
  this.inputs.push(input);
  this.domElement.appendChild(input.domElement);
  return input;
};

Node.prototype.addContent=function(content){
  div=document.createElement('div');
  div.innerHTML=content
  this.domElement.appendChild(div);
}

Node.prototype.detachInput = function(input){
  if(this.parentNode){
    childNodes=this.parentNode.childNodes;
    if(input.supports){
      _.pull(childNodes.supporting,this)
      if(childNodes.supporting.length===0){
        this.parentNode.inputs[0].domElement.classList.add('empty');
        this.parentNode.inputs[0].domElement.classList.remove('filled');
      }
    }else{
      _.pull(childNodes.opposing,this)
      if(childNodes.opposing.length===0){
        this.parentNode.inputs[1].domElement.classList.add('empty');
        this.parentNode.inputs[1].domElement.classList.remove('filled');
      }
    }
    this.domElement.classList.remove('connected');
    this.parentNode=null;
  }
};

Node.prototype.ownsInput = function(input){
  for(var i = 0; i < this.inputs.length; i++){
    if(this.inputs[i] == input)
      return true;
  }
  return false;
};

Node.prototype.updatePosition = function(){
  var outPoint = this.getOutputPoint();
  var aPaths = this.attachedPaths;
  for(var i = 0; i < aPaths.length; i++){
    var iPoint = aPaths[i].input.getAttachPoint();
    var pathStr = this.createPath(iPoint, outPoint);
    aPaths[i].path.setAttributeNS(null, 'd', pathStr);
  }

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
  if(this.parentNode)
    this.parentNode.updatePositionWithoutChildren();
};

Node.prototype.updatePositionWithoutChildren = function(){
  var outPoint = this.getOutputPoint();
  var aPaths = this.attachedPaths;
  for(var i = 0; i < aPaths.length; i++){
    var iPoint = aPaths[i].input.getAttachPoint();
    var pathStr = this.createPath(iPoint, outPoint);
    aPaths[i].path.setAttributeNS(null, 'd', pathStr);
  }

  for(var j = 0; j < this.inputs.length; j++){
    if(this.inputs[j].node != null){
      var iP = this.inputs[j].getAttachPoint();
      var oP = this.inputs[j].node.getOutputPoint();

      var pStr = this.createPath(iP, oP);
      this.inputs[j].path.setAttributeNS(null, 'd', pStr);
    }
  }
}

Node.prototype.createPath = function(a, b){
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
};

Node.prototype.connectTo = function(input){
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

Node.prototype.moveTo = function(point){
  this.domElement.style.top = point.y + 'px';
  this.domElement.style.left = point.x + 'px';
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
