
console.log("background: initialize");
chrome.storage.local.getBytesInUse(null, function(bytesInUse) {
	console.log("background: bytesInUse: " + bytesInUse);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	console.log("background: onMessage");
	if(request.action === "havepack") {
		console.log("background: havePack?")
		havePack(request.packId, sendResponse);
	} else if(request.action === "savepack") {
		console.log("background: savepack");
		savePack(request.pack, sendResponse);
	} else if (request.action === "search") {
		console.log("background: search: " + request.query);
		searchPacks(request.query, sendResponse);
	} else {
		sendResponse({success: true});
	}
	return true;
});

function havePack(packId, sendResponse) {
	chrome.storage.local.get(packId, function(result){
		console.log("background: storage:" + Object.keys(result));
		if(Object.keys(result).length == 0) {
			console.log("background: no pack");
			sendResponse({success: false});
		} else {
			console.log("background: have pack");
			sendResponse({success: true});
		}
	});
}

function savePack(pack, sendResponse) {
	console.log("background: save pack: " + pack);
	chrome.storage.local.set(pack, function() {
		sendResponse({success: true});
	})
}

function searchPacks(query, sendResponse) {
	chrome.storage.local.get(null, function(packs) {
		let regEx = new RegExp(query, 'i')
		let tokens = {};
		Object.entries(packs).forEach(([packId, pack]) => {
			//console.log("background: search: packId: " + packId);
			Object.entries(pack).forEach(([id, token]) => {
				//console.log("background: search: name: " + token.name);
				if(!!token.name && token.name.match(regEx)) {
					//console.log("background: search: found!");
					tokens[id] = token;
				}
			});
		});
		sendResponse({success: true, results: tokens});
	});
}