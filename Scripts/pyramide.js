/*
    Drawing of the SVG data
*/
function draw_pyramide(exampleData){
    // SET UP DIMENSIONS
    var w = window.innerWidth*0.66, h = w*0.66;
  
    // margin.middle is distance from center line to each y-axis
    var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 20,
      middle: 28
    };
  
    // the width of each side of the chart
    var regionWidth = w/2 - margin.middle;
  
    // these are the x-coordinates of the y-axes
    var pointA = regionWidth,
        pointB = w - regionWidth;

    // GET THE TOTAL POPULATION SIZE AND CREATE A FUNCTION FOR RETURNING THE PERCENTAGE
    var totalPopulation = d3.sum(exampleData, function(d) { return d.M + d.F; });
    var totalM = d3.sum(exampleData, function(d) { return d.M });
    var totalF = d3.sum(exampleData, function(d) { return d.F });

    percentage = function(d) { return d / totalPopulation; };
    percentageM = function(d) { return d / totalM; };
    percentageF = function(d) { return d / totalF; };

    // CREATE SVG
    d3.select("svg").remove();
    
    var s = 1.5 

    var svg = d3.select('#pyramide').append('svg')
      .attr('width', margin.left*s + w + margin.right*s)
      .attr('height', margin.top*s + h + margin.bottom*s)
      // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
      .append('g')
        .attr('transform', translation(margin.left, margin.top));

    // find the maximum data value on either side
    //  since this will be shared by both of the x-axes
    var maxValue = Math.max(
      d3.max(exampleData, function(d) { return percentageM(d.M); }),
      d3.max(exampleData, function(d) { return percentageF(d.F); })
    );

    // console.log("Total pop: "+ totalPopulation)
    // console.log(maxValue);

    // SET UP SCALES
    // the xScale goes from 0 to the width of a region
    //  it will be reversed for the left x-axis
    var xScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, regionWidth])
      .nice();

    var xScaleLeft = d3.scale.linear()
      .domain([0, maxValue])
      .range([regionWidth, 0]);

    var xScaleRight = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, regionWidth]);

    var yScale = d3.scale.ordinal()
      .domain(exampleData.map(function(d) { return d.Age; }))
      .rangeRoundBands([h,0], 0.1);
    // SET UP AXES

    var yAxisLeft = d3.svg.axis()
      .scale(yScale)
      .orient('right')
      .tickSize(4,0)
      .tickPadding(margin.middle-4);

    var yAxisRight = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .tickSize(4,0)
      .tickFormat('');

    var xAxisRight = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .tickFormat(d3.format('%'));

    var xAxisLeft = d3.svg.axis()
      // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
      .scale(xScale.copy().range([pointA, 0]))
      .orient('bottom')
      .tickFormat(d3.format('%'));

      // MAKE GROUPS FOR EACH SIDE OF CHART
    // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var leftBarGroup = svg.append('g')
      .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightBarGroup = svg.append('g')
      .attr('transform', translation(pointB, 0));

    // DRAW AXES
    svg.append('g')
      .attr('class', 'axis y left')
      .attr('transform', translation(pointA, 0))
      .call(yAxisLeft)
      .selectAll('text')
      .style('text-anchor', 'middle');
    svg.append('g')
      .attr('class', 'axis y right')
      .attr('transform', translation(pointB, 0))
      .call(yAxisRight);
    svg.append('g')
      .attr('class', 'axis x left')
      .attr('transform', translation(0, h))
      .call(xAxisLeft);
    svg.append('g')
      .attr('class', 'axis x right')
      .attr('transform', translation(pointB, h))
      .call(xAxisRight);

      //LABELS
      svg.append("text")             
        .attr("x", w*0.75 )
        .attr("y",  h+margin.bottom*1.3)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Percentage of men");

      svg.append("text")             
        .attr("x", w*0.25 )
        .attr("y",  h+margin.bottom*1.3)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Percentage of women");

      svg.append("text")             
        .attr("x", w*0.5 )
        .attr("y",  -margin.top*0.25)
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Age group");

      // DRAW BARS

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    leftBarGroup.selectAll('.bar.left')
      .data(exampleData)
      .enter().append('rect')
        .attr('class', 'bar left')
        .attr('x', 0)
        .attr('y', function(d) { return yScale(d.Age); })
        .attr('width', function(d) { return xScale(percentageF(d.F)); })
        .attr('height', yScale.rangeBand())
        .style("fill", "rgb(246, 51, 213)")
        .on('mouseover', function(d){
            d3.select(this)
              .attr('style', 'fill: orange;');
            
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html("Estimate women (in thousand): " + d.F );  
        })
        .on('mouseout', function(){
            d3.select(this)
              .style("fill", "rgb(246, 51, 213)");
            
            tooltip.style("display", "none");
        });

    rightBarGroup.selectAll('.bar.right')
        .data(exampleData)
        .enter().append('rect')
        .attr('class', 'bar right')
        .attr('x', 0)
        .attr('y', function(d) { return yScale(d.Age); })
        .attr('width', function(d) { return xScale(percentageM(d.M)); })
        .attr('height', yScale.rangeBand())
        .style("fill", "rgb(0, 0, 255)")
        .on('mouseover', function(d){
            d3.select(this)
                .attr('style', 'fill: orange;');

            tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html("Estimate men (in thousand): " + (d.M) );  
        })
        .on('mouseout', function(){
            d3.select(this)
                .style("fill", "rgb(0, 0, 255)");

                tooltip.style("display", "none");
        });
}

/*
    Function for when slider or select window changes data
*/
function changeData(){
    var e = document.getElementById("sLand");
    var v = e.value;
    
    var e2 = document.getElementById('slider_year');
    var v2 = e2.value;

    if(v == ""){
      var el = document.getElementById('sLand');
      v = el.options[0].innerHTML;
    }

    var c = v;
    var y = v2;
    var loc = "../data/popCountries/"+v+"_"+v2+".csv";
    d3.csv(loc, function(data) {
      draw_pyramide(data);
    });
}


/*
    Sending data functions. 
*/
function sendDataToAbout(){
    var id = "Multidata"
    const options = "DIT, IS, EEN, ARRAY"

    var href="../Pages/about.html"
    window.location.href = href+"?filename="+id+"&"+"lands="+options;
}


/*
    translate rewriting was annoying in d3js
    Helper function
*/
function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';
}