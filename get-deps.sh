#!/bin/sh
jquery_ver=3.2.1
jscookie_ver=2.1.4

mkdir logs
curl -Ls https://code.jquery.com/jquery-"$jquery_ver".min.js >public/jquery-"$jquery_ver".min.js
curl -Ls https://github.com/js-cookie/js-cookie/releases/download/v"$jscookie_ver"/js.cookie-"$jscookie_ver".min.js >public/js.cookie-"$jscookie_ver".min.js
