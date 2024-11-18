@echo off

set /p dep=Department abbreviation:
curl -s --data "type=abbrevation&abbreviation=%dep%&search=" https://www.stonybrook.edu/sb/bulletin/current/search/byabbreviation/index.php -o departments/html/%dep%.html

echo CURL DONE

cd departments
node to_json.js

echo JSON DONE