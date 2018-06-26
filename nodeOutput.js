function NodeOutput(parentNode){
  this.node=null;
  this.parentNode=parentNode
  this.domElement = document.createElement('span');
  this.domElement.classList.add('output');
  this.domElement.innerHTML = '&nbsp;';
  this.path=null;
  // Output Click handler
  var that = this;
  this.domElement.onclick = function(e){
    if(mouse.currentInput && !that.parentNode.ownsInput(mouse.currentInput)){
      var tmp = mouse.currentInput;
      mouse.currentInput = null;
      that.parentNode.connectTo(tmp);
      that.node=tmp.parentNode;
    }
    e.stopPropagation();
  };
}

