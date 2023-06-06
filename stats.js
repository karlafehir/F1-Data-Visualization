// Load the drivers data
d3.json("drivers.json")
  .then((data) => {
    // Extract the nationality counts
    const nationalityCounts = {};
    data.forEach((driver) => {
      const nationality = driver.Nationality;
      if (nationalityCounts[nationality]) {
        nationalityCounts[nationality]++;
      } else {
        nationalityCounts[nationality] = 1;
      }
    });

    // Convert the nationality counts to an array of objects
    const nationalityData = Object.keys(nationalityCounts).map((key) => {
      return { nationality: key, count: nationalityCounts[key] };
    });

    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append the SVG element to the nationality graph container
    const nationalitySvg = d3
      .select("#nationality-graph-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set the x scale and axis for the nationality graph
    const x = d3
      .scaleBand()
      .domain(nationalityData.map((d) => d.nationality))
      .range([0, width])
      .padding(0.1);
    nationalitySvg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", "white");

    // Set the y scale and axis for the nationality graph
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(nationalityData, (d) => d.count)])
      .range([height, 0]);
    nationalitySvg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", "white")
      .style("font-weight", "bold");
    nationalitySvg
      .selectAll("path.domain, g.tick line")
      .style("stroke", "white");

    // Add the bars to the nationality graph
    nationalitySvg
      .selectAll("rect")
      .data(nationalityData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.nationality))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", "#E6002B");

    // Group the drivers by car and calculate the total points for each car
    const carsData = d3.rollups(
      data,
      (group) => d3.sum(group, (d) => d.PTS),
      (d) => d.Car
    );

    // Sort the cars data in descending order of points
    carsData.sort((a, b) => b[1] - a[1]);

    // Append the SVG element to the car graph container
    const carSvg = d3
      .select("#car-graph-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 200)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set the x scale and axis for the car graph
    const xCar = d3
      .scaleBand()
      .domain(carsData.map((d) => d[0]))
      .range([0, width])
      .padding(0.1);

    carSvg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xCar))
      .selectAll("text")
      .style("fill", "white")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "-0.15em")
      .attr("transform", "rotate(-90)");

    // Set the y scale and axis for the car graph
    const yCar = d3
      .scaleLinear()
      .domain([0, d3.max(carsData, (d) => d[1])])
      .range([height, 0]);
    carSvg
      .append("g")
      .call(d3.axisLeft(yCar))
      .selectAll("text")
      .style("fill", "white");
    carSvg.selectAll("path.domain, g.tick line").style("stroke", "white");

    // Add the bars to the car graph
    carSvg
      .selectAll("rect")
      .data(carsData)
      .enter()
      .append("rect")
      .attr("x", (d) => xCar(d[0]))
      .attr("y", (d) => yCar(d[1]))
      .attr("width", xCar.bandwidth())
      .attr("height", (d) => height - yCar(d[1]))
      .attr("fill", "#E6002B")
      .on("mouseover", function (event, d) {
        // Show message on mouseover
        carSvg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", xCar(d[0]) + 150)
          .attr("y", yCar(d[1]) - 6)
          .attr("text-anchor", "middle")
          .style("fill", "white")
          .text(`Car: ${d[0]}, PTS: ${d[1]}`);
      })
      .on("mouseout", function () {
        // Remove message on mouseout
        carSvg.select(".tooltip").remove();
      });

    // ...
  })
  .catch((error) => {
    console.log(error);
  });
