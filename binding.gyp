{
  "targets": [
    {
      "target_name": "uia",
      "sources": [ "gyp/uia.cpp" ],
      "libraries": [
        "uiautomationcore.lib",
        "ole32.lib",
        "comsuppw.lib"
      ],
      "defines": [ "NAPI_VERSION=3" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.7"
      },
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1
        }
      }
    }
  ]
}