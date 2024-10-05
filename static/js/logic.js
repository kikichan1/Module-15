// Create the map object centered on California
let map = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 6
});

// Add the tile layer for the world map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define color scale for depth ranges from green to red
const depthColor = d3.scaleThreshold()
    .domain([-10, 10, 30, 50, 70, 90])
    .range(['#00FF00', '#ADFF2F', '#FFFF00', '#FFA500', '#FF4500', '#FF0000']);

// Fetch GeoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(data => {
        const earthquakes = data.features;

        // Create a scale for radius based on magnitude
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(earthquakes, earthquake => earthquake.properties.mag)])
            .range([0, 20]);

        // Draw circles for each earthquake
        earthquakes.forEach(earthquake => {
            const coords = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]];
            
            L.circle(coords, {
                radius: radiusScale(earthquake.properties.mag) * 1000,
                fillColor: depthColor(earthquake.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: '#000',
                weight: 1
            }).addTo(map)
            .bindPopup(`Magnitude: ${earthquake.properties.mag}<br>Depth: ${earthquake.geometry.coordinates[2]} km`);
        });

        // Create the legend
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'info legend');
            const labels = ['-10 to 10', '10 to 30', '30 to 50', '50 to 70', '70 to 90', '90+'];
            const colors = ['#00FF00', '#ADFF2F', '#FFFF00', '#FFA500', '#FF4500', '#FF0000'];

            // Create the legend items with colors
            for (let i = 0; i < colors.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + colors[i] + '; width: 20px; height: 20px; display: inline-block; margin-right: 8px;"></i> ' +
                    labels[i] + '<br>';
            }

            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching data:', error));