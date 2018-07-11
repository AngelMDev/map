function MapSaver() {
  this.nodeReference = [];
  this.root = [];
  this.dataJson = {
    formatVersion : 0,
    id : 'root',
    ideas : {
      1 : {}
    }
  }
  // GET TEXT FROM NODES
  this.text = function( node ) {
      var textContent = node.domElement.children[4].innerHTML;
      return textContent;
  }
  // GET ARRAY OF SUPPORTING NODES
  this.support = function( node ){
    var supp = [];
    node.childNodes.supporting.map( function( ele ){
      supp.push( ele.nodeGroup );
    })
    return supp;
  }
  // GET ARRAY OF OPPOSING NODES
  this.oppose = function( node ){
    var opp = [];
    node.childNodes.opposing.map( function( ele ){
      opp.push( ele.nodeGroup );
    })
    return opp;
  }

  this.groupContent = function( arr, json ) {
    arr[ 0 ].map( function( node, idx ) {
      json[ idx+1 ] = {};
      json[ idx+1 ].title = this.text( node );
      json[ idx+1 ].id = uniqueId();
      json[ idx+1 ].position = getNodePosition( node );

      var subGroups = 1;
      var subpros = support( node );
      var subcons = oppose( node );
      if ( subpros.length > 0 || subcons.length > 0 ){
        json[ idx+1 ].ideas = {};
        var newJson = json[ idx+1 ].ideas
      }
      this.evalGroups( subpros, subcons, newJson, subGroups );
    })
  }

  this.createJSONGroup = function( arr, json, count, type ) {
      json[ count ] = {
        title : 'group',
        id : uniqueId(),
        attr : {
          group : type
        },
        ideas: {}
      }
      var newJson = json[ count ][ 'ideas' ]
      this.groupContent( arr, newJson )
  }
  // EVALUATE WHICH GROUPS IS BEING CREATED
  this.evalGroups = function( pros, cons, json, count ){
    if ( pros.length > 0 ) {
      pros.map( function( groups ) {
        this.createJSONGroup( pros, json, count, 'supporting')
        count += 1;
      })
    }
    if ( cons.length > 0 ) {
      cons.map( function( groups ) {
        this.createJSONGroup( cons, json, count, 'opposing')
        count += 1;
      })
    }
  }

  this.createJson = function( root ) {
    var json = dataJson[ 'ideas' ][ 1 ];
    if ( root ) {
      json.title = this.text( root );
      json.id = '1';
      json.ideas = {};
      json.position = getNodePosition(root);
    }

    var newJson = json[ 'ideas' ];

    var numGroups = 1;
    var pros = this.support( root );
    var cons = this.oppose( root );
    this.evalGroups( pros, cons, newJson, numGroups);
  }


  this.nodeReference.map( function( node ){
    node.lookForRoot( this.root );
  })
  this.mapObject = this.createJson( this.root[0] );
  // return dataJson;
  console.log(dataJson);
}
