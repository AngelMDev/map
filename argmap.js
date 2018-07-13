class ARGmap {
  constructor() {
   this.selectedNode = null;
 }

  collapse() {
    if (!this.selectedNode) return;
    this.selectedNode.collapseChildren();
  }

  expand() {
    if (!this.selectedNode) return;
    this.selectedNode.expandChildren();
  }

 createNode( id = uniqueId(), coords={x: 0, y: 0} ){
   var mynode = new Node( null, id );
   mynode.moveTo( coords );
   mynode.initUI();
   mynode.addContent();
   nodeReference.push( mynode )
   return mynode;
 }

 createRoot(){
   var id = uniqueId();
   var coords = {
     x: ($(window).width()/2) - 85,
     y: ($(window).height()/10)
   }
   var node = this.createNode( id, coords );
   this.selectNode( node );
 }

 selectNode( node ){
   if ( this.selectedNode != null ) {
     this.selectedNode.domElement.classList.remove('selected');
   }

   this.selectedNode = node;
   node.domElement.classList.add('selected')
 }

 suppClaim( node ){
   if ( this.selectedNode != null ){
     var childNode = this.createNode()
     var parentInput = this.selectedNode.inputs[0];

     childNode.connectTo(parentInput, true);
     childNode.group.createAt( this.selectedNode );

     this.selectedNode.arrangeGroups( );
     this.selectedNode.applyToChildren( );

     // if ( this.selectedNode.group ) {
     //   this.selectedNode.group.allTheChildren();
     // }
     this.selectNode( childNode );
   }
 }

 oppClaim( node ){
   if ( this.selectedNode != null ) {
     var childNode = this.createNode()
     var parentInput = this.selectedNode.inputs[0];

     childNode.connectTo(parentInput, false );
     childNode.group.createAt( this.selectedNode );

     this.selectedNode.arrangeGroups( );
     this.selectedNode.applyToChildren( );

     // if ( this.selectedNode.group ) {
     //   this.selectedNode.group.allTheChildren();
     // }

     this.selectNode( childNode );
   }
 }

 addSibling() {
   var group = this.selectedNode.group;
   var sibling = this.createNode()
   if (this.selectedNode != null && this.selectedNode.group != null){
     group.addNode(sibling);
     group.updateShape();
     group.alignNode(sibling);
     var currentPosition = getNodePosition(group);
     currentPosition.x = currentPosition.x - 85;
     group.moveTo(currentPosition);
     group.parentNode.arrangeGroups();
     group.parentNode.applyToChildren();
    //  if (group.belongsTo()) {
    //    group.belongsTo().allTheChildren();
    //  }
   }


   if ( this.selectedNode && this.selectedNode.group == null ) {
     console.log('this');
     var currentPosition = getNodePosition( this.selectedNode );
     currentPosition.x = currentPosition.x + 170;
     sibling.moveTo( currentPosition );
   }

  this.selectNode( sibling );
 }

}

var argmap = new ARGmap();
argmap.createRoot();
