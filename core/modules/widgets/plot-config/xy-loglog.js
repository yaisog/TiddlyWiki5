/*\
title: $:/yaisog/config/plot/xy-loglog.js
type: application/javascript
module-type: plotconfig

Simple line chart configuration
\*/

var baseConfig = require("$:/yaisog/config/plot/xy-line.js");

exports.config = function(Plot, d3, data, options) {

	const config = baseConfig.config(Plot, d3, data, options);

	// Wir zeigen die Y-Werte aller Kurven an, wenn diese einen Punkt an der X-Position des Cursors haben
	config.x.type = "log";
	config.y.type = "log";

	return config;
};