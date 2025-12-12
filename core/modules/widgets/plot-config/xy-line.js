/*\
title: $:/yaisog/config/plot/xy-line.js
type: application/javascript
module-type: plotconfig

Erweitert base.js um einen X-Cursor und die numerische Anzeige des Y-Werte an der Cursorposition

\*/

var baseConfig = require("$:/yaisog/config/plot/base.js");

exports.config = function(Plot, d3, data, options) {

	const config = baseConfig.config(Plot, d3, data, options);

	function extractUnit(label) {
		if(!label) return "";
		const match = label.match(/\s\[([^\]]+)\]$/);
		return match ? match[1] : "";
	}

	// Wir extrahieren die Einheiten aus den Achslabels
	const xUnit = extractUnit(options.xLabel);
	const yUnit = extractUnit(options.yLabel);

	// Get the color domain order
	const colorOrder = [...new Set(data.map(d => d.ID))];

	// Wir zeigen die Y-Werte *aller* Kurven an, wenn diese einen Punkt an der X-Position des Cursors haben
	config.marks.push(
		Plot.ruleX(
			data,
			Plot.pointerX({
				x: "x",
				py: "y",
				stroke: "grey",
				strokeDasharray: "5,5"
			})
		),
		Plot.dot(
			data,
			Plot.pointerX({
				x: "x",
				y: "y",
				stroke: "ID",
				strokeWidth: 2,
				r: 4
			})
		),
		Plot.text(
			data,
			Plot.pointerX({
				px: "x",
				py: "y",
				dy: -17,
				frameAnchor: "top",
				fontVariant: "tabular-nums",
				fontSize: 14,
				text: d => {
					const x = d.x;
					const matches = data.filter(row => row.x === x);
					// Sort by color domain order
					const byID = matches.sort((a, b) => {
						const indexA = colorOrder.indexOf(a.ID);
						const indexB = colorOrder.indexOf(b.ID);
						return indexA - indexB;
					});
					const xLabelWithoutUnit = (options.xLabel.replace(/\s*\[([^\]]+)\]$/, "") || "X");
					const yLabelWithoutUnit = (options.yLabel.replace(/\s*\[([^\]]+)\]$/, "") || "Y");
					return [
						`${xLabelWithoutUnit}: ${d3.format(options.numberFormatX)(x)}${xUnit}`,
						...byID.map(row => `${row.ID || yLabelWithoutUnit}: ${d3.format(options.numberFormatY)(row.y)}${yUnit}`)
					].join("   ");
				}
			})
		)
	);

	return config;
};