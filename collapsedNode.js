function CollapsedNode(parent){
    this.parent=parent;
    this.path=null;
    this.domElement = document.createElement('div');
    this.domElement.classList.add('node');
    this.domElement.classList.add('post');
    this.domElement.classList.add('collapsed'); 
    this.output = new NodeOutput(this);  
    this.domElement.appendChild(this.output.domElement);
    this.positionWhenCollapsed=getNodePosition(parent);
    this.moveTo(this.positionWhenCollapsed);
    this.connectTo(parent.inputs[0]);
    this.initUI();
}

CollapsedNode.prototype.moveTo = function(point){
    point.y=point.y+50;
    point.x+=(this.parent.domElement.offsetWidth/2)-(15);
    if ( typeof point.y == 'number' ) {
      this.domElement.style.top = point.y + 'px';
      this.domElement.style.left = point.x + 'px';
    }
    if ( typeof point.y == 'string' ) {
      this.domElement.style.top = point.y;
      this.domElement.style.left = point.x;
    }
};

CollapsedNode.prototype.connectTo = function(input){
    var iPoint = input.getAttachPoint();
    var oPoint = this.getOutputPoint();
    var pathStr = this.createPath(iPoint, oPoint);
    this.path=this.createNeutralPath();
    this.path.setAttributeNS(null, 'd',pathStr);
    this.cable=({
        input: input,
        path: this.path
      });
}

CollapsedNode.prototype.updatePosition = function(){
    var outPoint = this.getOutputPoint();
    var iPoint = this.cable.input.getAttachPoint();
    var pathStr = this.createPath(iPoint, outPoint);
    this.cable.path.setAttributeNS(null, 'd', pathStr);
};

CollapsedNode.prototype.createPath = function(a, b){
      return path = SvgPathGenerator()
                        .moveTo(a.x,a.y)
                        .lineTo(b.x,b.y)
                        .end();

};

CollapsedNode.prototype.createNeutralPath = function(){
    // SVG Connector
    path = document.createElementNS(svg.ns, 'path');
    path.setAttributeNS(null, 'stroke', "#707070");
    path.setAttributeNS(null, 'stroke-width', '2');
    path.setAttributeNS(null, 'fill', 'none');
    path.setAttributeNS(null, 'id', uniqueId);
    svg.appendChild(path);
    return path;
}

CollapsedNode.prototype.getOutputPoint = function(){
    var tmp = this.domElement.firstElementChild;
    var offset = GetFullOffset(tmp);
    return {
        x: offset.left + (tmp.offsetWidth / 2) - 5,
        y: offset.top + tmp.offsetHeight / 2
    };
};

CollapsedNode.prototype.initUI = function(){ 
    // Fix positioning
    this.domElement.style.position = 'absolute';
  
    document.body.append(this.domElement);
    // Update Visual
    this.updatePosition();
};

CollapsedNode.prototype.hide = function() {
    $(this.domElement).addClass('hide');
    this.cable.path.setAttributeNS(null, 'stroke-width', '0');
}

CollapsedNode.prototype.show = function() {
    $(this.domElement).removeClass('hide');
    setTimeout(()=>this.cable.path.setAttributeNS(null, 'stroke-width', '2'),255);
}