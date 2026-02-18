/*\
title: $:/core/modules/filters/get.js
type: application/javascript
module-type: filteroperator

Filter operator for replacing tiddler titles by the value of the field specified in the operand.

\*/

"use strict";

/*
Export our filter function
*/
exports.get = function(source,operator,options) {
	options = options || {};
	var results = [],
		wiki = options.wiki || $tw.wiki;
	source(function(tiddler,title) {
		if(tiddler) {
			var value;
			if(tiddler.hasField("_is_skinny") && operator.operand === "text" && wiki) {
				value = wiki.getTiddlerText(title,"");
				if(value === null) {
					return;
				}
			} else {
				value = tiddler.getFieldString(operator.operand);
			}
			if(value) {
				results.push(value);
			}
		}
	});
	return results;
};
