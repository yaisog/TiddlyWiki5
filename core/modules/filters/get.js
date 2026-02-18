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
	const results = [];
	const fieldName = operator.operand;
	source(function(tiddler,title) {
		if(!tiddler) return;
		
		let value;
		// Check if we need to handle lazy loading for skinny tiddlers
		if(fieldName === "text" && tiddler.hasField("_is_skinny")) {
			const wiki = options?.wiki ?? $tw.wiki;
			value = wiki.getTiddlerText(title,"");
			// Skip this tiddler if it's being lazily loaded (returns null)
			if(value === null) return;
		} else {
			value = tiddler.getFieldString(fieldName);
		}
		if(value) {
			results.push(value);
		}
	});
	return results;
};
