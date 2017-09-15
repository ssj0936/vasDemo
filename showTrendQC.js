"use strict";

var trendQC = (function (mapObj) {
    var TREND_BY_MODEL = 'trend_by_model',
        TREND_BY_DEVICE = 'trend_by_device',
        TREND_BY_COUNTRY = 'trend_by_country',
        TREND_BY_REGION = 'trend_by_region',
        TREND_BY_VIEW = 'trend_by_view';

    var TREND_BY_MODEL_DISPLAY = 'Trend by Model',
        TREND_BY_DEVICE_DISPLAY = 'Trend by Model(RAM/ROM)',
        TREND_BY_COUNTRY_DISPLAY = 'Trend by Country',
        TREND_BY_VIEW_DISPLAY = 'Trend by Module';

    var FILE_EXPORT_TYPE_IMPORT = 'Import',
        FILE_EXPORT_TYPE_EXPORT = 'Export';

    var trendList,
        trendNameList,
        defaultTrendMode,
        defaultTrendModeName;

    var countryID,
        iso;

    var displayTitle;

    var activeTrend = defaultTrendMode;

    var rightPopupContainerWidthP = 0.84;
    var trendContainerWidthP = 0.8;

    var isTotalShowing = true;
    var totalDataset = null;

    function _init(displayname, id) {

        if (currentCategory == 'ALL') {
            trendList = [TREND_BY_MODEL, TREND_BY_COUNTRY, TREND_BY_VIEW];
            trendNameList = [TREND_BY_MODEL_DISPLAY, TREND_BY_COUNTRY_DISPLAY, TREND_BY_VIEW_DISPLAY];
        } else if (currentCategory != 'ALL') {
            trendList = [TREND_BY_MODEL, TREND_BY_COUNTRY];
            trendNameList = [TREND_BY_MODEL_DISPLAY, TREND_BY_COUNTRY_DISPLAY];
        }

        defaultTrendMode = trendList[0];
        defaultTrendModeName = trendNameList[0];

        iso = observeLoc[0];
        countryID = (id) ? id : 'null';
        displayTitle = displayname;
        //        console.log(iso+'/'+countryID+'/'+displayTitle);
    }

    function showChart(displayname, id) {
        if (observeTarget.length > 0 && !mapObj.isEmpty) {
            loading("Creating Chart...");
            _init(displayname, id);
//            resetFilterStatus();
            scrollToTop();
            popupChartShow(true);
            ajaxGetTrendValue();
        }
    }

    function ajaxGetTrendValue() {
        if (linechart != null) {
            linechart.destroy();
        }
        var URLs = "php/_dbqueryGetQcCountryTrend.php";
        $.ajax({
            url: URLs,
            data: {
                color: JSON.stringify(observeSpec.color),
                cpu: JSON.stringify(observeSpec.cpu),
                rearCamera: JSON.stringify(observeSpec.rear_camera),
                frontCamera: JSON.stringify(observeSpec.front_camera),
                data: JSON.stringify(observeTarget),
                countryID: countryID,
                iso: iso,
                permission: JSON.stringify(permission),
                repairCategory: currentCategory,
                repairView: currentView,
            },
            type: "POST",
            dataType: 'text',

            success: function (json) {
                json = JSON.parse(decodeEntities(json));
                //                console.log(json);
                //resultByModel
                for (var modelname in json.resultByModel) {
                    if (isNeedToAddStarInModelName(modelname)) {
                        json.resultByModel[getModelDisplayName(modelname)] = json.resultByModel[modelname];
                        delete json.resultByModel[modelname];
                    }
                }
                //empty data set
                updateQCChart(json);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert("ajaxGetTrendValue:" + xhr.status);
                alert(thrownError);
            }
        });
    }

    function _createFunctionalBtn() {
        var container = jQuery('<div/>', {
                id: "functionalBtnContainer",
            })
            //export Btn
            .append(
                jQuery('<button/>', {
                    id: "btnExport",
                    class: "btn btn-default trendFunctionBtn",
                })
                .text('EXPORT FILE')
                .click(function () {
                    return exportFile(_getActiveTrend(), true);
                })
            );
        return container;
    }

    function updateQCChart(json) {

        if (linechart != null) {
            linechart.destroy();
        }

        var container = ($('#popupChartContainer'));

        //        var row = jQuery('<div/>', {
        //            class: 'row',
        //        }).css({
        //            'height': '100%',
        //        }).appendTo(container);
        //
        //        var leftPopup = jQuery('<div/>', {
        //            id: 'leftPopupContainer',
        //            class: 'col-xs-2',
        //        }).css({
        //            'display': 'inline-block',
        //            //            'width': '15%',
        //            'min-height': '100%',
        //            'vertical-align': 'top',
        //            'position': 'relative',
        //            'background-color': '#EEE',
        //        }).appendTo(row);
        //
        //        var rightPopup = jQuery('<div/>', {
        //            id: 'rightPopupContainer',
        //            class: 'col-xs-10',
        //        }).css({
        //            'display': 'inline-block',
        //            //            'width': '' + rightPopupContainerWidthP * 100 + '%',
        //            'height': '100%',
        //            'vertical-align': 'top',
        //            'position': 'relative',
        //        }).appendTo(row);

        //title container
        var title = jQuery('<div/>', {
                id: 'lineChartTitle',
            })
            .css({
                'top': '' + getWindowHeightPercentagePx(0.1) + 'px',
            })
            .appendTo(container);

        _createFunctionalBtn().appendTo(title);

        /*repairCategory: currentCategory,
        repairView: currentView,*/
        //title content
        jQuery('<div/>', {
                id: "currentTrendTitle",
                class: 'w3-padding-4',
            })
            .css('text-align', 'left')
            .append(
                jQuery('<p/>', {
                    'id': 'optionTitle'
                })
                .text(displayTitle + '/' + currentView.toUpperCase() + '/' + currentCategory)
                .css({
                    'margin': '0px',
                    'font-size': 'x-large',
                })
            )
            .append(
                jQuery('<p/>', {
                    'id': 'option'
                })
                .text(defaultTrendModeName)
                .css({
                    'margin': '0px',
                    'display': 'inline-block',
                    'font-size': '36px',
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
            jQuery('<div/>', {
                    id: 'trendByQC' + trendList[i],
                    class: "w3-padding-4 w3-center",
                })
                .css({
                    'border-radius': (i == trendList.length - 1) ? '0px 0px 10px 10px' : '0px',
                    'margin-bottom': (i == trendList.length - 1) ? '0px' : '5px',
                })
                .html('<h4>' + trendNameList[i] + '</h4>')
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

                        //resetTotalToggleBtn();
                        createChart(json, trendList[index]);

                        $('#currentTrendTitle p#option').text(trendNameList[index]);
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

        _setActiveTrend(trendMode);
        switch (trendMode) {
            case TREND_BY_MODEL:
                setTrendData(json.resultByModel);
                break;

            case TREND_BY_VIEW:
                setTrendData(json.resultByModule);
                break;

            case TREND_BY_COUNTRY:
                setTrendData(json.resultByCountry);
                break;

            case TREND_BY_REGION:
                setTrendData(json.resultByCountry);
                break;
        }
        createChartElement();
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
    }

    function setTrendData(jsonObj) {
        //clean
        trendObj.datasets.length = 0;

        //        console.log(jsonObj);

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

                if (data[date])
                    dataset.dataByMonth.push(data[date]);
                else
                    dataset.dataByMonth.push(0);
            }

            dataset.data = dataset.dataByMonth;

            //in order to make 'ALL' in the last position
            //so push 'ALL' at last
            if (name == 'All')
                totalDataset = dataset;
            else
                trendObj.datasets.push(dataset);
        }

        //only while ALL category/trend by module need to push total line
        if (currentCategory == 'ALL' && _getActiveTrend() == TREND_BY_VIEW)
            trendObj.datasets.push(totalDataset);
    }

    function removeTotalLine() {
        var index = trendObj.datasets.indexOf(totalDataset);
        if (index > -1) {
            trendObj.datasets.splice(index, 1);
        }
        chartDestroy(false);
        createChartElement();
        //updateColorInfo();
    }

    function addTotalLine() {
        trendObj.datasets.push(totalDataset);
        chartDestroy(false);
        createChartElement();
        //updateColorInfo();
    }

    function createChartElement() {
        trendObjOriginal = jQuery.extend(true, {}, trendObj);

        var node = document.createElement("canvas");
        node.className = "chart";
        node.id = 'trendChart';

        var container = jQuery('<div/>', {
            class: 'customScrollBar',
        });
        container.css({
                //                "position": "absolute",
                "top": "" + getWindowHeightPercentagePx(0.3) + 'px',
                "left": "2%",
                "width": "100%",
                'border': '10px solid rgba(255,255,255,0)',
                "overflow-y": "hidden",
                "display": "inline-block",
                //hide first
                "opacity": "1",
            }).attr('id', 'trendContainer')
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
                    'height': '' + chartHeight + 'px',
                    'display': 'inline-block',
                    'vertical-align': 'top'
                })
            );

        //width cal
        //        var labelCount = trendObj.labels.length;
        //        var tmpSpacing = (trendContainerWidthR - axisWidth) / (labelCount + 1);
        //        var spacing = (tmpSpacing < chartSpacing) ? chartSpacing : tmpSpacing;
        //
        //        node.style.height = '' + chartHeight + 'px';
        //        node.style.width = (axisWidth + spacing * trendObj.labels.length > 32500) ? ('32500px') : '' + (axisWidth + spacing * trendObj.labels.length) + 'px';

        $('#popupChartContainer').append(container);
        var ctx = node.getContext("2d");
        linechart = new Chart(ctx, {
            type: 'line',
            data: trendObj,
            options: CFRpercentageOptions,
        });

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
        //
        //        //show up
        //        container.animate({
        //            opacity: 1,
        //        }, 'slow');
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
        //        updateQCChart: updateQCChart,
        //        parallelReportExport:parallelReportExportDialogShow,
    };

    return module;

}(firstMap));
