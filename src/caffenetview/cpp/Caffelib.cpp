
#include <fcntl.h>

#include <gflags/gflags.h>
#include <glog/logging.h>


#include <google/protobuf/text_format.h>
#include <google/protobuf/io/zero_copy_stream_impl.h>

#include <caffe/caffe.hpp>
#include <caffe/proto/caffe.pb.h> 

#include "Caffelib.hpp"
 

//template class caffe::SolverRegistry<float>  ;

void caffenetview::Init() {
	::google::InitGoogleLogging("CaffeNet") ;
    GOOGLE_PROTOBUF_VERIFY_VERSION;
} 

using namespace google::protobuf;
using namespace google::protobuf::internal;


namespace caffenetview {

  class CaffeNetViewImpl : public CaffeNetView {

    public:
      CaffeNetViewImpl( std::string prototxt ) : layers_()  {
      	if( !prototxt.empty() ) {
	      caffe::NetParameter networkConfig ;	
		  TextFormat::ParseFromString(prototxt, &networkConfig);
			
		  RepeatedPtrField<caffe::LayerParameter> layers = networkConfig.layer() ;
		  
		  for ( int i=0 ; i<layers.size() ; ++i ) {
		  	caffe::LayerParameter layer = layers.Get(i) ;
			//cout << layers.Get(i).name() << endl ;
			layers_.push_back( new Layer( layer.name() ) ) ;
			
			std::vector<const FieldDescriptor*> output ;
			layer.GetReflection()->ListFields( layer, &output ) ;
			cout << "Layer" << i << " ... " << output.size() << endl ;
		  }
		}
      }
      ~CaffeNetViewImpl() {
      	 for( Layer *l : layers_ ) {
        	delete l ;
    	 }
      }

        int size() { return layers_.size() ; }
        const Layer & operator []( int ix ) { return *(layers_[ix]) ; } 
    private: 
    	std::vector<Layer*> layers_ ;
  } ;

  CaffeNetView *create( std::string prototxt ) {
    return new CaffeNetViewImpl( prototxt ) ;
  } 


  Layer::Layer( std::string name ) : name_(name) { }
  std::string Layer::name() { return name_ ; }
  
}
