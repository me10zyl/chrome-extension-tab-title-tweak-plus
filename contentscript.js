chrome.extension.sendRequest({method: "get_rules"}, function(response) {
  if (response.rules == "") {
	// No rules, don't do anything!
    return;
  }
  
  var function_rules = response.function_rules;

  eval(function_rules);

  var rules = "";
  var match = [];
  rules = response.rules.split("\n");

  // Loop through all of the rules and add the specific rule if there is a match
  // If multiple rules match, we will take action on the last rule matched.
  // This is so that we can override previous rules.
  for (key in rules) {
    var thisrule = rules[key].split(",");
    var url_regex = thisrule[1].trim();
    url_regex = url_regex.replace(/\*/g, "[^ ]+");
    if (url_regex.indexOf("file://") == -1 && url_regex.indexOf("http") == -1) {
      url_regex = "^http[s]?://" + url_regex;
    }
    if (window.location.pathname == "/") {
      url_regex = url_regex + "[/]";
    }
    regexp = new RegExp(url_regex);
    if (regexp.test(window.location.href)) {
      // Set the match even if it's a revert operation
      match = thisrule;
    }
  }

  // If there is a match, process it
  if (match[0]) {
    var operation = match[0].trim().toLowerCase();
    if (operation != "revert") {
      var textval = "";
      if (typeof match[2] != "undefined") {
        textval = match[2].trim();
      }

	  function changeTitle(title){
			var target = document.querySelector("head > title");
			var newTitle = document.createElement("title");
			var funcs = /\$\{(.+?)\}/g;
			var arrs = null;
			do{
				 arrs = funcs.exec(title);
				 if(arrs != null){
					 var value = eval(arrs[1]);
					 title = title.replace('${'+arrs[1]+'}', value);
				 }
			}while(arrs != null);

			newTitle.innerHTML = title;
			target.parentElement.insertBefore(newTitle, target);
		    target.parentElement.removeChild(target);
	  }

	  function changeIcon(){
			var target = document.querySelector("link[rel*='icon']");
			target.parentElement.removeChild(target);
	  }

	
	  function doModify(operation){
			  if (operation == "rename") {
				changeTitle(textval);
			  }

			  if (operation == "prefix") {
				changeTitle(textval + " " + document.title);
			  }

			  if (operation == "suffix") {
				changeTitle(document.title + " " + textval);
			  }

			  if(operation == "wrap") {
				changeTitle(textval.replace("{}", document.title));
			  }

			  bindEvent();
	  }

	  doModify(operation);

	  function titleModified(){
		  doModify(operation);
	  }

	  function bindEvent(){
		 var titleEl = document.getElementsByTagName("title")[0];
			var docEl = document.documentElement;

			if (docEl && docEl.addEventListener) {
				docEl.addEventListener("DOMSubtreeModified", function(evt) {
					var t = evt.target;
					if (t === titleEl || (t.parentNode && t.parentNode === titleEl)) {
						titleModified();
					}
				}, false);
			} else {
				document.onpropertychange = function() {
					if (window.event.propertyName == "title") {
						titleModified();
					}
				};
			}
	  }

	  // Tell the background page that there is a match.
	  // This will make the icon appear in the address bar.
      chrome.extension.sendRequest({method: "is_active"}, function(response) {});
    }
  }
});
