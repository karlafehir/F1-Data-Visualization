d3.json("drivers.json").then(data => {
  // Extract the years from the data
  const years = [...new Set(data.map(driver => driver.year))];

  // Create a dropdown menu for selecting years
  const dropdown = document.getElementById("dropdown");
  const select = document.createElement("select");

  // Add the year options to the dropdown menu
  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.text = year;
    select.appendChild(option);
  });

  // Add event listener for year change
  select.addEventListener("change", handleYearChange);

  // Append the dropdown menu to the div
  dropdown.appendChild(select);

  // Function to handle year change event
  function handleYearChange() {
    const selectedYear = select.value;
    const filteredDrivers = data.filter(driver => driver.year == selectedYear);
    renderDrivers(filteredDrivers);
  }

  // Render the list of drivers
  renderDrivers(data);
});

// Function to render the list of drivers
function renderDrivers(drivers) {
  const driversList = document.getElementById("drivers-list");
  const remainingDriversList = document.getElementById("remaining-drivers-list");

  // Clear the previous drivers
  driversList.innerHTML = "";
  remainingDriversList.innerHTML = "";

  // Check if the number of drivers is at least 3 to display a podium
  if (drivers.length >= 3) {
    const podiumDrivers = drivers.slice(0, 3); // Get the first three drivers for the podium
    const remainingDrivers = drivers.slice(3); // Get the remaining drivers

    // Create a div for the podium
    const podiumDiv = document.createElement("div");
    podiumDiv.classList.add("podium");

    // Create podium elements for each driver
    podiumDrivers.forEach(driver => {
      const podiumDriverDiv = createDriverDiv(driver);
      if (driver.Car === "Ferrari") {
        const driverName = podiumDriverDiv.querySelector(".driver-name");
        driverName.classList.add("red");
      }
      podiumDiv.appendChild(podiumDriverDiv);
    });

    // Append the podium div to the drivers list container
    driversList.appendChild(podiumDiv);

    // Create list items for the remaining drivers
    remainingDrivers.forEach(driver => {
      const listItem = createDriverListItem(driver);
      if (driver.Car === "Ferrari") {
        const driverName = listItem.querySelector(".driver-name");
        driverName.classList.add("red");
      }
      remainingDriversList.appendChild(listItem);
    });
  } else {
    // Create list items for each driver
    drivers.forEach(driver => {
      const listItem = createDriverListItem(driver);
      if (driver.Car === "Ferrari") {
        const driverName = listItem.querySelector(".driver-name");
        driverName.classList.add("red");
      }
      driversList.appendChild(listItem);
    });
  }
}

// Function to create a div for a driver
function createDriverDiv(driver) {
  const driverDiv = document.createElement("div");
  driverDiv.classList.add("podium-driver");
  driverDiv.innerHTML = `
    <h2 class="driver-pos">Pos: ${driver.Pos}</h2>
    <div class="driver-details">
      <h1 class="driver-name">${driver.Driver}</h1>
      <div class="driver-stats">Car: ${driver.Car}</div>
      <div class="driver-stats">Nationality: ${driver.Nationality}</div>
      <div class="driver-stats">PTS: ${driver.PTS}</div>
    </div>
  `;
  return driverDiv;
}

// Function to create a list item for a driver
function createDriverListItem(driver) {
  const listItem = document.createElement("li");
  listItem.innerHTML = `
    <div class="driver-info">
      <div class="driver-pos">Pos: ${driver.Pos}</div>
      <div class="driver-details">
        <div class="driver-name">${driver.Driver}</div>
        <div class="driver-stats">Car: ${driver.Car}</div>
        <div class="driver-stats">Nationality: ${driver.Nationality}</div>
        <div class="driver-stats">PTS: ${driver.PTS}</div>
      </div>
    </div>
  `;
  return listItem;
}
