"use strict";

Chart.pluginService.register({
    beforeInit: function (chart) {
        var hasWrappedTicks = chart.config.data.labels.some(function (label) {
            return label.indexOf('\n') !== -1;
        });

        if (hasWrappedTicks) {
            // figure out how many lines we need - use fontsize as the height of one line
            var tickFontSize = Chart.helpers.getValueOrDefault(chart.options.scales.xAxes[0].ticks.fontSize, Chart.defaults.global.defaultFontSize);
            var maxLines = chart.config.data.labels.reduce(function (maxLines, label) {
                return Math.max(maxLines, label.split('\n').length);
            }, 0);
            var height = (tickFontSize + 2) * maxLines + (chart.options.scales.xAxes[0].ticks.padding || 0);

            // insert a dummy box at the bottom - to reserve space for the labels
            Chart.layoutService.addBox(chart, {
                draw: Chart.helpers.noop,
                isHorizontal: function () {
                    return true;
                },
                update: function () {
                    return {
                        height: this.height
                    };
                },
                height: height,
                options: {
                    position: 'bottom',
                    fullWidth: 1,
                }
            });

            // turn off x axis ticks since we are managing it ourselves
            chart.options = Chart.helpers.configMerge(chart.options, {
                scales: {
                    xAxes: [{
                        ticks: {
                            display: false,
                            // set the fontSize to 0 so that extra labels are not forced on the right side
                            fontSize: 0
                        }
          }]
                }
            });

            chart.hasWrappedTicks = {
                tickFontSize: tickFontSize
            };
        }
    },
    afterDraw: function (chart) {
        if (chart.hasWrappedTicks) {
            // draw the labels and we are done!
            chart.chart.ctx.save();
            var tickFontSize = chart.hasWrappedTicks.tickFontSize;
            var tickFontStyle = Chart.helpers.getValueOrDefault(chart.options.scales.xAxes[0].ticks.fontStyle, Chart.defaults.global.defaultFontStyle);
            var tickFontFamily = Chart.helpers.getValueOrDefault(chart.options.scales.xAxes[0].ticks.fontFamily, Chart.defaults.global.defaultFontFamily);
            var tickLabelFont = Chart.helpers.fontString(tickFontSize, tickFontStyle, tickFontFamily);
            chart.chart.ctx.font = tickLabelFont;
            chart.chart.ctx.textAlign = 'center';
            var tickFontColor = Chart.helpers.getValueOrDefault(chart.options.scales.xAxes[0].fontColor, Chart.defaults.global.defaultFontColor);
            chart.chart.ctx.fillStyle = tickFontColor;

            var meta = chart.getDatasetMeta(0);
            var xScale = chart.scales[meta.xAxisID];
            var yScale = chart.scales[meta.yAxisID];

            chart.config.data.labels.forEach(function (label, i) {
                label.split('\n').forEach(function (line, j) {

                    if (j == 1) {
                        chart.chart.ctx.font = "bold 14px Verdana";
                    } else {
                        chart.chart.ctx.font = "14px Verdana";
                    }

                    if (j == 0 || j == 2) {
                        chart.chart.ctx.fillStyle = 'rgba(200,20,20,0.8)';
                    } else {
                        chart.chart.ctx.fillStyle = '#333';
                    }

                    chart.chart.ctx.fillText(line, xScale.getPixelForTick(i + 0.5), (chart.options.scales.xAxes[0].ticks.padding || 0) + yScale.getPixelForValue(yScale.min) +
                        // move j lines down
                        j * (chart.hasWrappedTicks.tickFontSize + 2));
                });
            });
            chart.chart.ctx.restore();
        }
    }
})

var compose = (function () {
    let container = $('#tableContainer');
    var linechart = null,
        trendObj = null;

    var rightPopupContainerWidthP = 0.84;
    var trendContainerWidthP = 0.8;
    var chartHeight = 500;
    var chartSpacing = 60;

    var topRightChart, topLeftChart, bottomRightChart, bottomLeftChart;

    function barData() {
        this.labels = [];

        this.data = [];
        this.percentageData = [];

        this.datasets = [
            {
                type: 'line',
                label: 'Cumulative Percentage',
                fill: false,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 1,
                data: this.percentageData,
                yAxisID: 'y-axis-2'
            }, {
                type: 'bar',
                label: 'Activation Count',
                fill: false,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                data: this.data,
                yAxisID: 'y-axis-1'
            }
        ];

        this.addData = function (data, percentageData) {
            this.data.push(data);
            this.percentageData.push(percentageData);
        }
    }

    function createChart() {
        console.log('132');
        container.empty();
        gridSetting();

        rightTopTableSetting();
        rightBottomTableSetting();
        leftTopTableSetting();
        leftBottomTableSetting();
        //        console.log(json);
        //data reset
        //        chartDestroy(true);
        //fetch data
        //        trendObj = new barData();
        //        setTrendLable(json);
        //        setTrendData(json);
        //        createChartElement();
        //        loadingDismiss();
    }

    function gridSetting() {
        $('#tableContainer').append(
            jQuery('<div/>', {
                class: 'container'
            }).append(
                jQuery('<div/>', {
                    class: 'row'
                })
                .append(jQuery('<div/>', {
                    class: 'col-xs-6',
                    id: 'left'
                }))
                //                .append(jQuery('<div/>', {
                //                    class: 'col-xs-2',
                //                    id: 'middle'
                //                }).text('middle'))
                .append(jQuery('<div/>', {
                    class: 'col-xs-6',
                    id: 'right'
                }))
            )
        );
    }

    function leftBottomTableSetting() {
        //***********************************************
        //        var dates = ["2016-02", "2016-03", "2016-04", "2016-05", "2016-06", "2016-07", "2016-08", "2016-09", "2016-10", "2016-11", "2016-12", "2017-01", "2017-02"],
        //            value = [150, 160, 128, 130, 238, 220, 296, 280, 289, 300, 187, 190, 352];
        let size = [1, 2, 3, 4],
            value = [8, 284, 44, 15],
            xLabels1 = ["0%\n14\"\n0%\n2%", "1%\n15\"S1\n4%\n81%", "89%\n15\"S2\n94%\n13%", "8%\n16\"\n3%\n4%"];
        //            xLabels2 = ['', "14\"", "15\"S1", "15\"S2", "16\""],
        //            xLabels3 = ['', "0%", "4%", "94%", "3%"],
        //            xLabels4 = ['', "2%", "81%", "13%", "4%"];


        var data = {
            labels: xLabels1,
            datasets: [
                {
                    label: "table",
                    backgroundColor: 'rgba(255, 206, 86, 0.8)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    data: value,
                }
            ]
        };
        //***********************************************

        var node = document.createElement("canvas");
        node.className = "chart";
        node.id = 'leftBottomTable';

        var table = jQuery('<div/>')
            .css({
                'padding-left': '' + $('div#left').innerWidth() * 0.15 + 'px',
                //                height: '200px',
                'padding-right': '' + $('div#left').innerWidth() * 0.3 + 'px'
            })
            .append(node);

        node.style.height = '200px';
        //        node.style.width = $('div#right').innerWidth() + 'px';

        $('div#left').append(table);
        var ctx = node.getContext("2d");

        bottomLeftChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,

                scales: {
                    yAxes: [{
                        display: false,
                        gridLines: {
                            display: false
                        },
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            min: 0,
                            max: 5,
                            stepSize: 1,
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    displayColors: true,
                }
            }
        });

        //show up
        table.animate({
            opacity: 1,
        }, 'slow');
    }

    function leftTopTableSetting() {
        //********************************************************
        function dataCreate() {
            //            let prise = ['below', '650', '700', '750', '800', '850', '900', '950', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', 'above'];
            //            let prise = [600, 650, 700, 750, 800, 850, 900, 950, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800];
            let prise = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            //            let size = ["14\"", "15\"S1", "15\"S2", "16\""];
            let size = [1, 2, 3, 4];

            var result = {
                all: [],
                asus: []
            };
            for (var i in size) {
                for (var j in prise) {
                    let marketShare = Math.floor((Math.random() * 100) + 1),
                        asusShare = 0;

                    if (marketShare != 1) {
                        while (true) {
                            let tmp = Math.floor((Math.random() * 100) + 1);
                            if (tmp <= marketShare) {
                                asusShare = tmp;
                                break;
                            }
                        }
                    }

                    result.all.push({
                        x: size[i],
                        y: prise[j],
                        r: (marketShare / 4),
                        real: marketShare
                    });

                    result.asus.push({
                        x: size[i],
                        y: prise[j],
                        r: (asusShare / 4),
                        real: asusShare
                    });
                }
            }
            return result;
        }

        let result = dataCreate();
        console.log(result);
        var bubbleChartData = {
            // Documentation says the tick values tick.min & tick.max must be in the Labels array. So thats what I have below
            xLabels: ["", "14\"", "15\"S1", "15\"S2", "16\""],
            yLabels: ['below', '650', '700', '750', '800', '850', '900', '950', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', 'above'],

            yLabelsR1: ['13', '12', '14', '15', '4', '14', '3', '9', '19', '19', '26', '3', '2', '3', '0', '0', '13'],
            yLabelsR2: ['7', '4', '19', '19', '4', '19', '2', '3', '13', '6', '3', '0', '0', '0', '0', '0', '2'],
            yLabelsR3: ['6', '4', '16', '15', '12', '16', '8', '4', '8', '4', '1', '0', '1', '1', '0', '0', '2'],
            //                        yLabels: ['above', '1700', '1600', '1500', '1400', '1300', '1200', '1100', '1000', '950', '900', '850', '800', '750', '700', '650', 'below'],
            datasets: [
                {
                    label: "Asus share",
                    backgroundColor: "rgba(255, 255, 0, 0.8)",
                    borderColor: "rgba(255, 255, 0, 0.8)",
                    hoverRadius: 1,
                    data: result.asus
                },
                {
                    label: "Market share",
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderColor: "rgba(0, 0, 0, 0.2)",
                    data: result.all,
                    hoverRadius: 1,
                }

            ]
        };
        console.log(result.asus);
        console.log(result.all);
        //********************************************************

        var node = document.createElement("canvas");
        node.className = "chart";
        node.id = 'leftTopTable';

        var table = jQuery('<div/>')
            .css({
                height: '' + chartHeight + 'px',
                //                width: $('div#right').innerWidth()
            })
            .append(node);

        node.style.height = '' + chartHeight + 'px';
        //        node.style.width = $('div#right').innerWidth() + 'px';

        $('div#left').append(table);
        var ctx = node.getContext("2d");

        topLeftChart = new Chart(ctx, {
            type: 'bubble',
            data: bubbleChartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,

                scales: {
                    yAxes: [{
                        // will this create y-axis with days of week?
                        ticks: {
                            min: 0,
                            max: 18,
                            stepSize: 1,
                            callback: function (value) {
                                if (bubbleChartData.yLabels[parseInt(value)])
                                    return '' + bubbleChartData.yLabels[parseInt(value)];
                                else
                                    return '';
                            }
                        }
                    }, {
                        display: true,
                        position: "right",
                        id: "y-axis-2",
                        gridLines: {
                            drawBorder: false,
                            display: false
                        },
                        labels: {
                            show: true,
                        },
                        ticks: {
                            fontColor: "rgba(200,200,0,0.9)",
                            min: 0,
                            max: 18,
                            stepSize: 1,
                            callback: function (value) {
                                if (bubbleChartData.yLabelsR1[parseInt(value)])
                                    return '' + bubbleChartData.yLabelsR1[parseInt(value)] + ' %';
                                else
                                    return '';
                            }
                        }
                    }, {
                        display: true,
                        position: "right",
                        id: "y-axis-3",
                        gridLines: {
                            drawBorder: false,
                            display: false
                        },
                        labels: {
                            show: true,
                        },
                        ticks: {
                            fontColor: "rgba(250,50,50,0.9)",
                            min: 0,
                            max: 18,
                            stepSize: 1,
                            callback: function (value) {
                                if (bubbleChartData.yLabelsR2[parseInt(value)])
                                    return '' + bubbleChartData.yLabelsR2[parseInt(value)] + ' %';
                                else
                                    return '';
                            }
                        }
                    }, {
                        display: true,
                        position: "right",
                        id: "y-axis-4",
                        gridLines: {
                            drawBorder: false,
                            display: false
                        },
                        labels: {
                            show: true,
                        },
                        ticks: {
                            fontColor: "rgba(20,20,20,0.9)",
                            min: 0,
                            max: 18,
                            stepSize: 1,
                            callback: function (value) {
                                if (bubbleChartData.yLabelsR3[parseInt(value)])
                                    return '' + bubbleChartData.yLabelsR3[parseInt(value)] + ' %';
                                else
                                    return '';
                            }
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            min: 0,
                            max: 5,
                            stepSize: 1,
                            callback: function (value) {
                                if (bubbleChartData.xLabels[parseInt(value)])
                                    return '' + bubbleChartData.xLabels[parseInt(value)];
                                else
                                    return '';
                            }
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    displayColors: false,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var tooltips = new Array();
                            console.log(tooltipItem);
                            console.log(data);
                            let size = bubbleChartData.xLabels[parseInt(tooltipItem.xLabel)],
                                prise = bubbleChartData.yLabels[parseInt(tooltipItem.yLabel)];

                            for (var i in data.datasets) {
                                let tooltipStr = '[' + size + '/' + prise + '] in ' + data.datasets[i].label + ': ' + data.datasets[i].data[tooltipItem.index].real + ' %';
                                tooltips.push(tooltipStr);
                            }
                            return tooltips;
                        }
                    }
                }
            }
        });

        //show up
        table.animate({
            opacity: 1,
        }, 'slow');
    }

    function rightBottomTableSetting() {
        //***********************************************
        var dates = ["2016-02", "2016-03", "2016-04", "2016-05", "2016-06", "2016-07", "2016-08", "2016-09", "2016-10", "2016-11", "2016-12", "2017-01", "2017-02"],
            value = [150, 160, 128, 130, 238, 220, 296, 280, 289, 300, 187, 190, 352];


        var data = {
            labels: dates,
            datasets: [
                {
                    label: "table",
                    backgroundColor: 'rgba(255, 206, 86, 0.8)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    data: value,
        }
    ]
        };
        //***********************************************

        var node = document.createElement("canvas");
        node.className = "chart";
        node.id = 'rightBottomTable';

        var table = jQuery('<div/>')
            .css({
                height: '200px',
                //                width: $('div#right').innerWidth()
            })
            .append(node);

        //        node.style.height = '200px';
        //        node.style.width = $('div#right').innerWidth() + 'px';

        $('div#right').append(table);
        var ctx = node.getContext("2d");

        bottomRightChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,

                scales: {
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'K unit'
                        },
                        gridLines: {
                            display: false
                        },
                    }],
                    //                    xAxes: [{
                    //                        gridLines: {
                    //                            display: false
                    //                        },
                    //                        ticks: {
                    //                             min: 0,
                    //                            max: 5,
                    //                            stepSize: 1,
                    //                        }
                    //                    }]
                },
            }
            //            options: newOptions
        });

        //show up
        table.animate({
            opacity: 1,
        }, 'slow');
    }

    function rightTopTableSetting() {
        //--------------------------------------- 
        var size14 = [12, 12, 11, 12, 8, 8, 6, 4, 3, 4, 5, 3, 2];
        var size151S = [51, 44, 51, 53, 64, 65, 67, 68, 70, 76, 74, 80, 81]
        var size152S = [33, 40, 34, 31, 24, 24, 24, 25, 23, 15, 16, 13, 13];
        var size16 = [4, 3, 4, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4];
        var dates = ["2016-02", "2016-03", "2016-04", "2016-05", "2016-06", "2016-07", "2016-08", "2016-09", "2016-10", "2016-11", "2016-12", "2017-01", "2017-02"];
        //---------------------------------------



        var node = document.createElement("canvas");
        node.className = "chart";
        node.id = 'rightTopTable';

        var table = jQuery('<div/>')
            .css({
                height: '' + chartHeight + 'px',
                //                width: $('div#right').innerWidth()
            })
            .append(node);

        //        node.style.height = '' + chartHeight + 'px';
        //        node.style.width = $('div#right').innerWidth() + 'px';

        $('div#right').append(table);
        var ctx = node.getContext("2d");
        topRightChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: '14"',
                        data: size14,
                        backgroundColor: "rgba(55, 160, 225, 0.7)",
                        hoverBackgroundColor: "rgba(55, 160, 225, 0.7)",
                        hoverBorderWidth: 2,
                        hoverBorderColor: 'lightgrey'
                    },
                    {
                        label: '15"1S',
                        data: size151S,
                        backgroundColor: "rgba(225, 58, 55, 0.7)",
                        hoverBackgroundColor: "rgba(225, 58, 55, 0.7)",
                        hoverBorderWidth: 2,
                        hoverBorderColor: 'lightgrey'
                    },
                    {
                        label: '15"2S',
                        data: size152S,
                        backgroundColor: "rgba(0, 58, 55, 0.7)",
                        hoverBackgroundColor: "rgba(0, 58, 55, 0.7)",
                        hoverBorderWidth: 2,
                        hoverBorderColor: 'lightgrey'
                    },
                    {
                        label: '16"',
                        data: size16,
                        backgroundColor: "rgba(100, 0, 100, 0.7)",
                        hoverBackgroundColor: "rgba(100, 58, 100, 0.7)",
                        hoverBorderWidth: 2,
                        hoverBorderColor: 'lightgrey'
                    },
                ]
            },
            options: stackedBarOptions
        });
        //show up
        table.animate({
            opacity: 1,
        }, 'slow');
    }

    function chartDestroy() {
        //destroy old chart
        if (trendObj != null) {
            trendObj = null;
        }

        if (linechart != null) {
            linechart.destroy();
        }

        $('#activatiobDistributionTrendContainer').remove();
        $('#trendColorInfo').remove();
    }

    function chartResize() {
        topLeftChart.resize();
        topRightChart.resize();
        bottomLeftChart.resize();
        bottomRightChart.resize();
    }

    var module = {
        showChart: createChart,
        chartDestroy: chartDestroy,
        chartResize: chartResize,
    };

    return module;

}());
