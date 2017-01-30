{
  "targets": [
	{
      "target_name": "caffe-netview",
      "defines": [
		"GOOGLE_PROTOBUF_NO_RTTI"
       ,"BOOST_NO_EXCEPTIONS"
      ],
      "sources": [ "src/Caffe.cpp" ], 
      "libraries": [
        "-Llibs/caffenetview/shared", 
        "-L/home/richard/caffe/.build_release/lib",
	    "-lcaffenetview", "-lpthread", "-lgfortran", 
	    "-lboost_system", "-lcaffe"
      ],
      'include_dirs': [
        "src/caffenetview/headers"
      ],
      "cflags": [ "-fmax-errors=5", "-Wno-sign-compare", "-Wall" ],
      "ldflags": [
      	"-Wl,-rpath,/home/richard/workspace/caffe-netview/build/libs/caffenetview/shared",
      	"-Wl,-rpath,/home/richard/caffe/.build_release/lib"
       ],
      'xcode_settings': {
        'OTHER_CFLAGS': [ ],
      },
      "conditions": [ 
        [ 'OS=="mac"', {
            "xcode_settings": { 
                'OTHER_CPLUSPLUSFLAGS' : ['-std=c++11','-stdlib=libc++'],
                'OTHER_LDFLAGS': ['-stdlib=libc++'],
                'MACOSX_DEPLOYMENT_TARGET': '10.7' }
            }
        ]
      ]
	}
  ]
}

