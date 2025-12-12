/*\
title: $:/yaisog/config/plot/cumsum-vs-date.js
type: application/javascript
module-type: plotconfig

Zeigt ein Liniendiagramm im Zeitverlauf an, bei dem die y-Werte kumulativ aufsummiert werden.
Datenpunkte müssen die Felder "x" (Datum) und "y" (Wert) enthalten.

\*/

const baseConfig = require("$:/yaisog/config/plot/base.js");

exports.config = function(Plot, d3, data, options) {

	const config = baseConfig.config(Plot, d3, data, options);

	// Override x-axis configuration for dates
	config.x.label = options.xLabel || "Datum";
	config.x.type = "utc";

	config.marks = [
		Plot.frame(),
		Plot.axisX({
			anchor: "bottom",
			labelAnchor: "center",
			labelArrow: "none",
			labelOffset: 42,
			marginBottom: 50,
			ticks: "month"
		}),
		Plot.axisY({
			anchor: "left",
			labelAnchor: "center",
			labelArrow: "none",
			marginLeft: 65,
			tickFormat: d3.format(options.numberFormatY)
		}),
		Plot.lineY(
			data,
			Plot.mapY("cumsum", {
				x: "x",
				y: "y",
				stroke: "steelblue",
				clip: true,
				curve: "step-after"
			})
		)
	];

	return config;
};

