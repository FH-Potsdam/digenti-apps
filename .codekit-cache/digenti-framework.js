/* ####################
    CodeKit Stuff
#################### */
/*global d3:true */
/*global mapboxgl:true */
/*global turf:true */
/*global console:true */
/*global alert:true */




/* ####################
    Opens URL in Parameter in new Tab
#################### */
function OpenInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}





/* ####################
    Bugfix to compare Arrays
    See http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript for details
#################### */

// Warn if overriding existing method
if(Array.prototype.equals) {
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array) { return false; }

    // compare lengths - can save a lot of time
    if (this.length != array.length) { return false; }

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i])) { return false; }
        }
        else if (this[i] !== array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }

    return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});




/* ####################
    Generate an unique ID to mark elements
#################### */
function generateUniqueID() {
    return 'id' + (new Date).getTime().toString() + Math.random().toString(36).substr(2, 16);
}


/* ####################
    Generate an radnom integer value
#################### */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}




/* ####################
    Transform data from HERE API
#################### */
function transformHEREgeometry(pathData) {

    for (var i=0; i<pathData.length; i++) {
        pathData[i] = pathData[i].split(",");
        for (var j=0; j<pathData[i].length; j++) {
            pathData[i][j] = parseFloat(pathData[i][j]);
        }
        var temp = pathData[i][0];
        pathData[i][0] = pathData[i][1];
        pathData[i][1] = temp;
    }

    return pathData;
}


/* ####################
    Transform JSON-Object in String and open it in new Tab
#################### */
function getGEOJSON(geojson) {
    var s = JSON.stringify(geojson);
    OpenInNewTab('data:text/plain;charset=utf-8,' + encodeURIComponent(s));
}





/* ####################
	Shortcut to remove an element from an array
#################### */
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
