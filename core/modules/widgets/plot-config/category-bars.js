/*\
title: $:/yaisog/config/plot/category-bars.js
type: application/javascript
module-type: plotconfig

Zeigt ein Balkendiagramm für eine beliebige Metrik für kategorische Einträge an, z.B. Anwesenheitshäufigkeit von Personen.
Datenpunkte müssen die Felder "ID" (Kategorie) und "y" (Metrik) enthalten.

Optionen:
Parameter 0: Schwellenwert für die Schriftposition (auf den Balken oder oberhalb des Balkens, Standard: 0)

\*/

const baseConfig = require("$:/yaisog/config/plot/base.js");

exports.config = function(Plot, d3, data, options) {

	const config = baseConfig.config(Plot, d3, data, options);

	const threshold = options.parameters && Number.isInteger(Number(options.parameters[0])) ? Number(options.parameters[0]) : 0;

	// Override marks array with custom bar chart marks
	config.marks = [
		Plot.frame({anchor: "bottom"}),
		Plot.frame({anchor: "left"}),
		Plot.axisX({
			anchor: "bottom",
			labelAnchor: "center",
			labelArrow: "none",
			labelOffset: 42,
			marginBottom: 50,
			label: undefined,
			ticks: []
		}),
		Plot.axisY({
			anchor: "left",
			labelAnchor: "center",
			labelArrow: "none",
			marginLeft: 50,
			tickFormat: d3.format(options.numberFormatY)
		}),
		Plot.barY(
			data,
			{
				x: "ID",
				y: "y",
				fill: "steelblue",
				sort: {x: "-y"}
			}
		),
		Plot.text(
			data.filter(d => d.y >= threshold),
			{
				x: "ID",
				y: 0.5,
				text: "ID",
				fill: "white",
				fontSize: 14,
				rotate: -90,
				textAnchor: "start",
				sort: {x: "-y"}
			}
		),
		Plot.text(
			data.filter(d => d.y < threshold),
			{
				x: "ID",
				y: d => d.y + 0.5,
				text: "ID",
				fill: "black",
				fontSize: 14,
				rotate: -90,
				textAnchor: "start",
				sort: {x: "-y"}
			}
		),
		Plot.ruleY([0])
	];

	return config;
};