
console.log("search roll 20");
$.ajax({
	url: "https://app.roll20.net/image_library/marketplace_purchases_index"
}).done(readCatalog);

$("#imagedialog .searchbox .keywords").on('input', function() {
	console.log("search: box:" + $(this).val());
	if($(this).val().length < 2) {
		$("#marketplaceresults.searchRoll20Root").remove();
	} else {
		chrome.runtime.sendMessage({action: "search", query: $(this).val()}, function(response) {
			$("#marketplaceresults.searchRoll20Root").remove();
			let $searchResultsDiv = $('<div id="marketplaceresults" class="searchRoll20Root"></div>');
			let $searchResultsList = $('<ol class="dd-list"></ol>');
			let $searchResultsFolder = $('<li class="dd-item dd-folder"></li>');
			let $searchResultsCollapseButton = $('<button class="dd-unsortable" data-action="collapse" type="button">Collapse</button>');
			let $searchResultsExpandButton = $('<button class="dd-unsortable" data-action="expand" style="display: none;" type="button">Expand</button>');
			let $searchResultsTitle = $('<div class="dd-content"><div class="folder-title">Name Search</div></div>');
			let $searchResultsFolderList = $('<ol class="dd-list"></ol>');
			let $searchResultsSubFolder = $('<li class="dd-item dd-folder tokenset" data-id="0"></li>');
			$searchResultsSubFolder.append($('<button class="dd-unsortable" data-action="collapse" type="button">Collapse</button>'));
			$searchResultsSubFolder.append($('<button class="dd-unsortable" data-action="expand" style="display: none;" type="button">Expand</button>'));
			$searchResultsSubFolder.append('<div class="dd-content"><div class="folder-title">Search Results</div></div>');
			let $searchResultsTokenList = $('<ol class="dd-list"></ol>');

			Object.entries(response.results).forEach(([id, token]) => {
				//console.log("search: token: " + token.name);
				let $searchResultsToken = $('<li class="dd-item library-item draggableresult ui-draggable" data-fullsizeurl="' + token.fullsize_url + '" data-itemid="' + id + '"></li>');
				let $searchResultsTokenContent = $('<div class="dd-content"></div>');
				let $searchResultsTokenImage = $('<div class="token"><img src="' + token.image_url + '" draggable="false"/></div>');
				let $searchResultsTokenName = $('<div class="name"><div class="namecontainer"><strong>' + token.name + '</strong></div></div>');
				$searchResultsTokenContent.append($searchResultsTokenImage);
				$searchResultsTokenContent.append($searchResultsTokenName);
				$searchResultsToken.append($searchResultsTokenContent);
				$searchResultsTokenList.append($searchResultsToken);
			});

			$searchResultsSubFolder.append($searchResultsTokenList);
			$searchResultsFolder.append($searchResultsCollapseButton);
			$searchResultsFolder.append($searchResultsExpandButton);
			$searchResultsFolder.append($searchResultsTitle);
			$searchResultsFolderList.append($searchResultsSubFolder);
			$searchResultsFolder.append($searchResultsFolderList);
			$searchResultsList.append($searchResultsFolder);
			$searchResultsDiv.append($searchResultsList);
			$("#librarysearchroot").prepend($searchResultsDiv);
			console.log("search: done!");
		});
	}
});
//urls: ['*://app.roll20.net/*'],
//TODO Cache user library
//TODO do I need cookies?


function readCatalog(data) {
	console.log("search: readCatalog");
	let catalog = JSON.parse(data);
	console.log(Object.keys(Object.values(catalog)[0])[0]);
	let packId = Object.keys(Object.values(catalog)[0])[0];
	console.log("search: packid: " + packId);

	Object.values(catalog).forEach(function(packInfo) {
		Object.keys(packInfo).forEach(function(packId){
			chrome.runtime.sendMessage({action: "havepack", packId: packId}, function(response) {
				//console.log("search: response: " + response.success);
				if(!response.success) {
					console.log("search: no pack");
					$.ajax({
						url: "https://app.roll20.net/image_library/fetchsetresults/" + packId
					}).done(function(data){
						let pack = JSON.parse(data);
						let request = {};
						request[packId] = pack;
						chrome.runtime.sendMessage({action: "savepack", pack: request}, function(response) {
							console.log("search: savepack: " + response.success);
						});
					});
				}
			});
		});
	});
}
