
#include <string>

namespace caffenetview {

	class Layer ;
	
	class CaffeNetView {
		public:
			virtual ~CaffeNetView() {} ;
			virtual const std::string &proto_buffer() = 0 ;
	} ;

	extern CaffeNetView *create( std::string prototxt ) ;
	extern void Init() ;
}
