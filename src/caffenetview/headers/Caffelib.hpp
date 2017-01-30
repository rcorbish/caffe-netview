
#include <string>

namespace caffenetview {

	class Layer ;
	
	class CaffeNetView {
		public:
			virtual ~CaffeNetView() {} ;
			virtual int size() = 0 ;
			virtual const Layer & operator[]( int ix ) = 0 ;
	} ;


    class Layer {
      public:
        Layer( std::string name ) ;
		virtual ~Layer() {} ;
        std::string name() ;
   	  private:
  		std::string name_ ;
    } ;
  
	extern CaffeNetView *create( std::string prototxt ) ;
	extern void Init() ;
}
