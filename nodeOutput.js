function NodeOutput(parentNode){
  this.node=null;
  this.parentNode=parentNode;
  this.domElement = document.createElement('span');
  this.domElement.classList.add('output');
  this.domElement.innerHTML = '&nbsp;';
  this.path=null;
  // Output Click handler
  var that = this;
  this.domElement.onclick = function(e){
    //If user is holding a cable make a connection, otherwise remove existing connection
    if(mouse.currentInput && !that.parentNode.ownsInput(mouse.currentInput)){
      if(that.parentNode.attachedPaths && that.parentNode.attachedPaths[0]){
        //If user tries to make a connection but a connection already exists, ignore user action
        return;
      }
      //Make connection to this output
      var tmp = mouse.currentInput;
      mouse.currentInput = null;
      that.parentNode.connectTo(tmp);
      that.node=tmp.parentNode;
    }else if(!mouse.currentInput){
      if(that.parentNode){
        //Remove connection
        that.parentNode.attachedPaths[0].input.path.removeAttribute('d')
        that.parentNode.detachInput(that.parentNode.attachedPaths[0].input);
        that.parentNode.attachedPaths=[];
        that.parentNode.domElement.remove();
        that.parentNode = null;
        that.path.removeAttribute('d');
        that.path=null
      }
    }
    e.stopPropagation();
  };
}
