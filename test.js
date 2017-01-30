
const cnv = require( "caffe-netview" ) ;

var pt = "name: 'Planets' 						\
layer {									\
  name: 'input'								\
  type: 'Input'								\
  top: 'data'								\
  include { stage: 'deploy' }						\
  input_param { shape: { dim: 1 dim: 3 dim: 128 dim: 128 } }		\
  transform_param {							\
    scale: 0.00390625							\
  }									\
} " ; 

var nv = new cnv.CaffeNetView( pt ) ;

console.log( nv.length ) ;


