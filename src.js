 
var width = $('.svg_container').width(),
height = width/2,
base_point_radius = 2,
base_point_opacity = .6,
translation = {
  x: width/2,
  y: height/2,
  reset: function() { translation.x = width/2; translation.y = height/2; }
},
zoomed;

var proj      = d3.geo.eckert4()
              .scale( (width - 50) / 5.33) // eckert4 map width ~= scale * 5.33...
              .translate([0,0]),
path      = d3.geo.path()
              .projection(proj)
              .pointRadius(base_point_radius),
graticule = d3.geo.graticule();

var drag      = d3.behavior.drag()
              .on('drag', dragmove);

var svg         = d3.select(".svg_container").append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(drag),
bg          = svg.append("rect").attr("class", "background")
                  .attr("width", width)
                  .attr("height", height)
                  .on("click", click),
translator  = svg.append("g").attr("class","translator")
                  .attr("transform", "translate(" + translation.x + "," + translation.y + ")")
map         = translator.append("g").attr("class","map"),
ocean       = map.append("path").attr("class", "ocean noclicks"),
countries   = map.append("g")   .attr("class","countries"),
grat        = map.append("path").attr("class", "graticule noclicks"),
point_group = map.append("g")   .attr("class","points noclicks");

var points = []

queue()
.defer(d3.json, "data/world-110m.json")
.await(ready);

function ready(error, world) {
ocean.datum(graticule.outline).attr("d", path);
grat.datum(graticule).attr("d", path);

countries
.selectAll("path")
  .data(topojson.object(world, world.objects.countries).geometries)
.enter().append("path")
  .attr("class", "country")
  .attr("d", path)
  .on("click", click);
}

function plot_points(){ 
var pasted = $('#pasted').val(),
  rows;

if( pasted.match(/[^0-9\-\.\,\t\s\r\n]/) ) plotting_error();
else if (pasted.indexOf(",")  >= 0) {
$('#inputs').removeClass('error').addClass('success')
plotPoints(d3.csv.parseRows(pasted));
}
else if (pasted.indexOf("\t") >= 0) {
$('#inputs').removeClass('error').addClass('success')
plotPoints(d3.tsv.parseRows(pasted));
}
else plotting_error();

function plotting_error() {
$('#inputs').removeClass('success').addClass('error')
$('#pasted').val("Failed to parse coordinates...")
}

function plotPoints(rows) {
points = [];
rows.forEach( function(pt) {
  pt[0] = +pt[0]
  pt[1] = +pt[1]

  points.push({
    geometry: { type: 'Point',
                coordinates: pt },
    type: 'Feature'
    // ,properties: { }
  });
})
}
refresh();
} 

// rotate map on drag, or move 'viewport' if zoomed in
function dragmove() {
var Δ = { 
      x: d3.event.dx,
      y: d3.event.dy  
    },
    scaling = 0.15;

if (zoomed) {
  translation.x += Δ.x;
  translation.y += Δ.y;
  translator.attr("transform", "translate(" + translation.x + "," + translation.y + ")")    
}

else {
var start = { 
      lon: proj.rotate()[0], 
      lat: proj.rotate()[1]
    },
    end = { 
      lon: start.lon + Δ.x * scaling, 
      lat: start.lat - Δ.y * scaling 
    };
// use start.lat instead of end.lat to prevent vertical movement
proj.rotate([end.lon,start.lat])
}
refresh();
}

// from http://bl.ocks.org/mbostock/2206590
function click(d) {
var x = 0,
  y = 0,
  k = 1;
if (d && zoomed !== d) {
var centroid = path.centroid(d);
x = -centroid[0];
y = -centroid[1];
k = 4;
zoomed = d;
} else {
zoomed = null;
}

countries.selectAll("path")
  .classed("active", zoomed && function(d) { return d === zoomed; });

translation.reset();
translator.transition()
.duration(700)
.attr("transform", "translate(" + translation.x + "," + translation.y + ")")

map.transition()
.duration(700)
.attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")

countries.transition()
.duration(700)
.style("stroke-width", .5 / k + "px");

grat.transition()
.duration(700)
.style("stroke-width", 1 / k + "px");

path.pointRadius(base_point_radius/k)
point_group.selectAll(".point").transition().duration(700).attr("d",path)
}

// rescale map on resize
// $(window).resize(function() {
//   var new_width = $('.svg_container').width(),
//       new_height = new_width/2;
//   svg.attr("width", new_width)
//      .attr("height", new_height);
//   map.attr("transform","scale(" + new_width/width + ")")
// });

$("#point_size_slider").change(function() {
var k = zoomed ? 4 : 1;
base_point_radius = $(this).val();
path.pointRadius(base_point_radius/k)
point_group.selectAll(".point").attr("d",path)
})

$("#point_opacity_slider").change(function() {
base_point_opacity = $(this).val();
point_group.selectAll(".point").style("opacity",base_point_opacity)
})

function refresh() {
var pts = point_group.selectAll(".point").data(points);
  pts.exit().remove();
  pts.enter().append("path").attr("class", "point");
  pts.attr("d",path);
map.selectAll(".ocean").attr("d",path)
map.selectAll(".land").attr("d",path)
map.selectAll(".graticule").attr("d",path)
map.selectAll(".country").attr("d",path)
}