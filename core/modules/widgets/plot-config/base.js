/*\
title: $:/yaisog/config/plot/base.js
type: application/javascript
module-type: plotconfig

Simple line chart configuration
\*/

exports.config = function(Plot, d3, data, options) {
	// Wir prüfen, ob die Daten eine ID-Property enthalten und setzen dann color:domain entsprechend
	const hasIDs = data.length > 0 && data[0].ID !== undefined;

	return {
		width: options.plotWidth || 960,
		height: options.plotHeight || 540,
		x: {
			grid: true,
			label: options.xLabel || "X",
			domain: options.plotXLim
		},
		y: {
			grid: true,
			label: options.yLabel || "Y",
			domain: options.plotYLim
		},
		color: {
			scheme: options.colorScheme || "Observable10",
			domain: hasIDs ? [...new Set(data.map(d => d.ID))] : undefined,
			legend: options.plotLegend,
			className: "yc-plot-legend"
		},
		style: {
			fontSize: 14
		},
		marks: [
			Plot.frame(),
			Plot.axisX({
				anchor: "bottom",
				labelAnchor: "center",
				labelArrow: "none",
				labelOffset: 42,
				marginBottom: 50,
				tickFormat: d3.format(options.numberFormatX)
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
				{
					x: "x",
					y: "y",
					stroke: "ID",
					clip: true
				}
			)
		]
	};
};