$(document).ready(function() {
	restore_options();
	f_restore_options();
	$('#save-options').click(function() {
		save_options();
	});

	$('#f-save-options').click(function(){
		f_save_options();
	});
});

// Save function options to localStorage.
function f_save_options(){
	var function_rules = document.getElementById("edit-functions");
	try{
		eval(function_rules.value);
	}catch(e){
		alert(e);
	}
	localStorage["ttt_function_rules"] = function_rules.value;
};
	

// Saves options to localStorage.
function save_options() {
	var rules_field = document.getElementById("edit-rules");

	// Validate the input
	var err = [];
	var rules = "";
	var linenum = 0;
	rules = rules_field.value.split("\n");
	for (key in rules) {
		linenum++;
		var thisrule = rules[key].split(",");
		if (!thisrule[1]) {
			err.push("Missing a valid url in line " + linenum + ". Please correct the problem and try saving again."); 
			break;
		}

		var op = thisrule[0].trim().toLowerCase();

		if (op != "prefix" && op != "revert" && op != "rename" && op != "suffix" && op!= "wrap" ) {
			err.push("Missing a valid operation in line " + linenum + ". Please correct the problem and try saving again.");
		}
	}

	// Process the results and give the user an update
	if (err.length <= 0) {
		// No errors, save the rules
		localStorage["ttt_rules"] = rules_field.value;

		// Update status to let user know options were saved.
		var status = document.getElementById("status-success");
		status.innerHTML = "Rules Saved.";
		status.style.display = "block";
		document.getElementById("status-error").style.display = "none";
		setTimeout(function() {
			// Wait before hiding default and status messages
			document.getElementById("status-defaults").style.display = "none";
			status.innerHTML = "";
			status.style.display = "none";
		}, 4000);
	}
	else {
		// Show the error message
		var status = document.getElementById("status-error");
		status.innerHTML = err.join("<br />");
		status.style.display = "block";
	}
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	var rules_value = localStorage["ttt_rules"];
	var rules_field = document.getElementById("edit-rules");
	if (rules_value) {
		rules_field.value = rules_value;
	}
	else {
		// Preset a default if the value isn't set yet
		rules_field.value = "prefix, *.local, LOCAL";
		document.getElementById("status-defaults").style.display = "block";
	}
}

function f_restore_options(){
	var rules_value = localStorage["ttt_function_rules"];
	var rules_field = document.getElementById("edit-functions");
	if(rules_value){
		rules_field.value = rules_value;
	}
}
