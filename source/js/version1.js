// Create the orthographic projection
const width = 960, height = 600;
const projection = d3.geoOrthographic()
  .scale(295) // Adjust to fit the SVG
  .translate([width / 2, height / 2])
  .clipAngle(90); // Clip to hemisphere

const pathGenerator = d3.geoPath().projection(projection);

// Load the GeoJSON data and draw the countries
d3.json('data/world-geojson.json').then(geojsonData => {
  // Draw the globe background
  d3.select('#world-map')
    .append('circle')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .attr('r', projection.scale())
    .attr('class', 'globe');

  // Draw each country
  d3.select('#world-map')
    .selectAll('path')
    .data(geojsonData.features)
    .enter()
    .append('path')
    .attr('d', pathGenerator)
    .attr('class', 'country');
});


// Function to format date in a readable format
function formatDate(date) {
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString(undefined, options);
}

function formatDateToMMDDYYYY(date) {
  const d = new Date(date);
  const mm = ('0' + (d.getMonth() + 1)).slice(-2); // months from 1-12
  const dd = ('0' + d.getDate()).slice(-2);
  const yyyy = d.getFullYear();
  return mm + '/' + dd + '/' + yyyy;
}
document.addEventListener('DOMContentLoaded', function() {
  const indicesDataPaths = {
      'Shanghai Composite': 'data/raw json/shanghai composite_fixed.json',
      'Nikkei': 'data/raw json/nikkei_fixed.json',
      'NASDAQ': 'data/raw json/nasdaq_fixed.json'
  };

  let indicesData = {};

  // Fetch all indices data
  Promise.all(Object.entries(indicesDataPaths).map(([index, path]) =>
      fetch(path)
      .then(response => response.json())
      .then(data => {
          indicesData[index] = data;
          console.log(`${index} data loaded successfully`);
      })
      .catch(error => console.error(`Error loading the data for ${index}:`, error))
  )).then(() => {
      console.log('All data loaded');
      initializeVisualization();
      setupDateSlider();
      const initialDate = new Date(2020, 0, 1); // Adjust this date as necessary
      updateVisualization(initialDate);
  });

  // Function to format date to MM/DD/YYYY
  function formatDateToMMDDYYYY(date) {
      const d = new Date(date);
      const mm = ('0' + (d.getMonth() + 1)).slice(-2); // months from 1-12
      const dd = ('0' + d.getDate()).slice(-2);
      const yyyy = d.getFullYear();
      return mm + '/' + dd + '/' + yyyy;
  }

  // Function to update visualization and log index return on selected date
  function updateVisualization(currentDate) {
      const dateString = formatDateToMMDDYYYY(currentDate); // Format MM/DD/YYYY

      const countries = {
          'China': 'Shanghai Composite',
          'Japan': 'Nikkei',
          'USA': 'NASDAQ'
      };

      Object.entries(countries).forEach(([country, index]) => {
          const entry = indicesData[index].find(d => d['\ufeff"Date"'] === dateString);

          if (entry) {
              const changePercent = parseFloat(entry['Change %'].replace('%', ''));
              console.log(`${index} on ${dateString}: ${entry.Price}`);

              d3.selectAll('.country').filter(d => d.properties && d.properties.name === country)
                  .style('fill', changePercent > 0 ? 'green' : 'red');
          } else {
              console.log(`No data available for ${dateString} in ${index}`);
          }
      });
  }

  // Function to initialize the visualization components
  function initializeVisualization() {
      // Set up D3 scales, axes, SVG elements, etc.
      console.log('Visualization components are being set up');

      // Example: Set default colors or initial graphical elements
      d3.selectAll('.country')
          .style('fill', '#ccc'); // Default color
  }

  // Function to setup the date slider and its interaction
  function setupDateSlider() {
      const slider = document.getElementById('date-slider');
      slider.addEventListener('input', function(e) {
          const monthCount = parseInt(e.target.value, 10);
          const currentDate = new Date(2020, 0, monthCount); // January 2020 as base, adjust as necessary
          document.getElementById('date-label').innerText = formatDateToMMDDYYYY(currentDate);
          updateVisualization(currentDate);
      });
      console.log('Date slider set up complete');
  }
});



// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([150, 800]) // Limit the scale to between 150 and 800
    .on('zoom', (event) => {
        // Adjust the projection scale based on zoom
        projection.scale(event.transform.k);
        // Update the paths and circle radius to reflect the new scale
        d3.selectAll('path').attr('d', pathGenerator);
        d3.select('.globe').attr('r', projection.scale());
    });

// Define drag behavior
const drag = d3.drag()
    .on('start', (event) => {
        const [x, y] = d3.pointer(event, this);
        dragStart = {x: x, y: y, rotate: projection.rotate()};
    })
    .on('drag', (event) => {
        const r = dragStart.rotate;
        const k = sensitivity / projection.scale();
        const rotate = [
            r[0] + (d3.pointer(event, this)[0] - dragStart.x) * k,
            r[1] - (d3.pointer(event, this)[1] - dragStart.y) * k
        ];
        projection.rotate(rotate);
        d3.selectAll('path').attr('d', pathGenerator);
    });

// Add the drag and zoom behaviors to the svg
const svg = d3.select('#world-map');
svg.call(drag).call(zoom);

// Define drag sensitivity and rotation start position
const sensitivity = 75;
let dragStart = {};


