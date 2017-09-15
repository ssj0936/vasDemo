"use strict";

var activationTrend = (function () {

    var linechart = null,
        trendObj = null;

    var rightPopupContainerWidthP = 0.84;
    var trendContainerWidthP = 0.8;
    var chartHeight = 500;
    var chartSpacing = 30;

    var rankCount = 0;
    var rangeUpperBound = 0;
    var rangelowerBound = 0;
    var jsonData = null;
    var allLineDataset = [];

    function createChart(json) {
        jsonData = json;
        //        console.log(jsonData);
        //data reset
        chartDestroy();
        if (observeTarget.length != 0 && jsonData.length != 0) {
            trendObj = new lineDataObj();
            setRankSelector();

            //fetch data
            setTrendLable();
            setTrendData();
            trendObjOriginal = jQuery.extend(true, {}, trendObj);
            createChartElement();
            loadingDismiss();
        } else {
            trendObj = null;
            trendObjOriginal = null;
            showToast('No data');
            enableFuncSelector();
        }

    }

    function setRankSelector() {
        rankCount = parseInt(jsonData[jsonData.length - 1].rank);

        $('#showSelectorUl').empty();
        for (var i = 1; i <= rankCount; i += 5) {
            var upperbound = (4 + i > rankCount) ? rankCount : (4 + i);
            //            console.log('' + i + '~' + upperbound);
            jQuery('<li/>', {
                    class: 'showSelector',
                    'data-rankLowerBound': i,
                    'data-rankUpperBound': upperbound,
                })
                .append('<a href="#">' + ((i == 1) ? ('Top 5') : ('Top ' + i + ' ~ ' + upperbound)) + '</a>')
                .appendTo($('#showSelectorUl'));

            if (i == 1) {
                rangeUpperBound = upperbound;
                rangelowerBound = i;
            }
        }

        activationTrendControlPanel.rankSelectorListenerSetting();
        //        rangeUpperBound = parseInt($('#showSelectorUl').find(":selected").attr('data-rankupperbound'));
        //        rangelowerBound = parseInt($('#showSelectorUl').find(":selected").attr('data-ranklowerbound'));
    }

    function newRange(lowerbound, upperbound) {
        $('#activationTrendContainer').remove();
        rangeUpperBound = parseInt(upperbound);
        rangelowerBound = parseInt(lowerbound);
        console.log('' + rangelowerBound + ' ~ ' + rangeUpperBound);

        trendObj.datasets.length = 0;
        for (var currentRank = rangelowerBound; currentRank <= rangeUpperBound; ++currentRank) {
            if ((allLineDataset[currentRank - 1]).label != 'null')
                trendObj.datasets.push(allLineDataset[currentRank - 1]);
        }
        addingTotalLine();
        //clone
        trendObjOriginal = jQuery.extend(true, {}, trendObj);

        legendSetting();
        switchTimescale(currentTrendTimescale);
        loadingDismiss();
    }

    function setTrendLable() {
        var endDate = jsonData[0].date,
            endDateObj = new Date(jsonData[0].date);
        var startDate = jsonData[0].date,
            startDateObj = new Date(jsonData[0].date);
        jsonData.forEach(function (obj, index) {
            if (new Date(obj.date) > endDateObj) {
                endDate = obj.date;
                endDateObj = new Date(obj.date);
            }
            if (new Date(obj.date) < startDateObj) {
                startDate = obj.date;
                startDateObj = new Date(obj.date);
            }
        });
        var tmpDate = startDate;

        //label by date
        while (parseDate(tmpDate) < parseDate(endDate)) {
            trendObj.labelsByDate.push(tmpDate);

            var tomorrow = new Date(tmpDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tmpDate = parseDateToStr(tomorrow);

        }
        trendObj.labelsByDate.push(endDate);

        //label by month
        var currentM = null;
        var currentY = null;
        for (var i in trendObj.labelsByDate) {
            var date = trendObj.labelsByDate[i];
            var d = new Date(date);
            var year = d.getFullYear();
            var month = d.getMonth() + 1;

            if (currentM != month || currentY != year) {
                trendObj.labelsByMonth.push(year + '-' + month);
                currentM = month;
                currentY = year;
            }
        }

        //label by week
        var currentW = null;
        var currentY = null;
        for (var i in trendObj.labelsByDate) {
            var date = trendObj.labelsByDate[i];
            var d = new Date(date);
            var weekAndYear = getWeekNumber(d);
            var year = weekAndYear.year;
            var week = weekAndYear.weekNumber;

            if (currentW != week || currentY != year) {
                trendObj.labelsByWeek.push(weekAndYear.lastDayOfWeek);
                currentW = week;
                currentY = year;
            }
        }
        //        console.log(trendObj.labelsByDate);
        //        console.log(trendObj.labelsByMonth);
        //        console.log(trendObj.labelsByWeek);

        labelChange(currentTrendTimescale);
    }

    function labelChange(chanegTo) {
        switch (chanegTo) {
            case MODE_ACTIVATION_TREND_TIMESCALE_DAY:
                trendObj.labels = trendObj.labelsByDate.slice();
                break;
            case MODE_ACTIVATION_TREND_TIMESCALE_MONTH:
                trendObj.labels = trendObj.labelsByMonth.slice();
                break;
            case MODE_ACTIVATION_TREND_TIMESCALE_WEEK:
                trendObj.labels = trendObj.labelsByWeek.slice();
                break;
        }
    }

    function setTrendData() {
        //clean
        trendObj.datasets.length = 0;
        allLineDataset.length = 0;
        for (var currentRank = 1; currentRank <= rankCount; ++currentRank) {
            var find = jsonData.filter(function (obj) {
                return obj.rank == currentRank;
            })

            if (find == false) {
                console.log('no rank:' + currentRank);
                var name = 'null';
                //                var data = find;

                var color = getRandomColor();
                var highlight = ColorLuminance(color, 0.5);
                var transparentColor = colorHexToRGBString(color, 0.1);
                var dataset = new lineDatasetsObj(name, transparentColor, color, highlight, false);
                dataset.dataByDate = [];
                dataset.dataByMonth = [];
                dataset.dataByWeek = [];
                allLineDataset.push(dataset);
            } else {
                //                console.log(find);
                var name = getModelDisplayName(find[0].name);
                var data = find;

                var color = getRandomColor();
                var highlight = ColorLuminance(color, 0.5);
                var transparentColor = colorHexToRGBString(color, 0.1);
                var dataset = new lineDatasetsObj(name, transparentColor, color, highlight, false);

                //first
                //handle the data group by date 
                var DateIndex = 0
                for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
                    if (DateIndex < data.length && trendObj.labelsByDate[i] == data[DateIndex].date) {
                        dataset.dataByDate.push(data[DateIndex].count);
                        ++DateIndex;
                    } else {
                        dataset.dataByDate.push(0);
                    }
                }

                //second 
                //group by month
                var currentM = null;
                var currentY = null;
                var sumInThatMonth = 0;
                var first = true;

                for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
                    var date = trendObj.labelsByDate[i];
                    var cnt = dataset.dataByDate[i];

                    var d = new Date(date);
                    var year = d.getFullYear();
                    var month = d.getMonth() + 1;

                    if (currentM != month || currentY != year) {
                        if (first) {
                            first = false;
                        } else {
                            dataset.dataByMonth.push(sumInThatMonth);
                            sumInThatMonth = 0;
                        }
                        currentM = month;
                        currentY = year;
                    }

                    sumInThatMonth += cnt;
                }
                //last one
                dataset.dataByMonth.push(sumInThatMonth);


                //thrid 
                //group by week
                var currentW = null;
                var currentY = null;
                var sumInThatWeek = 0;
                var first = true;

                for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
                    var date = trendObj.labelsByDate[i];
                    var cnt = dataset.dataByDate[i];

                    var d = new Date(date);
                    var weekAndYear = getWeekNumber(d);
                    var year = weekAndYear.year;
                    var week = weekAndYear.weekNumber;

                    if (currentW != week || currentY != year) {
                        if (first) {
                            first = false;
                        } else {
                            dataset.dataByWeek.push(sumInThatWeek);
                            sumInThatWeek = 0;
                        }
                        currentW = week;
                        currentY = year;
                    }

                    sumInThatWeek += cnt;
                }
                //last one
                dataset.dataByWeek.push(sumInThatWeek);

                allLineDataset.push(dataset);
                //                trendObj.datasets.push(dataset);
            }
        }

        for (var currentRank = rangelowerBound; currentRank <= rangeUpperBound; ++currentRank) {
            if ((allLineDataset[currentRank - 1]).label != 'null')
                trendObj.datasets.push(allLineDataset[currentRank - 1]);
        }

        addingTotalLine();

        switch (currentTrendTimescale) {

            case MODE_ACTIVATION_TREND_TIMESCALE_DAY:
                for (var i in trendObj.datasets) {
                    trendObj.datasets[i].data = trendObj.datasets[i].dataByDate;
                }
                break;
            case MODE_ACTIVATION_TREND_TIMESCALE_WEEK:
                for (var i in trendObj.datasets) {
                    trendObj.datasets[i].data = trendObj.datasets[i].dataByWeek;
                }
                break;
            case MODE_ACTIVATION_TREND_TIMESCALE_MONTH:
                for (var i in trendObj.datasets) {
                    trendObj.datasets[i].data = trendObj.datasets[i].dataByMonth;
                }
                break;
        }
        //        console.log(allLineDataset);
        //        console.log(trendObj);
    }

    function addingTotalLine() {
        var totalData = trendObj.datasets;

        //    console.log(totalData);
        var color = getRandomColor();
        var highlight = ColorLuminance(color, 0.5);
        var transparentColor = colorHexToRGBString(color, 0.1);

        var totalLineName = (allLineDataset.length > 5) ? 'Subtotal' : 'Total';

        totalDataset = new lineDatasetsObj(totalLineName, transparentColor, color, highlight, false);

        //by day
        for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
            var sum = 0;
            for (var j = 0; j < trendObj.datasets.length; ++j) {
                sum += trendObj.datasets[j].dataByDate[i];
            }
            totalDataset.dataByDate.push(sum);
        }

        //by day
        for (var i = 0; i < trendObj.labelsByWeek.length; ++i) {
            var sum = 0;
            for (var j = 0; j < trendObj.datasets.length; ++j) {
                sum += trendObj.datasets[j].dataByWeek[i];
            }
            totalDataset.dataByWeek.push(sum);
        }

        //by day
        for (var i = 0; i < trendObj.labelsByMonth.length; ++i) {
            var sum = 0;
            for (var j = 0; j < trendObj.datasets.length; ++j) {
                sum += trendObj.datasets[j].dataByMonth[i];
            }
            totalDataset.dataByMonth.push(sum);
        }

        trendObj.datasets.push(totalDataset);
        //    console.log(totalDataset);
    }


    function createChartElement() {
        var node = document.createElement("canvas");
        node.className = "chart";
        node.id = 'trendChart';

        //width cal
        var labelCount = trendObj.labels.length;
        var tmpSpacing = (trendContainerWidthR - axisWidth) / (labelCount + 1);
        var spacing = (tmpSpacing < chartSpacing) ? chartSpacing : tmpSpacing;
        
//        console.log($('#mapContainer').height());
        //        console.log($('#mapContainer').height());
        var container = jQuery('<div/>', {
                class: 'customScrollBar',
            })
            .attr('id', 'activationTrendContainer')
            .append(jQuery('<div/>', {
                    id: "chartSide",
                    class: "customScrollBar",
                })
                .append(
                    jQuery('<div/>', {
                        id: "chartBody"
                    })
                    .css({
                        width: ((axisWidth + spacing * trendObj.labels.length > 30000) ? ('30000px') : '' + (axisWidth + spacing * trendObj.labels.length) + 'px'),
                    })
                    .append(node))


            )
            .append(jQuery('<div/>', {
                    id: "legendSide",
                    class: 'customScrollBar',
                })
                //                .css({
                //                    'height': '' + containerHeight + 'px',
                //                })
            );

        
        setTimeout(function () {
            let containerHeight = $('#mapContainer').height() - 50;
            console.log(containerHeight);
            node.style.height = '' + containerHeight + 'px';
            node.style.width = (axisWidth + spacing * trendObj.labels.length > 30000) ? ('30000px') : '' + (axisWidth + spacing * trendObj.labels.length) + 'px';

            $('#tableContainer').append(container);
            //        console.log(trendObj);
            var ctx = node.getContext("2d");
            linechart = new Chart(ctx, {
                type: 'line',
                data: trendObj,
                options: newOptions
            });

            legendSetting();
            //show up
            container.animate({
                opacity: 1,
            }, 'slow');
        }, 300);


    }

    function legendSetting() {
        //seperate legend
        var legend = linechart.generateLegend();
        $('#legendSide').html(legend);
        $('#legendSide li').click(function () {

            var needToShow;
            var target = $(this).text();
            if ($(this).css('text-decoration-line') == 'line-through' || $(this).css('text-decoration') == 'line-through') {
                needToShow = true;
                $(this).css({
                    'text-decoration': 'none',
                    'text-decoration-line': 'none',
                    'opacity': '1',
                });
            } else if ($(this).css('text-decoration-line') == 'none' || $(this).css('text-decoration') == 'none') {
                needToShow = false;
                $(this).css({
                    'text-decoration': 'line-through',
                    'text-decoration-line': 'line-through',
                    'opacity': '0.3',
                });
            }

            if (needToShow) {
                for (var i in trendObjOriginal.datasets) {
                    if (trendObjOriginal.datasets[i].label == target) {
                        trendObj.datasets.push(trendObjOriginal.datasets[i]);
                        break;
                    }
                }
            } else {
                for (var i in trendObj.datasets) {
                    if (trendObj.datasets[i].label == target) {
                        trendObj.datasets.splice(i, 1);
                        break;
                    }
                }
            }
            linechart.update();
        });
    }

    function chartDestroy() {
        //destroy old chart
        if (trendObj != null) {
            trendObj = null;
        }

        if (linechart != null) {
            linechart.destroy();
        }

        $('#activationTrendContainer').remove();
        $('#trendColorInfo').remove();
    }

    function switchTimescale(scale) {
        //        console.log(trendObj);
        //        console.log(trendObjOriginal);
        trendObj = jQuery.extend(true, {}, trendObjOriginal);
        labelChange(scale);
        switch (scale) {

            case MODE_ACTIVATION_TREND_TIMESCALE_DAY:
                for (var i in trendObj.datasets) {
                    trendObj.datasets[i].data = trendObj.datasets[i].dataByDate;
                }
                break;
            case MODE_ACTIVATION_TREND_TIMESCALE_WEEK:
                for (var i in trendObj.datasets) {
                    trendObj.datasets[i].data = trendObj.datasets[i].dataByWeek;
                }
                break;
            case MODE_ACTIVATION_TREND_TIMESCALE_MONTH:
                for (var i in trendObj.datasets) {
                    trendObj.datasets[i].data = trendObj.datasets[i].dataByMonth;
                }
                break;
        }
        if (linechart != null) {
            linechart.destroy();
        }

        $('#activationTrendContainer').remove();
        createChartElement();
    }

    function exportFile() {
        console.log(trendObj.datasets);

        var style = 'style="border:1px solid black"';
        var exportArray = [];
        for (var i in trendObj.labels) {
            var date = trendObj.labels[i];
            if (date == '') continue;

            var Obj = {
                "date": date
            };
            var timescale = (currentTrendTimescale == MODE_ACTIVATION_TREND_TIMESCALE_DAY) ? 'dataByDate' :
                (currentTrendTimescale == MODE_ACTIVATION_TREND_TIMESCALE_WEEK) ? 'dataByWeek' : 'dataByMonth';
            for (var j in allLineDataset) {
                var label = allLineDataset[j].label;
                if (label == 'null') continue;
                var countAtThatDay = allLineDataset[j][timescale][i];

                Obj[label] = countAtThatDay;
            }
            exportArray.push(Obj);
        }
        console.log(exportArray);
        var arrData = exportArray;
        var HTMLTableStr = '';
        var timeperiod = firstMap.fromFormatStr + '~' + firstMap.toFormatStr;
        var trendby = (currentTrendBy == MODE_ACTIVATION_TREND_BY_MODEL) ? 'Model' : (currentTrendBy == MODE_ACTIVATION_TREND_BY_DEVICE) ? 'Device' : (currentTrendLevel == MODE_ACTIVATION_TREND_LEVEL_COUNTRY) ? 'Country' : (currentTrendLevel == MODE_ACTIVATION_TREND_LEVEL_BRANCH) ? 'Branch' : (currentTrendLevel == MODE_ACTIVATION_TREND_LEVEL_L1) ? 'L1' : 'L2';

        var timeGroupby = (currentTrendTimescale == MODE_ACTIVATION_TREND_TIMESCALE_DAY) ? 'Day' :
            (currentTrendTimescale == MODE_ACTIVATION_TREND_TIMESCALE_WEEK) ? 'Week' : 'Month';
        //Set Report title in first row or line

        var ReportTitle = timeperiod + '_' + trendby + '_' + timeGroupby;

        HTMLTableStr += '<table>';
        HTMLTableStr += '<tr><td>' + ReportTitle + '</td></tr>';
        var row = "";
        for (var index in arrData[0]) {
            //Now convert each value to string and comma-seprated
            row += '<td ' + style + '>' + index + '</td>';
        }
        row = '<tr>' + row + '</tr>';

        //append Label row with line break
        HTMLTableStr += row;

        for (var i = 0; i < arrData.length; i++) {
            var row = "";

            for (var index in arrData[i]) {
                row += '<td ' + style + '>' + arrData[i][index] + '</td>';
            }
            row = '<tr>' + row + '</tr>';
            //add a line break after each row
            HTMLTableStr += row;
        }
        HTMLTableStr += '</table>';

        if (HTMLTableStr == '') {
            alert("Invalid data");
            return;
        }

        var blob = new Blob([HTMLTableStr], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8,%EF%BB%BF"
        });
        var fileName = "MyReport_";
        fileName += ReportTitle.replace(/ /g, "_") + '.xls';
        saveAs(blob, fileName);
    }

    var module = {
        showChart: createChart,
        chartDestroy: chartDestroy,
        newRange: newRange,
        switchTimescale: switchTimescale,
        exportFile: exportFile,
    };

    return module;

}());
