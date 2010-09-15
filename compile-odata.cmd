@echo off
echo.
echo Compiling odata.js
echo.
java -jar compiler.jar --js "src\odata.js" --js_output_file "src\odata-compiled.js"