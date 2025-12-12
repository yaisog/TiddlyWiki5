/*\
title: $:/yaisog/modules/widgets/plot.js
type: application/javascript
module-type: widget

Observable Plot widget with config module system

\*/

"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var PlotWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

PlotWidget.prototype = new Widget();

PlotWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();

	var div = this.document.createElement("div");
	div.className = this.plotClass || "yc-plot-widget";

	// Apply inline styles if provided
	if(this.plotStyle) {
		div.setAttribute("style", this.plotStyle);
	}

	parent.insertBefore(div, nextSibling);
	this.domNodes.push(div);

	if(this.loadLibraries()) {
		this.renderPlot(div);
	}
};

PlotWidget.prototype.loadLibraries = function() {
	if(typeof window.d3 !== "undefined" && typeof window.Plot !== "undefined") {
		return true;
	}
	try {
		if(typeof window.d3 === "undefined") {
			var d3Module = require("$:/yaisog/plot/d3.js");
			if(d3Module) {
				window.d3 = d3Module;
			}
		}
		if(typeof window.Plot === "undefined") {
			var plotModule = require("$:/yaisog/plot/plot.js");
			if(plotModule) {
				window.Plot = plotModule;
			}
		}
		return (typeof window.d3 !== "undefined" && typeof window.Plot !== "undefined");
	} catch(e) {
		return false;
	}
};

PlotWidget.prototype.execute = function() {
	// Get attributes
	this.plotData = this.getAttribute("data", "[]");
	this.configName = this.getAttribute("config", "base");
	this.plotClass = this.getAttribute("class", "tc-plot-widget");
	this.plotStyle = this.getAttribute("style", "");
	this.plotCaption = this.getAttribute("caption", "");
	this.xLabel = this.getAttribute("xlabel", "X");
	this.yLabel = this.getAttribute("ylabel", "Y");
	this.plotLegend = this.getAttribute("legend", "no") === "yes" ? true : false;
	this.plotWidth = this.getAttribute("width", "960");
	this.plotHeight = this.getAttribute("height", "540");

	// Handle numberFormat - can be a string or JSON array [xFormat, yFormat]
	const formatString = this.getAttribute("numberFormat", ".3s");
	try {
		const parsed = JSON.parse(formatString);
		if(!Array.isArray(parsed) || parsed.length !== 2)
			throw new Error();
		const[x, y] = parsed;
		if(typeof x !== "string" || typeof y !== "string")
			throw new Error();
		this.numberFormatX = x;
		this.numberFormatY = y;
	} catch(e) {
		this.numberFormatX = formatString;
		this.numberFormatY = formatString;

	}
	const xLim = this.getAttribute("xlim", "");
	try {
		this.plotXLim = xLim === "" ? undefined : JSON.parse(xLim);
	} catch(e) {
		this.configError = "Invalid xlim: " + e.message;
	}

	const yLim = this.getAttribute("ylim", "");
	try {
		this.plotYLim = yLim === "" ? undefined : JSON.parse(yLim);
	} catch(e) {
		this.configError = "Invalid ylim: " + e.message;
	}

	// Parse data JSON
	try {
		this.data = JSON.parse(this.plotData);
	} catch(e) {
		this.data = [];
		this.configError = "No data";
	}

	if(!this.configError) {
		// Load config module
		this.configModule = null;
		var configPath = "$:/yaisog/config/plot/" + this.configName + ".js";
		try {
			this.configModule = require(configPath);
			if(!this.configModule || !this.configModule.config) {
				this.configError = "Config module '" + this.configName + "' does not export a config function";
			}
		} catch(e) {
			this.configError = "Config module '" + this.configName + "' not found at " + configPath;
		}
	}
};

PlotWidget.prototype.renderPlot = function(container) {
	if(typeof window.Plot === "undefined") {
		this.configError = "Plot library not found";
	}

	container.innerHTML = "";

	if(this.configError) {
		var errorDiv = this.document.createElement("div");
		errorDiv.className = "tc-plot-error";
		errorDiv.style.cssText = "color: #d32f2f; padding: 10px; border: 1px solid #d32f2f; border-radius: 4px; margin: 10px 0;";
		errorDiv.textContent = this.configError;
		container.appendChild(errorDiv);
		return;
	}

	var options = {
		plotWidth: parseInt(this.plotWidth),
		plotHeight: parseInt(this.plotHeight),
		xLabel: this.xLabel,
		yLabel: this.yLabel,
		plotXLim: this.plotXLim,
		plotYLim: this.plotYLim,
		plotLegend: this.plotLegend,
		numberFormatX: this.numberFormatX,
		numberFormatY: this.numberFormatY,
		colorScheme: "Observable10"
	};

	try {

		var plotConfig = this.configModule.config(window.Plot, window.d3, this.data, options);

		// Create and append plot
		var plot = window.Plot.plot(plotConfig);
		container.appendChild(plot);

		// Add caption if provided
		if(this.plotCaption) {
			this.renderCaption(container);
		}

	} catch(e) {
		var errorDiv = this.document.createElement("div");
		errorDiv.className = "yc-plot-error";
		errorDiv.style.cssText = "color: #d32f2f; padding: 10px; border: 1px solid #d32f2f; border-radius: 4px; margin: 10px 0;";
		errorDiv.textContent = "Error rendering plot: " + e.message;
		container.appendChild(errorDiv);
	}
};

PlotWidget.prototype.renderCaption = function(container) {
	var captionDiv = this.document.createElement("div");
	captionDiv.className = "yc-plot-caption";

	// Get the type of the containing tiddler
	var tiddlerType = "text/vnd.tiddlywiki"; // default
	if(this.getVariable) {
		var currentTiddler = this.getVariable("currentTiddler");
		if(currentTiddler) {
			var tiddler = this.wiki.getTiddler(currentTiddler);
			if(tiddler && tiddler.fields.type) {
				tiddlerType = tiddler.fields.type;
			}
		}
	}

	// Wikify the caption text
	var parser = this.wiki.parseText(tiddlerType, this.plotCaption, {parseAsInline: false});
	var widgetNode = this.wiki.makeWidget(parser, {
		document: this.document,
		parentWidget: this
	});

	widgetNode.render(captionDiv, null);
	container.appendChild(captionDiv);
};

PlotWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(Object.keys(changedAttributes).length > 0) {
		this.refreshSelf();
		return true;
	}
	return false;
};

exports.plot = PlotWidget;
