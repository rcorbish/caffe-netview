
const cnv = require( "caffe-netview" ) ;

module.exports = function( text ) {
	var nv = new cnv.CaffeNetView( text ) ;

	return { text: "Gotcha" } ;
}