
const d3 = require("d3") ;
const fs = require( "fs" ) ;
const pb = require("node-protobuf") ;
const cnv = require( "caffe-netview" ) ;


const protobufDesc = fs.readFileSync("caffe-protocol.protodesc" ) ;
const protobufParser = new pb( protobufDesc ) ;


module.exports = function( text, charge, tension, radius, includedStages ) {
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
		return layout( netobj, charge, tension, radius, includedStages ) ;
	}) ;	
	
	return rc ;		// return the promise once we have parsed the text
}



function layout( netobj, charge, tension, radius, includedStages ) {
		
	return new Promise( function( resolve, reject ) {

		const rc = {} ;
		rc.nodes = [] ;
		
		// layers can be new or old name :(
		const layers = ( ( netobj.layer.length === 0 ) ? netobj.layers : netobj.layer )
			.filter( item => 
						!includedStages || 
						item.include.length===0 || 
						item.include[0].stage.indexOf( includedStages ) >= 0 
					) ;		
		
		const stages = [] ;
		// find all the data blobs - these will be nodes
		for( let i=0 ; i<layers.length ; i++ ) {
			for( let j=0 ; j<layers[i].include.length ; j++ ) {
				if( layers[i].include[j].stage.length ) {
					stages.push( layers[i].include[j].stage ) ;
				}
				if( layers[i].include[j].not_stage.length ) {
					stages.push( layers[i].include[j].not_stage ) ;
				}
			}

			for( var t=0 ; t<layers[i].top.length ; t++ ) {		
				if( !rc.nodes.find( function(e){ return e.name==='blob-'+layers[i].top[t] ; } ) ) {   						
					rc.nodes.push( { 'type':'blob', "name" : 'blob-' + layers[i].top[t], 'xxPreferred' : (i-layers.length/2) * 50 } ) ;
				}
			}
			for( var b=0 ; b<layers[i].bottom.length ; b++ ) {					
				if( !rc.nodes.find( function(e){ return e.name==='blob-'+layers[i].bottom[b] ; } ) ) {   						
					rc.nodes.push( { 'type':'blob', "name" : 'blob-' + layers[i].bottom[b], 'xxPreferred' : (i-layers.length/2) * 50} ) ;
				}
			}
		}
		rc.stages = stages.filter((v, i, a) => a.indexOf(v) === i); 
		// Now add each actual layer 
		for( var i=0 ; i<layers.length ; i++ ) {
			let node = { 'type' : layers[i].type.toLowerCase(), "name" : layers[i].name, 'xPreferred' : (i-layers.length/2) * 50 } ;
			rc.nodes.push( node ) ;
		}
		// prepare a force layout simulation for layers ( name is unique )		

		rc.links = [] ;
		// Now create links between items - note links always exist between a layer and a data item
		// some special layers have input blob == output blob 
		for( var i=0 ; i<layers.length ; i++ ) {
			let layer = layers[i] ;
			let bottoms = layer.bottom ;
			let tops = layer.top ;
			
			// is a special layer that uses previous layer's blob ( e.g. relu )
			if( bottoms.length === 1 && tops.length ===1 && bottoms[0] === tops[0] ) {
				let blob = rc.nodes.find( function(e){ return e.name==='blob-'+bottoms[0] ; } ) ; // find the blob
				blob.layer = layer.type ;
				rc.nodes = rc.nodes.filter( item => item.name !== layer.name ) ;
			} else {
				for( var b=0 ; b<bottoms.length ; b++ ) {
					let l ={ "source" : 'blob-'+bottoms[b], "target": layer.name } ;
					if( bottoms[b].name === 'blob-data ' ) l.tension = 1.1 ;
					rc.links.push( l ) ;
				}
				
				for( var t=0 ; t<tops.length ; t++ ) {
					let l = { "source" : layer.name, "target": 'blob-'+tops[t] } ;
					if( tops[t].name === 'blob-data ' ) l.tension = 1.1 ;
					rc.links.push( l ) ;
				}
			}
		}
		 
		const simulation = d3.forceSimulation()
			.force( "link", d3.forceLink()
					.id( function(d) { return d.name ; } )
					.strength( function(d) { return d.tension || (tension||1.5) ; }) 
					.distance( function(d) { return 10 ; } ) 
				)
			.force( "charge", d3.forceManyBody()
					.strength( -(charge||30) ) 
				)
			//.force( "center", d3.forceCenter(0, 0) ) 
			.force( "collide", d3.forceCollide(radius||20) ) 
			.force( "x", d3.forceX( function(d) { return d.xPreferred || 0 ; } ).strength( function(d) { return d.xPreferred ? 0.5 : 0.0 ; } ) )
			.force( "y", d3.forceY( function(d) { return 0 ; } ).strength( 0.3 ) )
			.stop();		// static layout
				
		simulation.nodes( rc.nodes ) ;
		simulation.force( "link" ).links( rc.links ) ;
		
		
	    for( let i=0 ; i<600 ; i++ ) {
	        simulation.tick();
	    }
	    
	    resolve( rc ) ;
	}) ;
}