
const fs = require( "fs" ) ;
const pb = require("node-protobuf") ;
const cnv = require( "caffe-netview" ) ;

const protobufDesc = fs.readFileSync("caffe-protocol.protodesc" ) ;
const protobufParser = new pb( protobufDesc ) ;

module.exports = function( text, includedStages ) {
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
		return layout( netobj, includedStages ) ;
	}) ;	
	
	return rc ;		// return the promise once we have parsed the text
}



function layout( netobj, includedStages ) {
		
	return new Promise( function( resolve, reject ) {

		const rc = {} ;
		rc.nodes = [] ;
		// layers can be new or old name :(
		var layers = ( ( netobj.layer.length === 0 ) ? netobj.layers : netobj.layer ) ;

		const stages = {} ;
		for( let i=0 ; i<layers.length ; i++ ) {
			for( let j=0 ; j<layers[i].include.length ; j++ ) {
				if( layers[i].include[j].stage.length ) {
					stages[layers[i].include[j].stage] = false ;
				}
				if( layers[i].include[j].not_stage.length ) {
					stages[layers[i].include[j].not_stage] = false ;
				}
			}
		}		

		layers = layers
			.filter( item => 
						!includedStages || 
						item.include.length===0 || 
						item.include[0].stage.indexOf( includedStages ) >= 0 
					) ;		
		
		// find all the data blobs - these will be nodes
		for( let i=0 ; i<layers.length ; i++ ) {
			for( let j=0 ; j<layers[i].include.length ; j++ ) {
				if( layers[i].include[j].stage.length ) {
					stages[layers[i].include[j].stage] = true ;
				}
				if( layers[i].include[j].not_stage.length ) {
					stages[layers[i].include[j].not_stage] = true ;
				}
			}

			for( var t=0 ; t<layers[i].top.length ; t++ ) {		
				if( !rc.nodes.find( function(e){ return e.name==='blob-'+layers[i].top[t] ; } ) ) {   						
					rc.nodes.push( { 'type':'blob', "name" : 'blob-' + layers[i].top[t] } ) ;
				}
			}
			for( var b=0 ; b<layers[i].bottom.length ; b++ ) {					
				if( !rc.nodes.find( function(e){ return e.name==='blob-'+layers[i].bottom[b] ; } ) ) {   						
					rc.nodes.push( { 'type':'blob', "name" : 'blob-' + layers[i].bottom[b] } ) ;
				}
			}
		}
//		rc.stages = stages.filter((v, i, a) => a.indexOf(v) === i); 
		rc.stages = stages ; 
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
	    resolve( rc ) ;
	}) ;
}