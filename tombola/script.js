
var last,
	run = 0,
	tosses = 0,
	required_run_length,
	extras = 0,
	version = "1",
	won = false; 


function add_listeners() {
	console.log("script loads")
	document.getElementById("finish").addEventListener(
		"click",
		run_till_won,
		{once: true}
	)
}

function more_extras(face) {
	return (face == "T") && (
		((version == "1") && (run == required_run_length)) ||
		((version == "2") && (run == required_run_length + extras))
	)
}

function has_won(face) {
	return (face == "H") && (run == required_run_length + extras)
}

function too_far_gone() {
	return extras >= required_run_length
}

function report_tosses() {
	console.log("tosses", tosses)
	document.getElementById("coin_tosses").innerText = tosses
}

function report_extras() {
	console.log("extras", extras)
	document.getElementById("extras_needed_for_run").innerText = extras
}

function report_win() {
	console.log(tosses, run, last, extras, won)
	
	report_tosses()
	
	let game_version = (version === "1") ? "fully mental" : "less mental";
	
	let win_entry = document.createElement("li")
	
	message = too_far_gone() && 
		`${game_version} game too far gone after ${tosses} coin tosses. Many tosses remain.` ||
		`${game_version} game won in ${tosses} coin tosses`
		
	win_entry.innerText = message
	
	document.getElementById("wins").appendChild(win_entry)
	
	let reset_button = document.createElement("input")
	reset_button.type = "button"
	reset_button.id = "reset"
	reset_button.value = "reset"
	reset_button.addEventListener("click", reset, {once: true})
	
	document.body.appendChild(reset_button)
}

function reset(e) {
	last = undefined,
	run = 0,
	tosses = 0,
	extras = 0,
	won = false;
	report_tosses()
	report_extras()
	add_listeners()
	this.remove()
}

function toss() {
	if (tosses % 1000 == 0) {
		console.log(tosses, run, last, extras, won)
		report_tosses()
	}
	tosses = tosses + 1;
	
	let face = (Math.random() < 0.5) && "H" || "T"
	
	if (face === last) {
		run = run + 1;
	} else {
		last = face;
		run = 1;
	}
	
	if (more_extras(face)) {
		console.log(tosses, run, last, extras, won)

		extras = extras + 1;
		report_extras();
		
		run = 0;
		last = undefined;
	}
	
	won = has_won(face) || too_far_gone()
	
	if (won) report_win()
}

function run_till_won(_e) {
	required_run_length = parseInt(document.getElementById("run_length").value)
	version = document.getElementById("version").value.toString()
	
	console.log("yarr")
	while (!won) {
		toss()
	}
}


add_listeners()