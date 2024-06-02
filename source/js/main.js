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

function getColorForChange(changePercent) {
    // Define a base brightness to avoid too dark colors
    const baseBrightness = 100;  // Starts from this value to avoid near-black colors

    // Calculate color intensity based on the percentage change
    const intensity = Math.min(255, baseBrightness + Math.floor((255 - baseBrightness) * Math.abs(changePercent) / 10)); // Normalize and cap at 10% for full brightness

    if (changePercent === 0) {
        // Return a base color slightly lighter than black for zero percent
        return `rgb(${baseBrightness}, ${baseBrightness}, ${baseBrightness})`;
    } else if (changePercent > 0) {
        // Gains: Increase green intensity as the percentage increases
        return `rgb(0, ${intensity}, 0)`;  // Brighter green for higher gains
    } else {
        // Losses: Increase red intensity as the loss increases
        return `rgb(${intensity}, 0, 0)`;  // Brighter red for larger losses
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const indicesDataPaths = {
        'Shanghai Composite': 'data/raw json/shanghai.json',
        'Nikkei': 'data/raw json/nikkei.json',
        'NASDAQ': 'data/raw json/nasdaq.json',
        'ASX': 'data/raw json/asx.json',
        'Bovespa': 'data/raw json/bovespa.json',
        'CAC': 'data/raw json/cac.json',
        'DAX': 'data/raw json/dax.json',
        'FTSE': 'data/raw json/ftse.json',
        'Hang Seng': 'data/raw json/hangseng.json',
        'KOSPI': 'data/raw json/kospi.json',
        'BMV': 'data/raw json/bmv.json',
        'Jakarta': 'data/raw json/jakarta.json',
        'Nifty': 'data/raw json/nifty.json',
        'AEX': 'data/raw json/aex.json',
        'MOEX': 'data/raw json/moex.json'
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
        updateVisualization(new Date(2015, 0, 1)); // Initial date January 1, 2015
    });

    // Function to format date for internal processing to "MM/DD/YYYY"
    function formatDateToMMDDYYYY(date) {
        const d = new Date(date);
        const mm = ('0' + (d.getMonth() + 1)).slice(-2); // months from 1-12
        const dd = ('0' + d.getDate()).slice(-2);
        const yyyy = d.getFullYear();
        return mm + '/' + dd + '/' + yyyy;
    }

    // Function to display date in "Month YYYY" format
    function formatDateToMonthYYYY(date) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
        const d = new Date(date);
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        return `${month} ${year}`;
    }

    // Function to update visualization and log index return on selected date
    function updateVisualization(currentDate) {
        const processingDate = formatDateToMMDDYYYY(currentDate); // Format "MM/DD/YYYY" for processing
        const displayDate = formatDateToMonthYYYY(currentDate); // Format "Month YYYY" for display
    
        const countries = {
            'China': 'Shanghai Composite',
            'Japan': 'Nikkei',
            'United States of America': 'NASDAQ',
            'Australia': 'ASX',
            'Brazil': 'Bovespa',
            'France': 'CAC',
            'Germany': 'DAX',
            'United Kingdom': 'FTSE',
            'Hong Kong': 'Hang Seng',
            'South Korea': 'KOSPI',
            'Mexico': 'BMV',               
            'Indonesia': 'Jakarta',       
            'India': 'Nifty',            
            'Russia': 'MOEX',
            'Netherlands': 'AEX'
        };
        
    
        Object.entries(countries).forEach(([country, index]) => {
            if (!indicesData[index]) {
                console.error(`Data for ${index} is not loaded or undefined.`);
                return;
            }
            
            const entry = indicesData[index].find(d => d['\ufeff"Date"'] === processingDate);
    
            if (entry) {
                const changePercent = parseFloat(entry['Change %'].replace('%', ''));
                const color = getColorForChange(changePercent);
                console.log(`${index} on ${displayDate}: ${entry.Price}, Change: ${changePercent}%`);
    
                d3.selectAll('.country').filter(d => d.properties && d.properties.name === country)
                    .style('fill', color);
            } else {
                console.log(`No data available for ${displayDate} in ${index}`);
            }
        });
    }

    // Function to initialize the visualization components
    function initializeVisualization() {
        console.log('Visualization components are being set up');
        d3.selectAll('.country').style('fill', '#ccc'); // Default color
    }

    // Function to setup the date slider and its interaction
    function setupDateSlider() {
        const slider = document.getElementById('date-slider');
        slider.addEventListener('input', function(e) {
            const monthCount = parseInt(e.target.value, 10);
            const currentDate = new Date(2015, monthCount, 1); // Base year 2015, add months from slider
            document.getElementById('date-label').innerText = formatDateToMonthYYYY(currentDate);
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


