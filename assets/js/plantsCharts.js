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
        if (response && response.temperatura != null && response.humedad != null && response.lux != null) {
            var temperature = response.temperatura;
            var humidity = response.humedad;
            var luminosity = response.lux;

            updateGauge(temperature, humidity, luminosity);
        } else {
            console.error("No valid data received from API.");
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error fetching data:', textStatus, errorThrown);
    });
}

// Highcharts initialization
var temperatureChart, humidityChart, luminosityChart, combinedChart;

function createChart(container, titleText, yAxisTitle, seriesName) {
    return Highcharts.chart(container, {
        chart: { type: 'spline' },
        title: { text: titleText },
        subtitle: { text: 'Data input from JSON API' },
        xAxis: { type: 'datetime', title: { text: 'Tiempo' } },
        yAxis: { title: { text: yAxisTitle } },
        series: [{ name: seriesName, data: [] }]
    });
}

function createCombinedChart(container) {
    return Highcharts.chart(container, {
        chart: { type: 'spline' },
        title: { text: 'Datos Combinados' },
        subtitle: { text: 'Data input from JSON API' },
        xAxis: { type: 'datetime', title: { text: 'Tiempo' } },
        yAxis: { title: { text: 'Valores' } },
        series: [
            { name: 'Temperatura', data: [], color: '#FF0000' },
            { name: 'Humedad', data: [], color: '#0000FF' },
            { name: 'Luminosidad', data: [], color: '#00FF00' }
        ]
    });
}

function updateCharts() {
    $.getJSON('https://localhost:44313/api/lecturas/history', function(response) {
        if (Array.isArray(response)) {
            var data = { temperature: [], humidity: [], luminosity: [] };
            response.forEach(function(reading) {
                var timestamp = Date.parse(reading.fecha);
                data.temperature.push([timestamp, reading.temperatura]);
                data.humidity.push([timestamp, reading.humedad]);
                data.luminosity.push([timestamp, reading.lux]);
            });

            data.temperature = data.temperature.slice(-10);
            data.humidity = data.humidity.slice(-10);
            data.luminosity = data.luminosity.slice(-10);

            temperatureChart.series[0].setData(data.temperature, true);
            humidityChart.series[0].setData(data.humidity, true);
            luminosityChart.series[0].setData(data.luminosity, true);

            combinedChart.series[0].setData(data.temperature, true);
            combinedChart.series[1].setData(data.humidity, true);
            combinedChart.series[2].setData(data.luminosity, true);
        } else {
            console.error('Response is not an array.');
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error fetching data:', textStatus, errorThrown);
    });
}

$(document).ready(function() {
    // Initialize gauges and charts
    initGauge();
    updateValues();
    setInterval(updateValues, 5000);

    temperatureChart = createChart('temperature_chart', 'Temperatura', 'Celsius', 'Temperatura');
    humidityChart = createChart('humidity_chart', 'Humedad', '%', 'Humedad');
    luminosityChart = createChart('luminosity_chart', 'Luminosidad', '%', 'Luminosidad');
    combinedChart = createCombinedChart('combined_chart');

    updateCharts();
    setInterval(updateCharts, 5000);

    // Toggle between separated and combined charts
    var initialChartType = localStorage.getItem('chartType') || 'separated';
    $('#chartTypeSelect').val(initialChartType);
    if (initialChartType === 'combined') {
        $('#separatedCharts').hide();
        $('#combinedChart').show();
    } else {
        $('#separatedCharts').show();
        $('#combinedChart').hide();
    }

    // Update localStorage and chart visibility on change
    $('#chartTypeSelect').change(function() {
        var selectedValue = $(this).val();
        localStorage.setItem('chartType', selectedValue);
        if (selectedValue === 'combined') {
            $('#separatedCharts').hide();
            $('#combinedChart').show();
        } else {
            $('#separatedCharts').show();
            $('#combinedChart').hide();
        }
    });
});

$(document).ready(function() {
    function fetchLecturas() {
        $.getJSON('https://localhost:44313/api/lecturas/history', function(response) {
            if (Array.isArray(response)) {
                var tableBody = $('#lecturasTable tbody');
                tableBody.empty(); // Limpiar datos previos

                // Tomar las últimas 10 lecturas y ordenarlas de la más reciente a la más antigua
                response.slice(-10).reverse().forEach(function(lectura) {
                    var row = $('<tr>');
                    
                    // Fecha
                    var date = new Date(lectura.fecha);
                    row.append($('<td>').text(date.toLocaleString()));

                    // Temperatura
                    var tempCell = $('<td>').text(lectura.temperatura.toFixed(2));
                    if (lectura.temperatura < 15) {
                        tempCell.css('color', 'blue');
                    } else if (lectura.temperatura > 30) {
                        tempCell.css('color', 'red');
                    }
                    row.append(tempCell);

                    // Humedad
                    var humCell = $('<td>').text(lectura.humedad.toFixed(2));
                    if (lectura.humedad < 30) {
                        humCell.css('color', 'blue');
                    } else if (lectura.humedad > 60) {
                        humCell.css('color', 'red');
                    }
                    row.append(humCell);

                    // Lux
                    var luxCell = $('<td>').text(lectura.lux.toFixed(2));
                    if (lectura.lux < 1500) {
                        luxCell.css('color', 'blue');
                    } else if (lectura.lux > 3000) {
                        luxCell.css('color', 'red');
                    }
                    row.append(luxCell);

                    tableBody.append(row);
                });
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data:', textStatus, errorThrown);
        });
    }

    fetchLecturas();
    setInterval(fetchLecturas, 6000);
});