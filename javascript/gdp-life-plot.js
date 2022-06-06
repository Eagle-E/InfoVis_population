

function create_xAxis(width, min_x, max_x, mobile)
{
     //Set the new x axis range
     var xScale = d3.scale.log()
        .range([0, width])
        .domain([min_x, max_x]);

    //Set new x-axis
    var xAxis = d3.svg.axis()
        .orient("bottom")
        .ticks(2)
        .tickFormat(function (d) {
            return xScale.tickFormat((mobile ? 4 : 8),function(d) { 
                var prefix = d3.formatPrefix(d); 
                return "$" + prefix.scale(d) + prefix.symbol;
            })(d);
        })	
        .scale(xScale);	
    return {
        "xScale": xScale,
        "xAxis" : xAxis
    }
}


function create_yAxis(height, min_y, max_y)
{
     //Set the new y axis range
     var yScale = d3.scale.linear()
        .range([height,0])
        .domain([min_y, max_y])
        .nice();

    var yAxis = d3.svg.axis()
        .orient("left")
        .ticks(6)  //Set rough # of ticks
        .scale(yScale);	

    return {
        "yScale": yScale,
        "yAxis" : yAxis
    }
}





function place_circles(data, populationData, selected_year, selected_countries)
{
    circleScale = d3.scale.sqrt()
        .range([mobile ? 1 : 2, mobile ? 2 : 4])
        .domain(d3.extent(data, function(d) { return d.GDP; }));

    chosenScale = d3.scale.sqrt()
        .range([mobile ? 1 : 2, mobile ? 4 : 8])
        .domain(d3.extent(data, function(d) { return d.GDP; }));

    /*
    Color scheme of the countries based on population
                GREEN            |          BLUE             |            RED
    500k  1mil  2.5mil  5mil  10mil  25mil  50mil  75mil  100mil 325mil 550mil 775mil 1000mil
    */
    colorRanges = [
        500000, 1000000, 2500000, 5000000, 10000000,    // GREEN 
        25000000, 50000000, 75000000, 100000000,        // BLUE
        325000000, 550000000, 775000000, 1000000000     // RED
    ];

    // The final colors are a slightly modified version of the generated colors in the next line 
    colorsG = ['#a0d69b', '#74c476', '#41ab5d', '#238b45', '#005a32'];
    colorsB = ['#bdd7e7', '#6baed6', '#3182bd', '#08519c'];
    colorsR = ['#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d']
    colors = [...colorsG, ...colorsB, ...colorsR];

    var colorScale = d3.scale.linear()
        .domain(colorRanges)
        .range(colors);

    //Place the country circles
    circleGroup.selectAll(".countries")
        .data(data.sort(function(a,b) { return b.GDP > a.GDP; })) //Sort so the biggest circles are below
        .enter().append("circle")
            .attr("class", function(d,i) { return "countries " + d.CountryCode; })
            .style("opacity", opacityCircles)
            //.style("fill", function(d) {return color(d.Region);})
            .attr("cx", function(d) {return xScale(d.GDP_perCapita);})
            .attr("cy", function(d) {return yScale(d.lifeExpectancy);})
            .attr("r", function(d) {return circleScale(d.GDP);})
            .attr("fill", function (d) {
                let countryName = d.Country;
                if (countryName in populationData)
                {
                    console.log(selected_year)
                    let population = populationData[String(countryName)][String(selected_year)]["total"] * 1000
                    return colorScale(population || 0);
                }
                else{
                    console.log(countryName)
                }
                });
        circleGroup.selectAll(".countries")
            .filter(function(d) {       
                return d.Country == selected_countries})
            .transition()
            .style("opacity", opacityCircles)
            .style("fill", "green")
            .attr("r", function(d) {return chosenScale(d.GDP);});
 }


function place_labels(data)
{
    var voronoi = d3.geom.voronoi()
        .x(function(d) { return xScale(d.GDP_perCapita); })
        .y(function(d) { return yScale(d.lifeExpectancy); })
            .clipExtent([[0, 0], [width, height]]);

        
    //Create the Voronoi diagram
    voronoiGroup.selectAll("path")
        .data(voronoi(data)) //Use vononoi() with your dataset inside
        .enter().append("path")
        .attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
        .datum(function(d, i) { return d.point; })
        .attr("class", function(d,i) { return "voronoi " + d.CountryCode; }) //Give each cell a unique class where the unique part corresponds to the circle classes
        //.style("stroke", "#2074A0") //I use this to look at how the cells are dispersed as a check
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", showTooltip)
        .on("mouseout",  removeTooltip);
}


///////////////////////////////////////////////////////////////////////////
/////////////////// Hover functions of the circles ////////////////////////
///////////////////////////////////////////////////////////////////////////

//Hide the tooltip when the mouse moves away
function removeTooltip (d, i) {

	//Save the chosen circle (so not the voronoi)
	var element = d3.selectAll(".countries."+d.CountryCode);
		
	//Fade out the bubble again
	element.style("opacity", 0.7);
	
	//Hide tooltip
	$('.popover').each(function() {
		$(this).remove();
	}); 
  
	//Fade out guide lines, then remove them
	d3.selectAll(".guide")
		.transition().duration(200)
		.style("opacity",  0)
		.remove();
		
}//function removeTooltip

//Show the tooltip on the hovered over slice
function showTooltip(d, i) {

	//Save the chosen circle (so not the voronoi)
	var element = d3.selectAll(".countries."+d.CountryCode);
	
	//Define and show the tooltip
	$(element).popover({
		placement: 'auto top',
		container: '#chart',
		trigger: 'manual',
		html : true,
		content: function() { 
			return "<span style='font-size: 11px; text-align: center;'>" + d.Country + "</span>"; }
	});
	$(element).popover('show');

	//Make chosen circle more visible
	element.style("opacity", 1);
	
	//Append lines to bubbles that will be used to show the precise data points
	//vertical line
	wrapper.append("g")
		.attr("class", "guide")
		.append("line")
			.attr("x1", element.attr("cx"))
			.attr("x2", element.attr("cx"))
			.attr("y1", +element.attr("cy"))
			.attr("y2", (height))
			.style("stroke", element.style("fill"))
			.style("opacity",  0)
			.style("pointer-events", "none")
			.transition().duration(200)
			.style("opacity", 0.5);
	//horizontal line
	wrapper.append("g")
		.attr("class", "guide")
		.append("line")
			.attr("x1", +element.attr("cx"))
			.attr("x2", 0)
			.attr("y1", element.attr("cy"))
			.attr("y2", element.attr("cy"))
			.style("stroke", element.style("fill"))
			.style("opacity",  0)
			.style("pointer-events", "none")
			.transition().duration(200)
			.style("opacity", 0.5);
					
}

function selectLegend(opacity, color) {
	return function(d, i) {
       
		var chosen = color.domain()[i];
			
		wrapper.selectAll(".countries")
			.filter(function(d) { return d.Region != chosen; })
			.transition()
			.style("opacity", opacity);
	  };
}


function add_axis_labels(mobile)
{
    //Set up X axis label
    wrapper.append("g")
    .append("text")
    .attr("class", "x title")
    .attr("text-anchor", "end")
    .style("font-size", (mobile ? 8 : 12) + "px")
    .attr("transform", "translate(" + width + "," + (height - 10) + ")")
    .text("GDP per capita [US $] - Note the logarithmic scale");

    //Set up y axis label
    wrapper.append("g")
    .append("text")
    .attr("class", "y title")
    .attr("text-anchor", "end")
    .style("font-size", (mobile ? 8 : 12) + "px")
    .attr("transform", "translate(18, 0) rotate(-90)")
    .text("Life expectancy");
}

function add_legend(color, opacityCircles, selected_countries)
{
    //Legend			
	var	legendMargin = {left: 5, top: 10, right: 5, bottom: 10},
    legendWidth = 145,
    legendHeight = 270;
    
    var svgLegend = d3.select("#legend").append("svg")
                .attr("width", (legendWidth + legendMargin.left + legendMargin.right))
                .attr("height", (legendHeight + legendMargin.top + legendMargin.bottom));			

    var legendWrapper = svgLegend.append("g").attr("class", "legendWrapper")
                    .attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top +")");
        
    var rectSize = 15, //dimensions of the colored square
        rowHeight = 20, //height of a row in the legend
        maxWidth = 144; //widht of each row
        
    //Create container per rect/text pair  
    var legend = legendWrapper.selectAll('.legendSquare')  	
            .data(color.range())                              
            .enter().append('g')   
            .attr('class', 'legendSquare') 
            .attr("transform", function(d,i) { return "translate(" + 0 + "," + (i * rowHeight) + ")"; })
            .style("cursor", "pointer")
            .on("mouseover", selectLegend(0.02, color, selected_countries))
            .on("mouseout", selectLegend(opacityCircles, color, selected_countries))
            //.on("click", clickLegend);
    
    //Non visible white rectangle behind square and text for better hover
    legend.append('rect')                                     
        .attr('width', maxWidth) 
        .attr('height', rowHeight) 			  		  
        .style('fill', "white");
    //Append small squares to Legend
    legend.append('rect')                                     
        .attr('width', rectSize) 
        .attr('height', rectSize) 			  		  
        .style('fill', function(d) {return d;});                                 
    //Append text to Legend
    legend.append('text')                                     
        .attr('transform', 'translate(' + 22 + ',' + (rectSize/2) + ')')
        .attr("class", "legendText")
        .style("font-size", "10px")
        .attr("dy", ".35em")		  
        .text(function(d,i) { return color.domain()[i]; });  
}

function add_slider(gdpData, populationData, selected_year, selected_countries){
    ionRangeSlider('#slider_year', {
        min: 1990,
        max: 2015,
        step: 5,
        from: parseInt(selected_year),//getParameters.year,
        prefix: "year ",
        grid: true,
        grid_num: 5,
        prettify_enabled: false,
        onChange: function(val){
                let year = parseInt(d3.select("#slider_year").attr("value"));
                delete_items()
                chosen_year_data = Object.values(gdpData[(String(year))])
                place_items(chosen_year_data, populationData, selected_year, selected_countries)
            }
        })
                

    
}

function delete_items()
{
    circleGroup.selectAll('.countries').remove();
    voronoiGroup.selectAll('path').remove();
}

function place_items(year_data, populationData, selected_year, selected_countries)
{
    place_circles(year_data, populationData, selected_year, selected_countries)
    place_labels(year_data)
}

function main(gdpData, populationData,  year, selected_countries){
    
    year_data = Object.values(gdpData[(String(year))])
    
    place_circles(year_data, populationData, String(year), selected_countries)
    place_labels(year_data)
    add_axis_labels(mobile)
    //add_legend(color, opacityCircles)
    add_slider(gdpData, populationData, year, selected_countries)
}
  
  
//VARIABLES
var margin = {left: 30, top: 20, right: 20, bottom: 20}
var opacityCircles = 0.7; 
var color = d3.scale.ordinal()
                    .range(["#EFB605", "#E58903", "#E01A25", "#C20049", "#991C71"])
                    .domain(["Africa", "America", "Asia", "Europe", "Oceania"]);


//GRAPH ELEMENTS
var mobile = ($( window ).innerWidth() < 500 ? true : false);
//size
width = Math.min($("#chart").width(), 800) - margin.left - margin.right
height = width*2/3

var svg = d3.select("#chart").append("svg")
        .attr("width", (width + margin.left + margin.right))
        .attr("height", (height + margin.top + margin.bottom));
        
var wrapper = svg.append("g").attr("class", "chordWrapper")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



//GRAPH axis's
let {xScale, xAxis} = create_xAxis(width, 100, 2e5, mobile)
    
wrapper.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(xAxis);


let {yScale, yAxis} = create_yAxis(height, 40, 100)
wrapper.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .call(yAxis);

var circleGroup = wrapper.append("g")
    .attr("class", "circleWrapper"); 


var voronoiGroup = wrapper.append("g")
    .attr("class", "voronoiWrapper");

var opacityCircles = 0.7



var jsonFilePath = "data/UN_JSON.json"
var jsonPopPath = "data/population.json"

const fetchExternalData = () => {
    return Promise.all([
      fetch(jsonFilePath),
      fetch(jsonPopPath)
    ])
    .then(
      results => Promise.all(
        results.map(result => result.json())
      )
    )
  }
  
fetchExternalData().then(
(response) => {
    handle_data(response[0], response[1])
}
)
function handle_data(gdpData, populationData)
{
    var url_string = window.location.href;
    var url = new URL(url_string);

    let contains = function(list, item) {return list.indexOf(item) > -1;}
    var getParameters = {}
    year = url.searchParams.get("year")
    if (year === '' || year === null){
        year_string= "2015";
    }
    else{
        year_string = year.replace(/['"]+/g, '')
    }
    countries = url.searchParams.get("countries").replace(/['"]+/g, '')
    console.log(countries)
    main(gdpData, populationData, year_string, countries) 
}

