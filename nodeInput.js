function NodeInput(supports,parentNode){
  this.supports = supports;
  this.node = null;
  this.parentNode = parentNode;
  // The dom element, here is where we could add
  // different input types
  this.domElement = document.createElement('div');
  this.domElement.innerHTML = name;
  this.domElement.classList.add('connection');
  this.domElement.classList.add('empty');

  this.createPath();

  // DOM Event handlers
  var that = this;
  this.domElement.onclick = function(e){
    if(mouse.currentInput){
      if(mouse.currentInput.path.hasAttribute('d')){
        mouse.currentInput.path.removeAttribute('d');
      }
      if(mouse.currentInput.node){
        mouse.currentInput.node.detachInput(mouse.currentInput);
        mouse.currentInput.node = null;
      }
    }
    mouse.currentInput = that;
    if(that.node){
      // that.node.detachInput(that);
      // that.domElement.classList.remove('filled');
      // that.domElement.classList.add('empty');
    }
    e.stopPropagation();
  };
}

NodeInput.prototype.createPath = function(type){
  // SVG Connector
  this.path = document.createElementNS(svg.ns, 'path');
  color = type ? '#409966' : '#ff0000';
  this.path.setAttributeNS(null, 'stroke', color);
  this.path.setAttributeNS(null, 'stroke-width', '2');
  this.path.setAttributeNS(null, 'fill', 'none');
  this.path.setAttributeNS(null, 'id', uniqueId);
  svg.appendChild(this.path);
}

NodeInput.prototype.getAttachPoint = function(){
  var offset = GetFullOffset(this.domElement);
  parentId=this.domElement.parentElement.id;
  rect=this.domElement.getBoundingClientRect();
  return {
    x: rect.x + window.scrollX + $(this.domElement.parentElement).width()+2,
    y: rect.y + window.scrollY
  };
};
