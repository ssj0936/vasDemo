var line_data = {
    labels: [],
    datasets: [
        {
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: []
        }
    ]
};

function lineDataObj() {
    this.labelsByDate = [];
    this.labelsByWeek = [];
    this.labelsByMonth = [];
    //default by date
    this.labels = null;

    this.datasets = [];
    this.yAxes = [{
        name: "rightAxis",
        scalePositionLeft: false,
        scaleFontColor: "#666"
     }, {
        name: "normal",
        scalePositionLeft: true,
        scaleFontColor: "#666"
     }];
}

function lineDatasetsObj(label, fillColor, pointColor, highlightColor, rightAxis) {
    //    this.label = label;
    //    this.type = 'line';
    //    this.yAxesGroup = (rightAxis ? 'rightAxis' : 'normal');
    //    this.fillColor = fillColor;
    ////    this.fillColor = "rgba(0,0,0,0)";
    //    this.strokeColor = pointColor;
    //    this.pointColor = pointColor;
    //    this.pointStrokeColor = "#fff";
    //    this.pointHighlightFill = "#fff";
    //    this.pointHighlightStroke = highlightColor;
    //    this.dataByDate = [];
    //    this.dataByWeek = [];
    //    this.dataByMonth = [];
    //    //default by date
    //    this.data = this.dataByDate;

    this.label = label;
    this.yAxesGroup = (rightAxis ? 'rightAxis' : 'normal');
    this.fill = true;
    this.lineTension = 0.4;
    this.backgroundColor = fillColor;
    this.borderColor = pointColor;
    this.borderCapStyle = 'butt';
    this.borderDash = [];
    this.borderDashOffset = 0.0;
    this.borderJoinStyle = 'miter';
    this.pointBorderColor = pointColor;
    this.pointBackgroundColor = "#fff";
    this.pointBorderWidth = 1;
    this.pointHoverRadius = 5;
    this.pointHoverBackgroundColor = pointColor;
    this.pointHoverBorderColor = "rgba(220,220,220,1)";
    this.pointHoverBorderWidth = 2;
    this.pointRadius = 1;
    this.pointHitRadius = 10;
    this.dataByDate = [];
    this.dataByWeek = [];
    this.dataByMonth = [];
    this.data = this.dataByDate;
    this.spanGaps = false;

}

function option() {
    //    this.animation = true;
    this.populateSparseData = true;
    this.overlayBars = false;
    this.datasetFill = true;
    this.responsive = true;
    this.maintainAspectRatio = false;
    this.showTooltips = true;
    this.legend = {
        position: 'right',
        display: false,
        fullWidth: false,
    };

    this.tooltips = {
        callbacks: {
            label: function (tooltipItem, data) {
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + numToString(tooltipItem.yLabel);
            }
        }
    };

    this.legendCallback = function (chart) {
        var text = [];
        text.push('<ul class="' + chart.id + '-legend">');
        for (var i = 0; i < chart.data.datasets.length; i++) {
            text.push('<li><span style="background-color:' + chart.data.datasets[i].borderColor + '"></span>');
            if (chart.data.datasets[i].label) {
                text.push(chart.data.datasets[i].label);
            }
            text.push('</li>');
        }
        text.push('</ul>');
        return text.join("");
    }
}

var newOptions = new option();
newOptions.scales = {
    yAxes: [{
        ticks: {
            callback: function (value) {
                return numToString(value);
            }
        }
      }]
};


var percentageOptions = new option();
percentageOptions.scales = {
    yAxes: [{
        ticks: {
            // Create scientific notation labels
            callback: function (value) {
                return '' + value.toFixed(1) + ' %';
            }
        }
            }]
};
percentageOptions.tooltips = {
    callbacks: {
        label: function (tooltipItem, data) {
            return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel.toFixed(1) + ' %';
        }
    }
};

var CFRpercentageOptions = new option();
CFRpercentageOptions.scales = {
    yAxes: [{
        ticks: {
            // Create scientific notation labels
            callback: function (value) {
                return '' + value.toFixed(1) + ' %';
            }
        }
    }],
    xAxes: [{
        scaleLabel: {
            display: true,
            labelString: 'Shipping Month'
        }
    }]
};
CFRpercentageOptions.tooltips = {
    callbacks: {
        label: function (tooltipItem, data) {
            return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel.toFixed(1) + ' %';
        }
    }
};


var negOptions = new option();
negOptions.scales = {
    yAxes: [{
        ticks: {
            // Create scientific notation labels
            callback: function (value) {
                return (value * 100).toFixed(1) + ' %';
            }
        }
            }]
};

negOptions.tooltips = {
    callbacks: {
        label: function (tooltipItem, data) {
            return data.datasets[tooltipItem.datasetIndex].label + ': ' + (tooltipItem.yLabel * 100).toFixed(1) + ' %';
        }
    }
};

var barchartOptions = new option();
barchartOptions.tooltips = {
    enabled: true,
    mode: 'single',
    displayColors: false,
    callbacks: {
        label: function (tooltipItem, data) {
            var lineObj = data.datasets.filter(function (obj) {
                return obj.type == 'line';
            });
            var barObj = data.datasets.filter(function (obj) {
                return obj.type == 'bar';
            });

            var tooltips = new Array();
            if (barObj != false)
                tooltips.push('Activation Count : ' + numToString(barObj[0].data[tooltipItem.index]));
            if (lineObj != false) {
                if (tooltipItem.index == 0)
                    tooltips.push("Percentage : " + lineObj[0].data[tooltipItem.index].toFixed(1) + "%");
                else
                    tooltips.push("Percentage : " + (lineObj[0].data[tooltipItem.index] - lineObj[0].data[tooltipItem.index - 1]).toFixed(1) + "%");
                tooltips.push("Cumulative Percentage : " + lineObj[0].data[tooltipItem.index].toFixed(1) + "%");
            }
            return tooltips;
        }
    }
};
barchartOptions.scales = {
    xAxes: [
        {
            display: true,
            gridLines: {
                display: true
            },
            labels: {
                show: true,
            }
        }
    ],
    yAxes: [
        {
            type: "linear",
            display: true,
            position: "left",
            id: "y-axis-1",
            gridLines: {
                display: false
            },
            labels: {
                show: true,
            },
            ticks: {
                callback: function (value) {
                    return numToString(value);
                }
            }
        }, {
            type: "linear",
            display: true,
            position: "right",
            id: "y-axis-2",
            gridLines: {
                display: false
            },
            labels: {
                show: true,
            },
            ticks: {
                beginAtZero: true,
                max: 110,
                callback: function (value) {
                    if (value > 100)
                        return '';
                    else
                        return '' + value.toFixed(1) + (value >= 100 ? '%' : '  %');
                }
            }
        }
    ]
};
barchartOptions.hover = {
    animationDuration: 0
};
barchartOptions.animation = {
    duration: 1,
    onComplete: function () {
        //        console.log('com');
        var chartInstance = this.chart,
            ctx = chartInstance.ctx;
        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        this.data.datasets.forEach(function (dataset, i) {
            if (dataset.type == 'line') {
                var meta = chartInstance.controller.getDatasetMeta(i);
                meta.data.forEach(function (bar, index) {
                    var data = '' + dataset.data[index].toFixed(1) + ' %';
                    ctx.fillText(data, bar._model.x, bar._model.y - 5);
                });
            }
        });
    }
};
var stackedBarOptions = {
    populateSparseData: true,
    overlayBars: false,
    datasetFill: true,
    responsive: true,
    maintainAspectRatio: false,
    showTooltips: true,
    scales: {
        xAxes: [{
            stacked: true,
            gridLines: {
                display: false
            },
            }],
        yAxes: [{
            stacked: true,
            gridLines: {
                display: false
            },
            scaleLabel: {
                display: true,
                labelString: 'size ratio(%)'
            },
            ticks: {
                callback: function (value) {
                    return numToString(value) + ' %';
                },
            },
            }],
    },
    legend: {
        display: true
    },
    tooltips: {
        enabled: true,
        mode: 'single',
        //        displayColors: false,
        callbacks: {
            label: function (tooltipItem, data) {
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel.toFixed(1) + ' %';
            }
        }
    }
}
