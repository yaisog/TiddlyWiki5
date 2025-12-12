/*\
title: $:/yaisog/config/plot/xy-semilogx.js
type: application/javascript
module-type: plotconfig

Simple line chart configuration
\*/

var baseConfig = require("$:/yaisog/config/plot/xy-line.js");

exports.config = function(Plot, d3, data, options) {

	const config = baseConfig.config(Plot, d3, data, options);

	config.x.type = "log";

	return config;
};