function NodeInput(name,parentNode){
  this.name = name;
  this.node = null;
  this.parentNode = parentNode;

  
  // The dom element, here is where we could add
  // different input types
  this.domElement = document.createElement('div');
  this.domElement.innerHTML = name;
  this.domElement.classList.add('connection');
  this.domElement.classList.add('empty');
    
  // SVG Connector
  this.path = document.createElementNS(svg.ns, 'path');
  this.path.setAttributeNS(null, 'stroke', '#00ff00');
  this.path.setAttributeNS(null, 'stroke-width', '2');
  this.path.setAttributeNS(null, 'fill', 'none');
  svg.appendChild(this.path);
  
  // DOM Event handlers
  var that = this;
  this.domElement.onclick = function(e){
    if(mouse.currentInput){
      if(mouse.currentInput.path.hasAttribute('d'))
        mouse.currentInput.path.removeAttribute('d');
      if(mouse.currentInput.node){
        mouse.currentInput.node.detachInput(mouse.currentInput);
        mouse.currentInput.node = null;
      }
    }
    mouse.currentInput = that;
    if(that.node){
      that.node.detachInput(that);
      that.domElement.classList.remove('filled');
      that.domElement.classList.add('empty');
    }
    e.stopPropagation();
  };
}

NodeInput.prototype.getAttachPoint = function(){
  var offset = GetFullOffset(this.domElement);
  return {
    x: offset.left + this.domElement.offsetWidth - 2,
    y: offset.top + this.domElement.parentElement.offsetHeight - 20
  };
};