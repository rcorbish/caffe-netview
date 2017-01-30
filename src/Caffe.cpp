
#include <node.h>
#include <uv.h>
#include <node_object_wrap.h>
#include <iostream>
#include <stdio.h>
#include <string.h>
#include <thread>
#include <algorithm>

#include "Caffelib.hpp"

using namespace std;
using namespace v8;


/**
 This is the main class to represent a caffe net
*/

class WrappedCaffeNetView : public node::ObjectWrap
{
  public:
    /*
       Initialize the prototype of class Array. Called when the module is loaded.
       ALl the methods and attributes are defined here.
    */
    static void Init(v8::Local<v8::Object> exports, Local<Object> module) {

      Isolate* isolate = exports->GetIsolate();

      // Prepare constructor template and name of the class
      Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
      tpl->SetClassName(String::NewFromUtf8(isolate, "CaffeNetView"));
      tpl->InstanceTemplate()->SetInternalFieldCount(1);

      // Prototype - methods. These can be called from javascript
      NODE_SET_PROTOTYPE_METHOD(tpl, "toString", ToString);
      NODE_SET_PROTOTYPE_METHOD(tpl, "inspect", Inspect);


      // define how we access the attributes
      tpl->InstanceTemplate()->SetAccessor(String::NewFromUtf8(isolate, "name"), GetCoeff );
      tpl->InstanceTemplate()->SetAccessor(String::NewFromUtf8(isolate, "length"), GetCoeff );

      constructor.Reset(isolate, tpl->GetFunction());
      exports->Set(String::NewFromUtf8(isolate, "CaffeNetView"), tpl->GetFunction());
    }

  private:
   /*
	The C++ constructor.
   */
    explicit WrappedCaffeNetView( std::string prototxt ) {
        name_ = NULL ;
        netview_ = caffenetview::create( prototxt ) ;
    }
    
    /*
	The destructor needs to free anything
    */
    ~WrappedCaffeNetView() { 
    	delete name_ ;
    	delete netview_ ;
    }

    /*
	The javascript constructor. N = new c.Caffe( .... ) 
    */
    static void New(const v8::FunctionCallbackInfo<v8::Value>& args) {
      if (args.IsConstructCall()) {
        if( args.Length()>0 && !args[0]->IsUndefined() ) {
          Isolate* isolate = args.GetIsolate();
          Local<Context> context = isolate->GetCurrentContext() ;
          //Local<String> str = args[0]->ToString(context).ToLocalChecked() ;
          
          v8::String::Utf8Value chars( args[0]->ToString(context).ToLocalChecked() ) ;
		  std::string prototxt = std::string(*chars);
		  
          WrappedCaffeNetView* self = new WrappedCaffeNetView( prototxt ) ;
          self->Wrap( args.This() ) ;

        } else {
          WrappedCaffeNetView* self = new WrappedCaffeNetView( NULL ) ;
          self->Wrap( args.This() ) ;
		}
        args.GetReturnValue().Set( args.This() ) ;
      }
    }

/*-----------------------------------------------
 ATTRIBUTES    
-----------------------------------------------*/
    std::string *name_  ; 	/*< Name of this net */
	caffenetview::CaffeNetView *netview_ ;  /*< implementing protobuf code */
	
/*-----------------------------------------------
 JS METHODS    
-----------------------------------------------*/

    static void ToString(const FunctionCallbackInfo<Value>& args);
    static void Inspect(const FunctionCallbackInfo<Value>& args);

    static void GetCoeff(Local<String> property, const PropertyCallbackInfo<Value>& info);

    static v8::Persistent<v8::Function> constructor; /**< a nodejs constructor for this object */
} ;
Persistent<Function> WrappedCaffeNetView::constructor;



/** 
	returns a string representation of the target 
*/
void WrappedCaffeNetView::ToString( const v8::FunctionCallbackInfo<v8::Value>& args )
{
  Isolate* isolate = args.GetIsolate();
//  Local<Context> context = isolate->GetCurrentContext() ;

  WrappedCaffeNetView* self = ObjectWrap::Unwrap<WrappedCaffeNetView>(args.Holder());
  
  if( self->name_ != NULL  ) {
  	args.GetReturnValue().Set( v8::String::NewFromUtf8( isolate,  self->name_->c_str() ) ) ;
  } else {  
  	args.GetReturnValue().Set( v8::String::NewFromUtf8( isolate,  "** Empty **" ) ) ;
  }
}

/** internally calls ToString. @see ToString */
void WrappedCaffeNetView::Inspect( const v8::FunctionCallbackInfo<v8::Value>& args ) {
  ToString( args ) ;
}





/**
	This is a nodejs defined method to get attributes. 
*/
void WrappedCaffeNetView::GetCoeff(Local<String> property, const PropertyCallbackInfo<Value>& info)
{
  Isolate* isolate = info.GetIsolate();
  //Local<Context> context = isolate->GetCurrentContext() ;
  WrappedCaffeNetView* obj = ObjectWrap::Unwrap<WrappedCaffeNetView>(info.This());

  v8::String::Utf8Value s(property);
  std::string str(*s);

  if (str == "name" && obj->name_ != NULL ) {
    info.GetReturnValue().Set( String::NewFromUtf8( isolate,  obj->name_->c_str() ) ) ;
  } else if (str == "length" && obj->netview_ != NULL ) {
    info.GetReturnValue().Set( obj->netview_->size() ) ;
  }

}


 

/**
	The module init script - called by nodejs at load time
*/
void InitCaffeNetView(Local<Object> exports, Local<Object> module) {
  caffenetview::Init() ;
  WrappedCaffeNetView::Init(exports, module);
}


NODE_MODULE(caffenetview, InitCaffeNetView)

