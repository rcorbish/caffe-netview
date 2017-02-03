
const fs = require( "fs" ) ;
const pb = require("node-protobuf") ;
const cnv = require( "caffe-netview" ) ;

var pt = "name: 'Planets'" 		+ 			
		 "layer { 	"			+ 
		 " name: 'input'  \n" +
		 " type: 'Input'  \n" +
		 " top: 'data'	  \n" +
		 " include { stage: 'deploy' }	  \n" +
		 " input_param { shape: { dim: 1 dim: 3 dim: 128 dim: 128 } }	  \n" +
		 " transform_param {	  \n" +
		 "   scale: 0.00390625	  \n" +
		 " }			  \n" +
		 "} " ; 

var nv = new cnv.CaffeNetView( pt ) ;
var buf = fs.readFileSync("caffe-protocol.protodesc" ) ;
var pbuf = new pb( buf) ;
var b = new Buffer( nv.buffer ) ;
var net = pbuf.parse( b, 'caffe.NetParameter' ) ;
if( net.name ) {
	console.log( JSON.stringify( net, null, 2 )  ) ;
}

