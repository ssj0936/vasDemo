"use strict";

var trendParallel = (function (mapObj) {
    var TREND_COUNTRY_RATIO = 'trend_country_ratio',
        TREND_MODEL_RATIO = 'trend_model_ratio',
        TREND_MODEL_COUNT = 'trend_model_count',
        TREND_DISTI_COUNT = 'trend_disti_count',
        TREND_TARGET_COUNTRY_COUNT = 'trend_target_country_count';

    var TREND_COUNTRY_RATIO_DISPLAY = 'rate by Country',
        TREND_MODEL_RATIO_DISPLAY = 'rate by Model',
        TREND_MODEL_COUNT_DISPLAY = 'by Model',
        TREND_DISTI_COUNT_DISPLAY = 'by Disti',
        TREND_TARGET_COUNTRY_COUNT_DISPLAY;

    var BY_SENDING_COUNTRY = 'by Sending Country',
        BY_RECEVING_COUNTRY = 'by Receving Country';

//    var FILE_EXPORT_TYPE_IMPORT = FILE_EXPORT_TYPE_IMPORT,
//        FILE_EXPORT_TYPE_EXPORT = FILE_EXPORT_TYPE_EXPORT;

    var trendList = [TREND_COUNTRY_RATIO, TREND_MODEL_RATIO, TREND_MODEL_COUNT, TREND_DISTI_COUNT, TREND_TARGET_COUNTRY_COUNT];
    var trendNameList;
    var defaultTrendMode = trendList[0];
    var defaultTrendModeName;

    var activeTrend = defaultTrendMode;

    var rightPopupContainerWidthP = 0.84;
    var trendContainerWidthP = 0.8;

    function showChart(iso) {
        if (observeTarget.length > 0 && !mapObj.isEmpty) {
            //            loading("Creating Chart...");
            trendNameList = [TREND_COUNTRY_RATIO_DISPLAY, TREND_MODEL_RATIO_DISPLAY, TREND_MODEL_COUNT_DISPLAY, TREND_DISTI_COUNT_DISPLAY];
            defaultTrendModeName = trendNameList[0];
            _setActiveTrend(defaultTrendMode);
//            resetFilterStatus();
            scrollToTop();
            popupChartShow(true);
            if (isModeActive(MODE_PARALLEL_IMPORT)) {
                TREND_TARGET_COUNTRY_COUNT_DISPLAY = BY_SENDING_COUNTRY;
                trendNameList.push(TREND_TARGET_COUNTRY_COUNT_DISPLAY);
                ajaxParallelChart(iso, FILE_EXPORT_TYPE_IMPORT);
            } else if (isModeActive(MODE_PARALLEL_EXPORT)) {
                TREND_TARGET_COUNTRY_COUNT_DISPLAY = BY_RECEVING_COUNTRY;
                trendNameList.push(TREND_TARGET_COUNTRY_COUNT_DISPLAY);
                ajaxParallelChart(iso, FILE_EXPORT_TYPE_EXPORT);
            }
        }
    }

    function _createFunctionalBtn() {
        var container = jQuery('<div/>', {
                id: "functionalBtnContainer",
            })        
            //export Btn
            .append(
                jQuery('<button/>', {
                    id: "btnExport",
                    class: " btn btn-default trendFunctionBtn",
                    type:"button"
                })
                .text('EXPORT FILE')
                .click(function () {
                    if (_getActiveTrend() == TREND_COUNTRY_RATIO || _getActiveTrend() == TREND_MODEL_RATIO)
                        return exportFile(_getActiveTrend(), true);
                    else
                        return exportFile(_getActiveTrend(), false);
                })
            )

        return container;
    }

    function updateParallelChart(json, iso) {
        if (json.countryFlowRatio.length == 0) return;

        if (linechart != null) {
            linechart.destroy();
        }

        var container = $('#popupChartContainer');

        //title container
        var title = jQuery('<div/>', {
                id: 'lineChartTitle',
            })
            .css({
                'top': '' + getWindowHeightPercentagePx(0.1) + 'px',
            })
            .appendTo(container);

        _createFunctionalBtn().appendTo(title);

        var parallelMode = isModeActive(MODE_PARALLEL_IMPORT) ? 'Import' : 'Export';
        //title content
        jQuery('<div/>', {
                id: "currentTrendTitle",
                class: 'w3-padding-4',
            })
            .css('text-align', 'left')
            .append(
                jQuery('<p/>', {
                    'id': 'option'
                })
                .text(parallelMode + ' ' + defaultTrendModeName)
                .css({
                    'margin': '0px',
                    'display': 'inline-block',
                    'font-size': 'x-large',
                })
            )
            .append(
                jQuery('<span/>', {
                    class: 'trendIconDowu',
                })
            )
            .click(
                function () {
                    $('#trendOptionContainer').stop(true, true).slideToggle('medium');

                    var icon = $('#currentTrendTitle span');
                    if (icon.hasClass('trendIconDowu'))
                        icon.removeClass('trendIconDowu').addClass('trendIconUp');
                    else
                        icon.removeClass('trendIconUp').addClass('trendIconDowu');
                }
            )
            .appendTo(title);

        //option
        var optionContainer = jQuery('<div/>', {
                id: 'trendOptionContainer',
            })
            .css('position', 'absolute')
            .appendTo(title).hide();

        for (var i in trendList) {
            var parallelMode = isModeActive(MODE_PARALLEL_IMPORT) ? 'Import' : 'Export';

            jQuery('<div/>', {
                    id: 'trendByParallel' + trendList[i],
                    class: "w3-padding-4 w3-center",
                })
                .css({
                    'border-radius': (i == trendList.length - 1) ? '0px 0px 10px 10px' : '0px',
                    'margin-bottom': (i == trendList.length - 1) ? '0px' : '5px',
                })
                .html('<h4>' + parallelMode + ' ' + trendNameList[i] + '</h4>')
                .appendTo(optionContainer)
                .click(function (index) {
                    return function () {
                        if (_getActiveTrend() == trendList[index]) {
                            //menu close
                            $('#trendOptionContainer').stop(true, true).slideToggle('medium');
                            return;
                        }

                        _setActiveTrend(trendList[index]);
                        //if trendcontainer hide, show it
                        if ($('#trendContainer').is(':hidden'))
                            $('#trendContainer').slideDown('medium');

                        //table remove
                        $('#table_wrapper').remove();

                        $('#trendContainer').css({
                            'opacity': 0
                        });

                        createChart(json, trendList[index]);

                        $('#currentTrendTitle p#option').text(parallelMode + ' ' + trendNameList[index]);
                        $('#trendContainer').fadeTo(300, 1);

                        //menu close
                        $('#trendOptionContainer').stop(true, true).slideToggle('medium');
                    }
                }(i));
        }
        //        var filterDisplayer = createFilterResult();
        //        filterDisplayer.appendTo(leftPopup);

        //chart
        createChart(json, defaultTrendMode);
    }

    function createChart(json, trendMode) {
        //data reset
        chartDestroy(true);
        //fetch data
        trendObj = new lineDataObj();
        setTrendLable(json);


        switch (trendMode) {
        case TREND_COUNTRY_RATIO:
            setTrendData(json.countryFlowRatio);
            createChartElement(percentageOptions);
            break;

        case TREND_MODEL_RATIO:
            setTrendData(json.modelFlowRatio);
            createChartElement(percentageOptions);
            break;

        case TREND_MODEL_COUNT:
            setTrendData(json.modelFlowCount);
            createChartElement();
            break;

        case TREND_DISTI_COUNT:
            setTrendData(json.distFlowCount);
            createChartElement();
            break;

        case TREND_TARGET_COUNTRY_COUNT:
            setTrendData(json.targetCountryFlowCount);
            createChartElement();
            break;
        }

        _setActiveTrend(trendMode);
        //updateColorInfo();
        loadingDismiss();
    }

    function setTrendLable(json) {
        var startDate = json.timeRange.start + '-1';
        var endDate = json.timeRange.end + '-1';
        var tmpDate = startDate;
        //label by month
        while (parseDate(tmpDate) < parseDate(endDate)) {
            var date = (getBrowser() == BROWSER_IE) ? NewDate(tmpDate, '-') : new Date(tmpDate);
            var label = date.getFullYear() + '-' + (date.getMonth() + 1);
            console.log(label);
            trendObj.labelsByMonth.push(label);

            var nextMonth = (getBrowser() == BROWSER_IE) ? NewDate(tmpDate, '-') : new Date(tmpDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            tmpDate = parseDateToStr(nextMonth);

        }
        var date = (getBrowser() == BROWSER_IE) ? NewDate(endDate, '-') : new Date(endDate);
        var label = date.getFullYear() + '-' + (date.getMonth() + 1);
        trendObj.labelsByMonth.push(label);

        trendObj.labels = trendObj.labelsByMonth;
        trendObj.labels.push("");
        console.log(trendObj.labels);
    }

    function setTrendData(jsonObj) {
        //clean
        trendObj.datasets.length = 0;


        var jsonArray = Object.keys(jsonObj);
        for (var index in jsonArray) {
            var name = jsonArray[index];
            var data = jsonObj[name];

            var color = getRandomColor();
            var highlight = ColorLuminance(color, 0.5);
            var transparentColor = colorHexToRGBString(color, 0.2);
            var dataset = new lineDatasetsObj(name, transparentColor, color, highlight, false);

            //second 
            //group by month
            var currentM = null;
            var currentY = null;
            var sumInThatMonth = 0;
            var first = true;

            for (var i = 0; i < trendObj.labelsByMonth.length; ++i) {
                var date = trendObj.labelsByMonth[i];

                var find = data.filter(function (obj) {
                    return obj.date == date;
                });
                if (find == false) {
                    dataset.dataByMonth.push(0);
                } else {
                    dataset.dataByMonth.push(find[0].value);
                }
            }

            dataset.data = dataset.dataByMonth;
            trendObj.datasets.push(dataset);
        }
    }

    function createChartElement(opt) {
        trendObjOriginal = jQuery.extend(true, {}, trendObj);

        var node = document.createElement("canvas");
        node.className = "chart";
        node.id = 'trendChart';

        var container = jQuery('<div/>', {
                class: 'customScrollBar',
            })
            .css({
                //                "position": "absolute",
                "top": "" + getWindowHeightPercentagePx(0.3) + 'px',
                "left": "2%",
                "width": "100%",
                'border': '10px solid rgba(255,255,255,0)',
                "overflow-y": "hidden",
                "display": "inline-block",
            })
            .attr('id', 'trendContainer')
            .append(jQuery('<div/>', {
                    id: "chartSide"
                })
                .css({
                    'width': '80%',
                    'height': '500px',
                    'display': 'inline-block',
                    'vertical-align': 'top'
                })
                .append(node)
            )
            .append(jQuery('<div/>', {
                    id: "legendSide",
                    class: 'customScrollBar',
                })
                .css({
                    'width': '20%',
                    //                    'height': '' + chartHeight + 'px',
                    'display': 'inline-block',
                    'vertical-align': 'top'
                })
            ).appendTo($('#popupChartContainer'));

        //width cal
        //        var labelCount = trendObj.labels.length;
        //        var tmpSpacing = (trendContainerWidthR - axisWidth) / (labelCount + 1);
        //        var spacing = (tmpSpacing < chartSpacing) ? chartSpacing : tmpSpacing;
        //
        //        node.style.height = '' + chartHeight + 'px';
        //        node.style.width = (axisWidth + spacing * trendObj.labels.length > 32500) ? ('32500px') : '' + (axisWidth + spacing * trendObj.labels.length) + 'px';

        var ctx = node.getContext("2d");
        linechart = new Chart(ctx, {
            type: 'line',
            data: trendObj,
            options: (opt ? opt : newOptions)
        });

        legendCreate(linechart);
    }

    function legendCreate(linechart) {
        //seperate legend
        var legend = linechart.generateLegend();
        $('#legendSide').append(jQuery('<div/>', {
            class: 'customScrollBar',
        }).css({
            'height': '' + chartHeight + 'px',
        }).html(legend));

        //need to re-organize legend
        if (_getActiveTrend() == TREND_DISTI_COUNT) {

            var countryList = [];

            $('#legendSide ul li').each(function () {
                var countryName = $(this).text().split("_")[0];
                if (!isInArray(countryList, countryName))
                    countryList.push(countryName);
            });

            //            console.log(countryList);

            var ulList = [];
            for (var i in countryList) {
                var currentCountryName = countryList[i];
                var ul = jQuery('<ul/>', {
                    'data-country': currentCountryName
                });

                $('#legendSide ul li').each(function () {
                    var countryName = $(this).text().split("_")[0];
                    if (currentCountryName == countryName) {
                        jQuery('<li/>').html($(this).html()).appendTo(ul);
                    }
                });

                ulList.push(ul);
            }

            //rebuild legend
            $('#legendSide ul').empty();

            //legend selector
            var selectorBody = jQuery('<ul/>', {
                class: "dropdown-menu",
                role: "menu"
            });

            for (var i in countryList) {
                jQuery('<li/>').append(jQuery('<a/>', {
                    href: "#"
                }).text(countryList[i])).appendTo(selectorBody);
            }
            selectorBody.prepend(
                jQuery('<li/>').append(jQuery('<a/>', {
                    href: "#"
                }).text('All'))
            );

            $('#legendSide').prepend(
                jQuery('<div/>', {
                    class: "btn-group",
                    id: 'legendSelector'
                }).append(
                    jQuery('<button/>', {
                        type: "button",
                        id: 'legendSelectorButton',
                        class: "btn btn-default dropdown-toggle",
                        'data-toggle': "dropdown"
                    })
                    .html('All <span class="caret"></span>')
                ).append(selectorBody)
            );

            $("#legendSelector .dropdown-menu li").click(function () {
                //                console.log($(this).text());
                $('#legendSelectorButton').html($(this).text() + '<span class="caret"></span>');
                var country = $(this).text();
                $('ul[class$="-legend"] li').each(function () {
                    var target = $(this).text();
                    //                    console.log(target);
                    //show
                    if (target.split("_")[0] == country || country == 'All') {
                        $(this).css({
                            'text-decoration': 'none',
                            'text-decoration-line': 'none',
                            'opacity': '1',
                        });

                        //adding dataset back
                        for (var i in trendObjOriginal.datasets) {
                            if (trendObjOriginal.datasets[i].label == target && !isInArray(trendObj.datasets, trendObjOriginal.datasets[i])) {
                                trendObj.datasets.push(trendObjOriginal.datasets[i]);
                                break;
                            }
                        }
                    } else {
                        $(this).css({
                            'text-decoration': 'line-through',
                            'text-decoration-line': 'line-through',
                            'opacity': '0.3',
                        });

                        //remove dataset 
                        for (var i in trendObj.datasets) {
                            if (trendObj.datasets[i].label == target) {
                                trendObj.datasets.splice(i, 1);
                                break;
                            }
                        }
                    }
                    linechart.update();

                });
            });

            //legend
            for (var i in ulList) {
                $('#legendSide ul[class$="-legend"]').append(
                    jQuery('<li/>', {
                        'data-country': ulList[i].attr('data-country'),
                        class: 'lagendGroup'
                    }).html('<b>' + ulList[i].attr('data-country') + '</b>')
                );
                $('#legendSide ul[class$="-legend"]').append(ulList[i]);
            }

            //click listener setting
            $('ul[class$="-legend"] li').click(function () {

                var needToShow;
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

                var attr = $(this).attr('data-country');

                //click target is country
                if (typeof attr !== typeof undefined && attr !== false) {
                    // adding/remove the deleteline 
                    $(this).next('ul').children('li').each(function () {
                        var target = $(this).text();
                        if (needToShow) {
                            //remove the delete line
                            $(this).css({
                                'text-decoration': 'none',
                                'text-decoration-line': 'none',
                                'opacity': '1',
                            });

                            //adding dataset back
                            for (var i in trendObjOriginal.datasets) {
                                if (trendObjOriginal.datasets[i].label == target && !isInArray(trendObj.datasets, trendObjOriginal.datasets[i])) {
                                    trendObj.datasets.push(trendObjOriginal.datasets[i]);
                                    break;
                                }
                            }
                        } else {
                            //adding the delete line
                            $(this).css({
                                'text-decoration': 'line-through',
                                'text-decoration-line': 'line-through',
                                'opacity': '0.3',
                            });

                            //remove dataset 
                            for (var i in trendObj.datasets) {
                                if (trendObj.datasets[i].label == target) {
                                    trendObj.datasets.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });
                    linechart.update();
                }
                //click target is dist
                else {
                    var target = $(this).text();
                    if (needToShow) {
                        for (var i in trendObjOriginal.datasets) {
                            if (trendObjOriginal.datasets[i].label == target && !isInArray(trendObj.datasets, trendObjOriginal.datasets[i])) {
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

                    //need to check all li in this ul are all same status
                    //if is, effect the parent level
                    var isAllSameStatus = true;
                    var status = $(this).css('text-decoration-line');
                    //                    console.log(status);

                    $(this).parent('ul').children('li').each(function () {
                        if ($(this).css('text-decoration-line') != status)
                            isAllSameStatus = false;
                    });
                    //                    console.log(isAllSameStatus);
                    if (isAllSameStatus) {
                        if (status == 'line-through') {
                            $(this).parent('ul').prev('li').css({
                                'text-decoration': 'line-through',
                                'text-decoration-line': 'line-through',
                                'opacity': '0.3',
                            })
                        } else if (status == 'none') {
                            $(this).parent('ul').prev('li').css({
                                'text-decoration': 'none',
                                'text-decoration-line': 'none',
                                'opacity': '1',
                            })
                        }
                    }


                    linechart.update();
                }

            });

        } else {
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
    }

    function exportFile(ReportTitle, addPercentageMark) {
        console.log(trendObj.datasets);

        var style = 'style="border:1px solid black"';
        var exportArray = [];
        for (var i in trendObj.labels) {
            var date = trendObj.labels[i];
            if (date == '') continue;

            var Obj = {
                "date": date
            };
            for (var j in trendObj.datasets) {
                var label = trendObj.datasets[j].label;
                var countAtThatDay = trendObj.datasets[j].data[i] + (addPercentageMark ? " %" : "");
                Obj[label] = countAtThatDay;
            }
            exportArray.push(Obj);
        }
        console.log(exportArray);
        var arrData = exportArray;
        var HTMLTableStr = '';
        //Set Report title in first row or line

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

    function chartDestroy(dataNeedToSetNull) {
        //destroy old chart
        if (dataNeedToSetNull) {
            if (trendObj != null) {
                trendObj = null;
            }
        }

        if (linechart != null) {
            linechart.destroy();
        }

        $('#trendContainer').remove();
        $('#trendColorInfo').remove();
    }

    function _getActiveTrend() {
        return activeTrend;
    }

    function _setActiveTrend(mode) {
        activeTrend = mode;
    }

    function parallelReportExportDialogShow() {

        if (getFunction() != FUNC_PARALLEL) return;

        var exportTypeDialogDiv = ($('#exportTypeDialogDiv').length == 0) ?
            (jQuery('<div/>', {
                id: 'exportTypeDialogDiv'
            }).html('<b>Select export type:</b>').appendTo($('#popupChartContainer'))) :
            ($('#exportTypeDialogDiv'));
        exportTypeDialogDiv.dialog({
            modal: true,
            resizable: false,
            width: 500,
            show: {
                effect: "blind",
                duration: 100
            },
            buttons: {
                'Parallel Import': function () {
                    console.log('Parallel Import');
                    ajaxParallelExport(FILE_EXPORT_TYPE_IMPORT);
                    $(this).dialog('close');
                },
                'Parallel Export': function () {
                    console.log('Parallel Export');
                    ajaxParallelExport(FILE_EXPORT_TYPE_EXPORT);
                    $(this).dialog('close');
                },
            }
        });
        exportTypeDialogDiv.dialog('open');
    }

    var module = {
        showChart: showChart,
        updateParallelChart: updateParallelChart,
        parallelReportExport: parallelReportExportDialogShow,
    };

    return module;

}(firstMap));