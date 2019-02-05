// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " +  feature.properties.mag + "</p>")
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // https://leafletjs.com/examples/geojson/
  // using the pointToLayer option to create a CircleMarker:
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
  

  var geojsonMarkerOptions = {
    radius: 5*feature.properties.mag,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


        return L.circleMarker(latlng, geojsonMarkerOptions);
      }
    });

  

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {

var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.street",
  accessToken: API_KEY
});

 // Define a baseMaps object to hold our base layers
 var baseMaps = {
  "Street Map": streetmap,
};

// Create overlay object to hold our overlay layer
var overlayMaps = {
  Earthquakes: earthquakes
};

 // Create the map object with options
 var mymap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  layers: [streetmap, earthquakes]
});

 // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
 L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(mymap);

// https://leafletjs.com/examples/choropleth/
function getColor(d) {
  return d > 1 ? '#800026' :
         d > 2  ? '#BD0026' :
         d > 3  ? '#E31A1C' :
         d > 4  ? '#FC4E2A' :
         d > 5   ? '#FD8D3C' :
         d > 6  ? '#FEB24C' :
         d > 7   ? '#FED976' :
                    '#FFEDA0';
}

// Set up the legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5, 6],
        labels = [];

        div.innerHTML+='Magnitude<br><hr>'

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

}