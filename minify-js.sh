#!/bin/bash

terser --compress -o WebContent/client/js/min/util.js -- WebContent/client/js/util.js
terser --compress -o WebContent/client/js/min/pbapp.js -- WebContent/client/js/pbapp.js
terser --compress -o WebContent/client/js/min/details.js -- WebContent/client/js/details.js
