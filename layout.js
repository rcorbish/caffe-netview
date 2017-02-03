
const d3 = require("d3") ;
const fs = require( "fs" ) ;
const pb = require("node-protobuf") ;
const cnv = require( "caffe-netview" ) ;


const protobufDesc = fs.readFileSync("caffe-protocol.protodesc" ) ;
const protobufParser = new pb( protobufDesc ) ;


module.exports = function( text ) {
	var nv = new cnv.CaffeNetView( text ) ;		// external C++ to turn prototxt to binary 
	var b = new Buffer( nv.buffer ) ;			// npm lib to read protobuf binary
	
	// Then parse the binary into a "caffe.netParameter"
	const rc = new Promise( function( resolve, reject ) {
		protobufParser.parse( b, 'caffe.NetParameter', function( err, obj) {
			if( err ) {
				reject( err ) ;		// fail on error
			} else {
				resolve( obj ) ;	// init the promise chain 
			}
		} ) ;
	})
	.then( function( netobj ){
		return layout( netobj ) ;
	}) ;	
	
	return rc ;		// return the promise once we have parsed the text
}



function layout( netobj ) {

	return new Promise( function( resolve, reject ) {

		const rc = {} ;
		rc.nodes = [] ;
		
		for( var i=0 ; i<netobj.layer.length ; i++ ) {
			for( var t=0 ; t<netobj.layer[i].top.length ; t++ ) {					
				if( !rc.nodes.find( function(e){ return e.name==='blob-'+netobj.layer[i].top[t] ; } ) ) {   						
					rc.nodes.push( { 'type':'blob', "name" : 'blob-' + netobj.layer[i].top[t], 'xPreferred' : (i-netobj.layer.length/2) * 10 } ) ;
				}
			}
			for( var b=0 ; b<netobj.layer[i].bottom.length ; b++ ) {					
				if( !rc.nodes.find( function(e){ return e.name==='blob-'+netobj.layer[i].bottom[b] ; } ) ) {   						
					rc.nodes.push( { 'type':'blob', "name" : 'blob-' + netobj.layer[i].bottom[b], 'xPreferred' : (i-netobj.layer.length/2) * 10} ) ;
				}
			}
		}

		for( var i=0 ; i<netobj.layer.length ; i++ ) {
			let node = { 'type' : netobj.layer[i].type.toLowerCase(), "name" : netobj.layer[i].name, 'xPreferred' : (i-netobj.layer.length/2) * 10 } ;
			if( node.type==='input' ) {
				node.xPreferred = -200 ;
			}
			if( node.type==='data' ) {
				node.xPreferred = -275 ;
			}
			if( node.type==='accuracy' ) {
				node.xPreferred = 275 ;
			}
			if( node.type.startsWith('softmax') ) {
				node.xPreferred = 250 ;
			}
			rc.nodes.push( node ) ;
		}
		// prepare a force layout simulation for layers ( name is unique )		

		rc.links = [] ;
		
		for( var i=0 ; i<netobj.layer.length ; i++ ) {
			let layer = netobj.layer[i] ;
			let bottoms = layer.bottom ;
			let tops = layer.top ;
			
			for( var b=0 ; b<bottoms.length ; b++ ) {
				let l ={ "source" : 'blob-'+bottoms[b], "target": layer.name } ;
				if( bottoms[b].name === 'blob-data ' ) l.tension = 0.1 ;
				rc.links.push( l ) ;
			}
			
			for( var t=0 ; t<tops.length ; t++ ) {
				let l = { "source" : layer.name, "target": 'blob-'+tops[t] } ;
				if( tops[t].name === 'blob-data ' ) l.tension = 0.1 ;
				rc.links.push( l ) ;
			}
		}
		 
		const simulation = d3.forceSimulation()
			.force( "link", d3.forceLink().id( function(d) { return d.name ; } ).strength(function(d) { return d.tension || 1.5 ; }) )
			.force( "charge", d3.forceManyBody().strength( -50 ) )
			.force( "center", d3.forceCenter(0, 0) ) 
			.force( "x", d3.forceX( function(d) { return d.xPreferred || 0 ; } ).strength( 0.8 ) )
			.stop();		// static layout
				
		simulation.nodes( rc.nodes ) ;
		simulation.force( "link" ).links( rc.links ) ;
		
		
	    for( var i=0 ; i<400 ; i++ ) {
	        simulation.tick();
	    }
	    
	    resolve( rc ) ;
	}) ;
}