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

	// Sammle alle vorhandenen IDs (Serien) in der Reihenfolge ihres ersten Auftretens
	const seriesIDs = [...new Set(data.map(d => d.ID))];

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
		// Für jede Kurve einen eigenen dot-Marker, damit alle Schnittpunkte mit der Vertikalen angezeigt werden
		...seriesIDs.map(id => Plot.dot(
			data.filter(d => d.ID === id),
			Plot.pointerX({
				x: "x",
				y: "y",
				fill: "ID",
				stroke: "white",
				strokeWidth: 1.5,
				r: 4,
				clip: true
			})
		)
		),
		// Wir zeigen die Y-Werte *aller* Kurven an, wenn diese einen Punkt an der X-Position des Cursors haben
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
					// Sortiere nach Serien-Reihenfolge
					const byID = matches.sort((a, b) => {
						const indexA = seriesIDs.indexOf(a.ID);
						const indexB = seriesIDs.indexOf(b.ID);
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