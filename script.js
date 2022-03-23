import {AreaChart} from "@d3/area-chart"

d3.selectAll("p").style("color", "blue");

aapl = FileAttachment("data/aapl.csv").csv({typed: true})

Plot.areaY(aapl, {x: "date", y2: "close"}).plot()
