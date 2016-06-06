/*
 # morphpath.js
 Morph and simplify SVG paths.
 Requires polymorph.js
*/
var morphpath;
morphpath = {
  version: '0.1'
};

/*
    TO DO:
    - Calculate median angle, not the angle between start and end points

/*
 ## linify
 Convert the input path to a line with:
 - Same amount of nodes (for proper transitions with d3)
 - Keeping path length
 - If not defined, keep same angle between first and end points
*/
morphpath.linify = function(path, angle) {

    var length = this.getPathLength(path);
        points = path.slice(1).split(/L/i),
        pStart = points[0].split(/,/i),
        pEnd = points[points.length-1].split(",");

    var p1 = {
        x: parseInt(pStart[0],10),
        y: parseInt(pStart[1],10)
    };

    var p2 = {
        x: parseInt(pEnd[0],10),
        y: parseInt(pEnd[1],10)
    };

    // Calculate angle, if none is defined
    if (angle == null) {
        angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        // angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x)
        // angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

    // Convert to radians
    } else {
        angle = angle * Math.PI / 180;
    }

    // Calculate line points from the width and angle
    var l1 = p1,
        l2 = {
                x: l1.x + Math.cos(angle) * length,
                y: l1.y + Math.sin(angle) * length
            };


    var line = "M"+l1.x+","+l1.y+" L"+l2.x+","+l2.y;

    // console.log("length: " + length);
    // console.log("line: " + line);
    // console.log("angle: " + angle);
    // console.log("line length: " + getPathLength(polymorph.transpose(path,line)));

    return polymorph.transpose(path,line);
}

morphpath.getPathLength = function(it) {
    var line, length;
    line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', it);
    //   svg.appendChild(line);
    length = line.getTotalLength();
    //   line.remove();
    return length;
};
