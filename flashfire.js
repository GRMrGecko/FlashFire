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
	while (element.className!="flashfireBlocked")
		element = element.parentNode;
	
	var elementID = element.getAttribute("elementID");
	
	var blockedElement = elementsBlocked[elementID];
	blockedElement.allowedToLoad = true;
	
	element.parentNode.replaceChild(blockedElement, element);
	
	event.stopPropagation();
	event.preventDefault();
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
	flashfireBlockedDiv.style = element.style;
	flashfireBlockedDiv.style.width = element.offsetWidth + "px";
	flashfireBlockedDiv.style.height = element.offsetHeight + "px";
	flashfireBlockedDiv.className = "flashfireBlocked";
	flashfireBlockedDiv.onclick = unblockElement;
	
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
				flashfireHDiv.style.width = "inherit";
				flashfireTextContainerDiv.style.display = "none";
			}
		} else {
			setTimeout(changeSize, 100);
		}
	};
	changeSize();
}