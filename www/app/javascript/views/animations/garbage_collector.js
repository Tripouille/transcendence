export function addTimeout(callback, time) {
	const id = setTimeout(callback, time);
	window.timeouts.push(id);
	return (id);
}

export function addInterval(callback, time) {
	const id = setInterval(callback, time);
	window.intervals.push(id);
	return (id);
}

export function cleanTimeout(id) {
    var index = window.timeouts.indexOf(id);
    if (index >= 0)
        window.timeouts.splice(index, 1);
	clearTimeout(id);
}

export function cleanInterval(id) {
    var index = window.intervals.indexOf(id);
    if (index >= 0)
        window.intervals.splice(index, 1);
	clearInterval(id);
}

export function clearTimeoutsIntervals() {
	for (let i in window.timeouts)
		clearTimeout(window.timeouts[i]);
	for (let i in window.intervals)
		clearInterval(window.intervals[i]);
	window.timeouts = new Array();
	window.intervals = new Array();
}