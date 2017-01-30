
const cnv = require( "caffe-netview" ) ;

module.exports = function( text ) {
	var nv = new cnv.CaffeNetView( text ) ;
	console.log( nv.length ) ;
	return { text: "Gotcha" } ;
}