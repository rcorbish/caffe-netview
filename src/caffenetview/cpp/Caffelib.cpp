
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
      CaffeNetViewImpl( std::string prototxt ) {
      	if( !prototxt.empty() ) {
	      caffe::NetParameter networkConfig ;	
		  TextFormat::ParseFromString(prototxt, &networkConfig);
			
		  RepeatedPtrField<caffe::LayerParameter> layers = networkConfig.layer() ;
		  
		  cout << "Read " << layers.size() << " layers." << endl ;
		  for ( int i=0 ; i<layers.size() ; ++i ) {
			cout << layers.Get(i).name() << endl ;
		  }
		}
      }
      ~CaffeNetViewImpl() {
      }

    private: 
  } ;

  CaffeNetView *create( std::string prototxt ) {
    return new CaffeNetViewImpl( prototxt ) ;
  }

  //typedef caffe::SolverRegistry<float> reg;  // need this to support solvers
}
