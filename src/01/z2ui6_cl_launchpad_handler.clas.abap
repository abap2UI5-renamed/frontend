CLASS z2ui6_cl_launchpad_handler DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.

    INTERFACES if_http_extension.

  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.



CLASS z2ui6_cl_launchpad_handler IMPLEMENTATION.

  METHOD if_http_extension~handle_request.

    z2ui6_cl_http_handler=>factory( server )->main( ).

  ENDMETHOD.

ENDCLASS.
