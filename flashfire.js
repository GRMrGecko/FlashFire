document.addEventListener("beforeload", handleBeforeLoadEvent, true);
var elementsBlocked = new Array();

function handleBeforeLoadEvent(event) {
	const element = event.target;
	if (element instanceof HTMLEmbedElement || element instanceof HTMLObjectElement) {
		if (element.allowedToLoad)
			return;
		
		if (element instanceof HTMLEmbedElement) {
			var source = element.getAttribute("src");
			if (!source.match("swf"))
				return;
		} else if (element instanceof HTMLObjectElement) {
			var foundFile;
			var elementNodes = element.childNodes;
			for (i=0; i<elementNodes.length; i++) {
				if (elementNodes[i].nodeName=="PARAM" && elementNodes[i].name.match("movie")) {
					foundFile = elementNodes[i].value.match("swf");
					if (!foundFile) {
						var type = element.getAttribute("type");
						if (type!=null && (!type.match("flash") && !type.match("shockwave") && !type.match("futuresplash")))
							return;
					}
				}
			}
		}
		
		//console.log(safari.self.tab.canLoad(event, {name: "getSettings", data: ""}));
		
		event.preventDefault();
		
		blockElement(element);
	}
}

function unblockElement(event) {
	var element = event.target;
	if (element.className=="action" || element.className=="flashfireContextMenu" || element.className=="flashfireMenuItem" || element.className=="flashfireMenuSeparator")
		return;
	while (element.className!="flashfireBlocked")
		element = element.parentNode;
	
	var elementID = element.getAttribute("elementID");
	
	var blockedElement = elementsBlocked[elementID];
	blockedElement.allowedToLoad = true;
	
	element.parentNode.replaceChild(blockedElement, element);
	
	event.stopPropagation();
	event.preventDefault();
}

function unblockElementById(id) {
	var element = document.getElementById("flasfire" + id);
	if (element!=null) {
		if (element.allowedToLoad)
			return;
		var blockedElement = elementsBlocked[id];
		blockedElement.allowedToLoad = true;

		element.parentNode.replaceChild(blockedElement, element);

		event.stopPropagation();
		event.preventDefault();
	}
}

function unblockAllElements() {
	for (i=0; i<elementsBlocked.length; i++) {
		unblockElementById(i);
	}
}

function hideElementById(id) {
	var element = document.getElementById("flasfire" + id);
	elementsBlocked[id].allowedToLoad = true;
	element.parentNode.removeChild(element);
}

function displayContextMenu(event) {
	var element = event.target;
	var left = event.pageX;
	var top = event.pageY;
	console.log(event);
	while (element.className!="flashfireBlocked")
		element = element.parentNode;
	
	var elementID = element.getAttribute("elementID");
	
	var menuElement = document.createElement("menu");
	menuElement.className = "flashfireContextMenu";
	menuElement.id = "flashfireMenu" + elementID;
	menuElement.style.left = left + "px !important";
	menuElement.style.top = top + "px !important";
	
	var loadElement = document.createElement("li");
	loadElement.className = "flashfireMenuItem";
	loadElement.innerHTML = "Load Flash";
	loadElement.onclick = function() {unblockElementById(elementID);}
	menuElement.appendChild(loadElement);
	
	if (elementsBlocked.length>1) {
		var loadALlElement = document.createElement("li");
		loadALlElement.className = "flashfireMenuItem";
		loadALlElement.innerHTML = "Load All Flash on this Page";
		loadALlElement.onclick = function() {unblockAllElements();}
		menuElement.appendChild(loadALlElement);
	}
	
	var hideElement = document.createElement("li");
	hideElement.className = "flashfireMenuItem";
	hideElement.innerHTML = "Hide Flash";
	hideElement.onclick = function() {hideElementById(elementID);}
	menuElement.appendChild(hideElement);
	
	var separatorElement = document.createElement("li");
	separatorElement.className = "flashfireMenuSeparator";
	menuElement.appendChild(separatorElement);
	
	var autoLoadElement = document.createElement("li");
	autoLoadElement.className = "flashfireMenuItem";
	autoLoadElement.innerHTML = "Automatically Load Flash on &quot;" + window.location.host + "&quot;";
	menuElement.appendChild(autoLoadElement);
	
	document.body.appendChild(menuElement);
	
	var closeContentMenu = function(event) {
		var removeMenuElement = function() {
			document.body.removeChild(menuElement);
		}
		document.getElementsByTagName("body")[0].removeEventListener("mousedown", closeContentMenu, false);
		menuElement.style.opacity = "0 !important";
		setTimeout(removeMenuElement, 150);
	}
	document.body.addEventListener("mousedown", closeContentMenu, false);
	
	var changePostition = function() {
		if (menuElement.offsetWidth>0 && menuElement.offsetWidth>0) {
			if ((left+menuElement.offsetWidth+20)>=window.innerWidth) {
				menuElement.style.left = left-menuElement.offsetWidth-10 + "px !important";
				document.body.removeChild(menuElement);
				document.body.appendChild(menuElement);
			}
			
			if ((top+menuElement.offsetHeight+30)>=window.innerHeight) {
				menuElement.style.top = top-menuElement.offsetHeight-10 + "px !important";
				document.body.removeChild(menuElement);
				document.body.appendChild(menuElement);
			}
		} else {
			setTimeout(changePostition, 100);
		}
	};
	changePostition();
	return false;
}

function blockElement(element) {
	if (element.getAttribute("elementID")!=null)
		return;
	var elementID = elementsBlocked.length;
	element.setAttribute("elementID", elementID);
	elementsBlocked[elementID] = element;
	
	var text = "Flash";
	
	var flashfireBlockedDiv = document.createElement("div");
	flashfireBlockedDiv.setAttribute("elementID", elementID);
	flashfireBlockedDiv.id = "flasfire" + elementID;
	flashfireBlockedDiv.style = element.style;
	flashfireBlockedDiv.style.width = element.offsetWidth + "px";
	flashfireBlockedDiv.style.height = element.offsetHeight + "px";
	flashfireBlockedDiv.className = "flashfireBlocked";
	flashfireBlockedDiv.onclick = unblockElement;
	flashfireBlockedDiv.oncontextmenu = displayContextMenu;
	
	var flashfireContainerDiv = document.createElement("div");
	flashfireContainerDiv.className = "container";
	flashfireBlockedDiv.appendChild(flashfireContainerDiv);
	
	var flashfireVDiv = document.createElement("div");
	flashfireVDiv.className = "vText";
	flashfireContainerDiv.appendChild(flashfireVDiv);
	var flashfireHDiv = document.createElement("div");
	flashfireHDiv.className = "hText";
	flashfireVDiv.appendChild(flashfireHDiv);
	
	var flashfireTextContainerDiv = document.createElement("div");
	flashfireTextContainerDiv.className = "textContainer";
	flashfireHDiv.appendChild(flashfireTextContainerDiv);
	
	var flashfireTextInsetDiv = document.createElement("div");
	flashfireTextInsetDiv.className = "textInset";
	flashfireTextInsetDiv.innerHTML = text;
	flashfireTextContainerDiv.appendChild(flashfireTextInsetDiv);
	var flashfireTextDiv = document.createElement("div");
	flashfireTextDiv.className = "text";
	flashfireTextDiv.innerHTML = text;
	flashfireTextContainerDiv.appendChild(flashfireTextDiv);
	
	var flashfireActionDiv = document.createElement("div");
	flashfireActionDiv.className = "action";
	flashfireActionDiv.onclick = displayContextMenu;
	flashfireContainerDiv.appendChild(flashfireActionDiv);
	
	setTimeout(function(){element.parentNode.replaceChild(flashfireBlockedDiv, element);}, 5);
	var changeSize = function() {
		if (flashfireBlockedDiv.offsetWidth>0 && flashfireTextDiv.offsetWidth>0 && flashfireBlockedDiv.offsetHeight>0 && flashfireTextDiv.offsetHeight>0) {
			if ((flashfireBlockedDiv.offsetWidth - 4) < flashfireTextDiv.offsetWidth || (flashfireBlockedDiv.offsetHeight - 4) < flashfireTextDiv.offsetHeight) {
				flashfireTextContainerDiv.className += " mini";
			}
			
			if ((flashfireBlockedDiv.offsetWidth - 4) < flashfireTextDiv.offsetWidth) {
				flashfireTextContainerDiv.className += " rotate";
				flashfireHDiv.style.width = 17;
			}
			if ((flashfireBlockedDiv.offsetWidth - 2) <= flashfireHDiv.offsetWidth || (flashfireBlockedDiv.offsetHeight - 17) <= flashfireTextDiv.offsetHeight) {
				flashfireTextContainerDiv.style.display = "none";
				flashfireHDiv.style.width = "inherit";
			}
			if ((flashfireBlockedDiv.offsetWidth - 21) <= flashfireActionDiv.offsetWidth || (flashfireBlockedDiv.offsetHeight - 21) <= flashfireActionDiv.offsetHeight) {
				flashfireActionDiv.style.display = "none";
			}
		} else {
			setTimeout(changeSize, 100);
		}
	};
	changeSize();
}