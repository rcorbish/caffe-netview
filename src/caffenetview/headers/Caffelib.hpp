
#include <string>

namespace caffenetview {

	class CaffeNetView {
		public:
			virtual ~CaffeNetView() {} ;
	} ;

	extern CaffeNetView *create( std::string prototxt ) ;
	extern void Init() ;
}
