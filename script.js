// Define the dimensions of the map container
const width = 960;
const height = 600;

// Create an SVG element within the map container
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Load the GeoJSON data
Promise.all([
  d3.json("world-map.geojson"),
  d3.json("races.json")
]).then(([geojsonData, raceDetailsData]) => {
  // Projection for mapping longitude and latitude to x and y coordinates
  const projection = d3.geoMercator().fitSize([width, height], geojsonData);

  // Create a path generator based on the projection
  const path = d3.geoPath().projection(projection);

  // Get the country names present in both files
  const countryNames = new Set(
    raceDetailsData.map((item) => item.GP_country)
  );

  // Render the countries
  svg.selectAll("path")
    .data(geojsonData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", function (d) {
      const countryName = d.properties.name;
      return countryNames.has(countryName)
        ? "country highlighted"
        : "country";
    });

  // Add event listeners for hover
  svg.selectAll("path")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Function to handle mouseover event
  function handleMouseOver(event, d) {
    const countryName = d.properties.name;
    const selectedYear = dropdown.property("value");

    const raceDetails = raceDetailsData.find(
      (item) =>
        item.GP_country === countryName &&
        new Date(item.Date).getFullYear() === parseInt(selectedYear)
    );
    if (raceDetails) {
      d3.select("#tooltip").style("visibility", "visible");

      // Update the tooltip div content with race details
      d3.select("#country").text(`${raceDetails.GP_country}`);
      d3.select("#date").text(`${raceDetails.Date}`);
      d3.select("#winner").text(` ${raceDetails.Winner}`);
      d3.select("#car").text(`Car: ${raceDetails.Car}`);
      d3.select("#laps").text(`Laps: ${raceDetails.Laps}`);
      d3.select("#time").text(`Time: ${raceDetails.Time}`);
    } else {
      d3.select("#tooltip").style("visibility", "hidden");
    }
  }

  // Function to handle mouseout event
  function handleMouseOut(event, d) {
    d3.select("#tooltip").style("visibility", "hidden");
  }

  // Extract the unique years from the race details data
  const years = Array.from(
    new Set(raceDetailsData.map((item) => new Date(item.Date).getFullYear()))
  );

  // Create a dropdown menu for selecting years
  const dropdown = d3.select("#dropdown")
    .append("select")
    .on("change", handleYearChange);

  // Add the year options to the dropdown menu
  dropdown.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    });

  // Function to handle year change event
  function handleYearChange() {
    const selectedYear = dropdown.property("value");
    updateMap(selectedYear);
    updateGraph(selectedYear); // Update the graph on year change
  }

  // Function to update the map based on the selected year
  function updateMap(year) {
    svg.selectAll("path").attr("class", function (d) {
      const countryName = d.properties.name;
      const raceDetails = raceDetailsData.find(
        (item) =>
          item.GP_country === countryName &&
          new Date(item.Date).getFullYear() === parseInt(year)
      );
      return countryNames.has(countryName) && raceDetails
        ? "country highlighted"
        : "country";
    });
  }

  // Function to update the graph based on the selected year
  function updateGraph(year) {
    const filteredData = raceDetailsData.filter(
      (item) => new Date(item.Date).getFullYear() === parseInt(year)
    );
    const driverWins = d3.rollups(
      filteredData,
      (v) => v.length,
      (d) => d.Winner
    );
    driverWins.sort((a, b) => b[1] - a[1]); // Sort winners in descending order

    // Clear existing graph
    d3.select("#graph").html("");

    // Define the dimensions of the graph container
    const graphWidth = 500;
    const graphHeight = 300;

    // Create an SVG element within the graph container
    const graphSvg = d3.select("#graph")
      .append("svg")
      .attr("width", graphWidth)
      .attr("height", graphHeight + 50);

    // Create scales for the axes
    const xScale = d3.scaleBand()
      .domain(driverWins.map((d) => d[0]))
      .range([50, graphWidth - 50])
      .padding(0.4);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(driverWins, (d) => d[1])])
      .range([graphHeight - 30, 10]);

    // Create the x-axis
    const xAxis = d3.axisBottom(xScale);

    graphSvg.append("g")
      .attr("transform", `translate(0, ${graphHeight - 30})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    // Create the y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(d3.max(driverWins, (d) => d[1])) // Set the number of ticks to match the maximum value
      .tickFormat(d3.format("d")); // Format ticks as integers

    graphSvg.append("g")
      .attr("transform", "translate(50, 0)")
      .call(yAxis);

    // Create the bars of the graph
    graphSvg.selectAll("rect")
      .data(driverWins)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => graphHeight - yScale(d[1]) - 30)
      .attr("fill", "#a6051a");
  }
});
