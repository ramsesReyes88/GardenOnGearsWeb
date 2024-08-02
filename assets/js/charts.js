

var gauge_temp;
var gauge_hum;
var gauge_lux;

function initGauge() {
    gauge_temp = new JustGage({
        id: "temperature_gauge",
        value: 0,
        min: 0,
        max: 50,
        title: "Temperatura",
        levelColors: ["#0000FF"],
        label: "°C"
    });
    gauge_hum = new JustGage({
        id: "humidity_gauge",
        value: 0,
        min: 0,
        max: 100,
        title: "Humedad Relativa",
        levelColors: ["#00FF00"],
        label: "%"
    });
    gauge_lux = new JustGage({
        id: "luminosity_gauge",
        value: 0,
        min: 0,
        max: 4095,
        title: "Luminosidad",
        levelColors: ["#FF0000"],
        label: "%"
    });
}

function updateGauge(temperature, humidity, luminosity) {
    gauge_temp.refresh(temperature);
    gauge_hum.refresh(humidity);
    gauge_lux.refresh(luminosity);
}

function updateValues() {
    $.getJSON('https://localhost:44313/api/lecturas/latest', function(response) {
        console.log("Received data:", response);

        if (response && response.temperatura != null && response.humedad != null && response.lux != null) {
            var temperature = response.temperatura;
            var humidity = response.humedad;
            var luminosity = response.lux;

            console.log("Temperature =", temperature);
            console.log("Humidity =", humidity);
            console.log("Luminosity =", luminosity);

            updateGauge(temperature, humidity, luminosity);
        } else {
            console.error("No valid data received from API.");
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error fetching data:', textStatus, errorThrown);
    });
}

$(document).ready(function() {
    initGauge();
    updateValues();
    setInterval(updateValues, 5000);
});



function createChart(container, titleText, yAxisTitle, seriesName) {
    return Highcharts.chart(container, {
        chart: {
            type: 'spline'
        },
        title: {
            text: titleText
        },
        subtitle: {
            text: 'Data input from JSON API'
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Tiempo'
            }
        },
        yAxis: {
            title: {
                text: yAxisTitle
            }
        },
        series: [{
            name: seriesName,
            data: []
        }]
    });
}

var temperatureChart = createChart('temperature_chart', 'Temperatura', 'Celsius', 'Temperatura');
var humidityChart = createChart('humidity_chart', 'Humedad', '%', 'Humedad');
var luminosityChart = createChart('luminosity_chart', 'Luminosidad', '%', 'Luminosidad');

function updateCharts() {
$.getJSON('https://localhost:44313/api/lecturas/history', function(response) {
    console.log('Received data:', response);

    if (Array.isArray(response)) {
        // Clear existing data points
        temperatureChart.series[0].setData([]);
        humidityChart.series[0].setData([]);
        luminosityChart.series[0].setData([]);

        // Add new data points, keeping only the last 10
        var data = { temperature: [], humidity: [], luminosity: [] };
        response.forEach(function(reading) {
            var timestamp = Date.parse(reading.fecha);
            var temperature = reading.temperatura;
            var humidity = reading.humedad;
            var luminosity = reading.lux;

            // Add new data points to arrays
            data.temperature.push([timestamp, temperature]);
            data.humidity.push([timestamp, humidity]);
            data.luminosity.push([timestamp, luminosity]);
        });

        // Keep only the last 10 data points
        data.temperature = data.temperature.slice(-10);
        data.humidity = data.humidity.slice(-10);
        data.luminosity = data.luminosity.slice(-10);

        // Update the charts with the new data
        temperatureChart.series[0].setData(data.temperature, true);
        humidityChart.series[0].setData(data.humidity, true);
        luminosityChart.series[0].setData(data.luminosity, true);
    } else {
        console.error('Response is not an array.');
    }
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error fetching data:', textStatus, errorThrown);
});
}

updateCharts();
setInterval(updateCharts, 5000);