
#include <fcntl.h>

//#include <gflags/gflags.h>
//#include <glog/logging.h>


#include <google/protobuf/text_format.h>
#include <google/protobuf/io/zero_copy_stream_impl.h>

#include <caffe/caffe.hpp>
#include <caffe/proto/caffe.pb.h> 

#include "Caffelib.hpp"
 

//template class caffe::SolverRegistry<float>  ;

void caffenetview::Init() {
	::google::InitGoogleLogging("CaffeNetView") ;
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
		  TextFormat::ParseFromString( prototxt, &networkConfig );
					  
		  networkConfig.SerializeToString( &proto_buffer_  ) ;
		}
      }
      
      /**
      * destroy
      */
      ~CaffeNetViewImpl() {
      }
        
      const std::string &proto_buffer() { return proto_buffer_ ; }
       
    	
    private: 
    	std::string proto_buffer_ ;
  } ;

  CaffeNetView *create( std::string prototxt ) {
    return new CaffeNetViewImpl( prototxt ) ;
  } 

}
