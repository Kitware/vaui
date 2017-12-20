add_standard_plugin_tests(NO_SERVER_TESTS NO_CLIENT_TESTS)


#set_property(TEST puglint_vaui PROPERTY LABELS vaui_client)
set_property(TEST eslint_vaui PROPERTY LABELS vaui_client)

add_puglint_test(vaui_external "${CMAKE_CURRENT_LIST_DIR}/web_external/templates")
set_property(TEST puglint_vaui_external PROPERTY LABELS vaui_client)

add_eslint_test(vaui_tests "${CMAKE_CURRENT_LIST_DIR}/plugin_tests" ESLINT_CONFIG_FILE "${PROJECT_SOURCE_DIR}/clients/web/test/.eslintrc.json")
set_property(TEST eslint_vaui_tests PROPERTY LABELS vaui_client)
add_eslint_test(vaui_external "${CMAKE_CURRENT_LIST_DIR}/web_external" ESLINT_CONFIG_FILE "${CMAKE_CURRENT_LIST_DIR}/.eslintrc.js"
ESLINT_IGNORE_FILE "${CMAKE_CURRENT_LIST_DIR}/.eslintignore"
)
set_property(TEST eslint_vaui_external PROPERTY LABELS vaui_client)
