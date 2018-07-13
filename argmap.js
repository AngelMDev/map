class ARGmap {
  constructor() {
   this.selectedNode = null;
   this.nodeReference = [];
   this.root = [];
   this.dataJson = {
     formatVersion : 0,
     id : 'root',
     ideas : {
       1 : {}
      }
    }
    this.nodeArray = [{id:"root",content:"blablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablabla"}]
  }


  // BUILDER FUNCTIONS
  createNode( id = uniqueId(), coords={ x : 0, y : 0 }){
   var mynode = new Node( null, id );
   mynode.initUI();
   mynode.moveTo( coords );
   mynode.addContent( );
   this.nodeReference.push( mynode )
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
     group.alignNode( sibling );
     var currentPosition = this.getNodePosition( group );
     currentPosition.x = currentPosition.x - 85;
     group.moveTo(currentPosition);
     group.parentNode.arrangeGroups();
     group.parentNode.applyToChildren();
     // if ( group.belongsTo() ) {
     //   group.belongsTo().allTheChildren();
     // }
   }
   if ( this.selectedNode && this.selectedNode.group == null ) {
     console.log('this');
     var currentPosition = this.getNodePosition( this.selectedNode );
     currentPosition.x = currentPosition.x + 170;
     sibling.moveTo( currentPosition );
   }
  this.selectNode( sibling );
  }

  collapse() {
    if (!this.selectedNode) return;
    this.selectedNode.collapseChildren();
  }

  expand() {
    if (!this.selectedNode) return;
    this.selectedNode.expandChildren();
  }
  // FUNCTION TO SAVE
  saveMap() {
    this.root = [];
    this.nodeReference.map( function( node ){
      node.lookForRoot();
    })
    this.rootJson( root[0] );
    return dataJson;
  }

  getText( node ){
    var textContent = "";
    textContent = node.domElement.children[4].innerHTML;
    return textContent;
  }

  getSupport( node ){
    var supp = [];
    node.childNodes.supporting.map( function( ele ){
      supp.push( ele.nodeGroup );
    })
    return supp;
  }

  getOppose( node ){
    var opp = [];
    node.childNodes.opposing.map( function( ele ){
      opp.push( ele.nodeGroup );
    })
    return opp;
  }

  getNodePosition( node ) {
    var nodePos = {
     y : node.domElement.offsetTop,
     x : node.domElement.offsetLeft
   }
   return nodePos;
  }

  rootJson( root ) {
    var json = this.dataJson['ideas'][1];
    if ( root ) {
      json.title = text( root );
      json.id = '1';
      json.ideas = {};
      json.position = this.getNodePosition(root);
    }
    var newJson = json['ideas'];

    var numGroups = 1;
    var supp = this.getSupport( root );
    var cons = this.getOppose( root );
    this.evalGroups( supp, newJson, numGroups, 'suporting' );
    this.evalGroups( supp, newJson, numGroups, 'opposing' );
  }

  evalGroups( arr, json, count, type ){
    var that = this;
    if ( arr.length > 0 ) {
      arr.map( function( groups ) {
        that.createJSONGroup( arr, json, count, type )
        count += 1;
      })
    }
  }

  createJSONGroup( arr, json, count, type ) {
      json[count] = {
        title : 'group',
        id : uniqueId(),
        attr : {
          group : type
        },
        ideas: {}
      }
      var newJson = json[count]['ideas']
      this.groupContent( arr, newJson )
  }

  groupContent( arr, json ) {
    var that = this
    arr[0].map(function( node, idx ) {
      json[idx+1] = {};
      json[idx+1].title = that.getText( node );
      json[idx+1].id = uniqueId();
      json[idx+1].position = that.getNodePosition( node );

      var subGroups = 1;
      var subsupp = that.getSupport( node );
      var subcons = that.getOppose( node );
      if ( subsupp.length > 0 || subcons.length > 0 ){
        json[idx+1].ideas = {};
        var newJson = json[idx+1].ideas
      }
      that.evalGroups( subsupp, newJson, subGroups, 'supporting');
      that.evalGroups( subcons, newJson, subGroups, 'opposing');
    })
  }
// PLAYER FUNCTIONS
  calcHeight( node ){
    var height = node.domElement.offsetHeight;
    return height;
  }

  displayNodes(){
    var startingX = 40;
    var startingY = 80;
    var xMargin = 190;
    var yMargin = 10;
    var columnSize = 4;
    var column = 0;
    for( var i = 0; i < this.nodeReference.length; i++ ){
      if( column >= columnSize ){
        column = 0;
      }
        var yPosition = 0;
        var node = this.nodeReference[ i ];
        if ( i - 4 >= 0 ) {
          var nodeAbove = this.nodeReference[ i - 4 ];
          yPosition = this.calcHeight(  nodeAbove );
          startingY = this.getNodePosition( nodeAbove ).y;
        }
        if ( node.id == 'root' ){
          node.domElement.classList.add('root');
        }
        var point = { x : startingX + xMargin * column, y : startingY + ( yPosition + yMargin)  };
        node.moveTo( point );

        column++;
      }
  }
  //Random Node Generator
  playerMode(){
    var qty = 15;
    for( var j = 0; j < qty; j++ ){
      var content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";
      var endPoint = Math.floor((Math.random() * 220) + 1 );
      this.nodeArray.push( { id : j, content : content.slice( 0, endPoint ) } )
    }

    var n = this.nodeArray.length;
    var arr = [];
    while ( arr.length < n ) {
      var num = Math.floor((Math.random() * n) + 0 );
      arr.includes( num ) ? ' ' : arr.push( num );
    }
    var that = this;
    arr.map( function( num ) {
      var node = that.createNode( that.nodeArray[ num ].id );
      node.addContent( that.nodeArray[ num ].content, false );

    })
  }

}

var argmap = new ARGmap();
  argmap.createRoot();
// argmap.playerMode();
// argmap.displayNodes();
