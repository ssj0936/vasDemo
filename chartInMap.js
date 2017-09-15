"use strict";

var chartHeight = 450;
var filterInTrendIconWidth = 12;
var filterInTrendIconmarginright = 3;
var isTotalShowing = true;
var totalName = 'Total';
var totalDataset = null;
var chartSpacing = 30;
var axisWidth = 50;
var groupByMode = ['By Day', 'By Week', 'By Month'];
var defaultGroupBy = groupByMode[0];

var activeTrend;
var TREND_MODEL = 'Model';
var TREND_COUNTRY = 'Country';
var TREND_DEVICE = 'Model(RAM/ROM)';
var TREND_TABLE = 'Table';
var TREND_REGION = 'Region';
var TREND_DIST = 'Disti';
var TREND_BRANCH = 'Branch';

var rightPopupContainerWidthP = 0.84;
var trendContainerWidthP = 0.9;
var modalHeight = 500;

var trendContainerWidthR = $(window).width() * rightPopupContainerWidthP * trendContainerWidthP - 20;

function createFunctionalBtn() {


    var selector = jQuery('<button/>', {
            type: "button",
            id: "btnTimePeriodSelect",
            class: "trendFunctionBtn btn btn-default dropdown-toggle",
            'data-toggle': "dropdown"
        })
        .html('Group By <span class="caret"></span>');



    var container = jQuery('<div/>', {
            id: "functionalBtnContainer",
            class: "btn-group",
        })
        .append(
            jQuery('<button/>', {
                type: "button",
                id: "btnExport",
                class: "trendFunctionBtn btn btn-default",
            })
            .text('EXPORT')
            .click(function () {
                return exportFile(getActiveTrend(), true);
            })
        )
        .append(
            jQuery('<div/>', {
                class: "btn-group"
            })
            .append(selector)
            .append(
                jQuery('<ul/>', {
                    class: "dropdown-menu",
                    role: "menu",
                })
                .append(
                    jQuery('<li/>')
                    .html('<a href="#">By Day</a>')
                    .click(function () {
                        var groupBy = 'By Day';
                        selector.html(groupBy + '<span class="caret"></span>');
                        //need to restore after user remove some dataline
                        trendObj.datasets = trendObjOriginal.datasets.slice(0);
                        labelChange(groupBy);
                        //totalDataset is null in Region trend mode
                        if (totalDataset) {
                            totalDataset.data = totalDataset.dataByDate;
                        }
                        for (var i in trendObj.datasets) {
                            trendObj.datasets[i].data = trendObj.datasets[i].dataByDate;
                        }
                        chartDestroy(false);
                        if (isNowBranchTrend)
                            createChartElement(negOptions);
                        else
                            createChartElement();
                    })
                )
                .append(
                    jQuery('<li/>')
                    .html('<a href="#">By Week</a>')
                    .click(function () {
                        var groupBy = 'By Week';
                        selector.html(groupBy + '<span class="caret"></span>');
                        //need to restore after user remove some dataline
                        trendObj.datasets = trendObjOriginal.datasets.slice(0);
                        labelChange(groupBy);
                        //totalDataset is null in Region trend mode
                        if (totalDataset) {
                            totalDataset.data = totalDataset.dataByWeek;
                        }
                        for (var i in trendObj.datasets) {
                            trendObj.datasets[i].data = trendObj.datasets[i].dataByWeek;
                        }
                        chartDestroy(false);
                        if (isNowBranchTrend)
                            createChartElement(negOptions);
                        else
                            createChartElement();
                    })
                )
                .append(
                    jQuery('<li/>')
                    .html('<a href="#">By Month</a>')
                    .click(function () {
                        var groupBy = 'By Month';
                        selector.html(groupBy + '<span class="caret"></span>');
                        //need to restore after user remove some dataline
                        trendObj.datasets = trendObjOriginal.datasets.slice(0);
                        labelChange(groupBy);
                        //totalDataset is null in Region trend mode
                        if (totalDataset) {
                            totalDataset.data = totalDataset.dataByMonth;
                        }
                        for (var i in trendObj.datasets) {
                            trendObj.datasets[i].data = trendObj.datasets[i].dataByMonth;
                        }
                        chartDestroy(false);
                        if (isNowBranchTrend)
                            createChartElement(negOptions);
                        else
                            createChartElement();
                    })
                )
            )
        );

    return container;
}

function resetGroupByDelectMenu() {
    $('#btnTimePeriodSelect').html('Group By <span class="caret"></span>');
}

function updateBranchChart(json, branchName) {
    if (json.groupByBranchResults.length == 0) return;
    var container = $('#popupChartContainer')

    //title container
    var title = jQuery('<div/>', {
            id: 'lineChartTitle',
        })
        .css({
            'top': '' + getWindowHeightPercentagePx(0.1) + 'px',
        })
        .appendTo(container);

    createFunctionalBtn().appendTo(title);

    //title content
    jQuery('<div/>', {
            id: "currentTrendTitle",
            class: 'w3-padding-4',
        })
        .css({
            'text-align': 'left',
            'display': 'table'
        })
        .append(
            jQuery('<p/>', {
                'id': 'option'
            })
            .text("Trend by " + TREND_BRANCH)
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
    var trendList = [TREND_BRANCH, TREND_MODEL, TREND_DEVICE];

    var optionContainer = jQuery('<div/>', {
            id: 'trendOptionContainer',
        })
        .css('position', 'absolute')
        .appendTo(title).hide();

    for (var i in trendList) {
        jQuery('<div/>', {
                id: 'trendBy' + trendList[i],
                class: "w3-padding-4 w3-center",
            })
            .css({
                'border-radius': (i == trendList.length - 1) ? '0px 0px 10px 10px' : '0px',
                'margin-bottom': (i == trendList.length - 1) ? '0px' : '5px',
            })
            .html('<h4>' + 'Trend by ' + trendList[i] + '</h4>')
            .appendTo(optionContainer)
            .click(function (activeTrend) {
                return function () {
                    if (getActiveTrend() == activeTrend) return;

                    //if trendcontainer hide, show it
                    if ($('#trendContainer').is(':hidden'))
                        $('#trendContainer').slideDown('medium');

                    //table remove
                    $('#table_wrapper').remove();
                    //                    disableScroll();

                    $('#trendContainer').css({
                        'opacity': 0
                    });

                    createBranchChart(json, activeTrend, branchName);
                    $('#currentTrendTitle p#option').text("Trend by " + activeTrend);
                    $('#trendContainer').fadeTo(300, 1);

                    //menu close
                    $('#trendOptionContainer').stop(true, true).slideToggle('medium');
                }
            }(trendList[i]));
    }

    isNowBranchTrend = true;
    //chart
    createBranchChart(json, TREND_BRANCH, branchName);
}

function updateRegionChart(json, displayname, displaynum) {
    if (json.groupByRegionResults.length == 0) return;

    var defaultTrendMode = TREND_MODEL;
    var container = $('#popupChartContainer')

    //title container 
    var title = jQuery('<div/>', {
            id: 'lineChartTitle',
        })
        .css({
            'top': '' + getWindowHeightPercentagePx(0.1) + 'px',
        })
        .appendTo(container);

    createFunctionalBtn().appendTo(title);

    //title content
    jQuery('<div/>', {
            id: "currentTrendTitle",
            class: 'w3-padding-4',
        })
        .css({
            'text-align': 'left',
            'display': 'table'
        })
        .append(
            jQuery('<p/>')
            .text(displayname + " : " + displaynum)
            .css({
                'margin': '0px',
                'font-size': '36px',
                'text-align': 'left',
            })
        )
        .append(
            jQuery('<p/>', {
                'id': 'option'
            })
            .text("Trend by " + defaultTrendMode)
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
    var trendList = [TREND_MODEL, TREND_DEVICE, TREND_REGION];
    if (isDistBranchSelected) {
        trendList.push(TREND_DIST);
        trendList.push(TREND_BRANCH);
    }

    var optionContainer = jQuery('<div/>', {
            id: 'trendOptionContainer',
        })
        .css({
            'position': 'absolute',
        })
        .appendTo(title).hide();

    for (var i in trendList) {
        jQuery('<div/>', {
                id: 'trendBy' + trendList[i],
                class: "w3-padding-4 w3-center",
            })
            .css({
                'border-radius': (i == trendList.length - 1) ? '0px 0px 10px 10px' : '0px',
                'margin-bottom': (i == trendList.length - 1) ? '0px' : '5px',
            })
            .html('<h4>' + 'Trend by ' + trendList[i] + '</h4>')
            .appendTo(optionContainer)
            .click(function (activeTrend) {
                return function () {
                    if (getActiveTrend() == activeTrend) return;

                    //if trendcontainer hide, show it
                    if ($('#trendContainer').is(':hidden'))
                        $('#trendContainer').slideDown('fast');

                    //table remove
                    $('#table_wrapper').remove();
                    //                    disableScroll();

                    $('#trendContainer').css({
                        'opacity': 0
                    });

                    createsingleRegionChart(json, activeTrend, displayname);
                    $('#currentTrendTitle p#option').text("Trend by " + activeTrend);
                    $('#trendContainer').fadeTo(300, 1);

                    //menu close
                    $('#trendOptionContainer').stop(true, true).slideToggle('medium');
                }
            }(trendList[i]));
    }

    //chart
    createsingleRegionChart(json, defaultTrendMode, displayname);

}

function updateTrendChart(json) {

    //empty data set
    if (json.start_time == null && json.end_time == null) return;

    //chart
    var defaultTrendMode = TREND_MODEL;

    var container = $('#popupChartContainer')

    //title container
    var title = jQuery('<div/>', {
            id: 'lineChartTitle',
            //        class: "w3-center",
        })
        .css({
            'top': '' + getWindowHeightPercentagePx(0.1) + 'px',
        })
        .appendTo(container);

    createFunctionalBtn().appendTo(title);

    jQuery('<div/>', {
            id: "currentTrendTitle",
            class: 'w3-padding-4',
        })
        .css({
            'text-align': 'left',
            'display': 'table'
        })
        .append(
            jQuery('<p/>')
            .text("Trend by " + defaultTrendMode)
            .css({
                'margin': '0px',
                'display': 'inline-block',
                'font-size': 'x-large'
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

    //drop down construction
    var trendList = [TREND_MODEL, TREND_DEVICE, TREND_COUNTRY];
    if (isDistBranchSelected) {
        trendList.push(TREND_DIST);
        trendList.push(TREND_BRANCH);
    }
    var optionContainer = jQuery('<div/>', {
            id: 'trendOptionContainer',
        })
        .css('position', 'absolute')
        .appendTo(title).hide();

    for (var i in trendList) {
        jQuery('<div/>', {
                id: 'trendBy' + trendList[i],
                class: "w3-padding-4 w3-center",
            })
            .css({
                'border-radius': (i == trendList.length - 1) ? '0px 0px 10px 10px' : '0px',
                'margin-bottom': (i == trendList.length - 1) ? '0px' : '5px',
            })
            .html('<h4>' + 'Trend by ' + trendList[i] + '</h4>')
            .appendTo(optionContainer)
            .click(function (activeTrend) {
                return function () {
                    if (getActiveTrend() == activeTrend) return;

                    //if trendcontainer hide, show it
                    if ($('#trendContainer').is(':hidden'))
                        $('#trendContainer').slideDown('medium');

                    //table remove
                    $('#table_wrapper').remove();
                    //                    disableScroll();

                    $('#trendContainer').css({
                        'opacity': 0
                    });

                    createTrendChart(json, activeTrend);
                    $('#currentTrendTitle p').text("Trend by " + activeTrend);
                    $('#trendContainer').fadeTo(300, 1);

                    //menu close
                    $('#trendOptionContainer').stop(true, true).slideToggle('medium');
                }
            }(trendList[i]));
    }

    //title re-position
    var top = title.offset().top;
    title.css({
        'top': '' + top + 'px',
        'bottom': '',
    });

    createTrendChart(json, defaultTrendMode);
    //End
    loadingDismiss();
}

function bodyHide() {
    $('body').css({
        'height': '0px',
        'overflow': 'hidden',
    });
}

function bodyShow() {
    $('body').css({
        'height': 'auto',
        'overflow': 'initial',
    });
}

function exportFile(ReportTitle, ShowLabel) {
    var exportArray = [];
    for (var i in trendObj.labels) {
        var date = trendObj.labels[i];
        if (date == '') continue;

        var Obj = {
            "date": date
        };
        for (var j in trendObj.datasets) {
            var label = trendObj.datasets[j].label;
            var countAtThatDay = trendObj.datasets[j].data[i];
            Obj[label] = countAtThatDay;
        }
        exportArray.push(Obj);
    }

    var arrData = exportArray;
    var CSV = '';
    //Set Report title in first row or line

    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        for (var index in arrData[0]) {
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }
        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }


    //    var isGap = (getFunction() == FUNC_GAP);
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }
        row.slice(0, row.length - 1);
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //Generate a file name
    var fileName = "MyReport_";
    fileName += ReportTitle.replace(/ /g, "_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);


    // ------------------trigger-------------------------
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function createDeviceFilter(dataObj, container, titleContainer) {
    var ul = jQuery('<ul/>').appendTo(container);

    var li = jQuery('<li/>').attr("id", "check_device_li").appendTo($(ul));

    jQuery('<label/>', {
        text: "All",
    }).appendTo(li);

    var productUl = jQuery('<ul/>').appendTo($(ul));
    //ui-icon-squaresmall-plus
    for (var productName in dataObj) {
        var isNoChildModel = (dataObj[productName] == null);
        var li = jQuery('<li/>').appendTo($(productUl));
        //all product
        //collapse icon
        if (!isNoChildModel) {
            jQuery('<span />', {
                    class: "ui-icon ui-icon-circlesmall-minus",
                })
                .css({
                    'display': 'inline-block',
                    'font-size': '18px',
                    'height': '' + filterInTrendIconWidth + 'px',
                    'width': '' + filterInTrendIconWidth + 'px',
                    'margin-right': '3px',
                })
                .click(function () {
                    if ($(this).hasClass('ui-icon-circlesmall-plus')) {
                        $(this).removeClass("ui-icon-circlesmall-plus").addClass("ui-icon-circlesmall-minus");
                    } else {
                        $(this).removeClass("ui-icon-circlesmall-minus").addClass("ui-icon-circlesmall-plus");
                    }
                    $(this).parent().next('ul').slideToggle();
                })
                .appendTo(li)
        } else {
            li.css({
                'margin-left': '' + (filterInTrendIconWidth + filterInTrendIconmarginright) + 'px',
            })
        }

        jQuery('<label/>', {
            text: productName,
        }).appendTo(li);

        if (isNoChildModel) continue;

        var modelUl = jQuery('<ul/>').appendTo($(productUl));
        for (var modelName in dataObj[productName]) {
            var isNoDeviceChild = (dataObj[productName][modelName] == null);

            var li = jQuery('<li/>').appendTo(modelUl);
            //all model
            //collapse icon
            if (!isNoDeviceChild) {
                jQuery('<span />', {
                        class: "ui-icon ui-icon-circlesmall-plus",
                    })
                    .css({
                        'display': 'inline-block',
                        'font-size': '18px',
                        'height': '' + filterInTrendIconWidth + 'px',
                        'width': '' + filterInTrendIconWidth + 'px',
                        'margin-right': '3px',
                    })
                    .click(function () {
                        if ($(this).hasClass('ui-icon-circlesmall-plus')) {
                            $(this).removeClass("ui-icon-circlesmall-plus").addClass("ui-icon-circlesmall-minus");
                        } else {
                            $(this).removeClass("ui-icon-circlesmall-minus").addClass("ui-icon-circlesmall-plus");
                        }
                        $(this).parent().next('ul').slideToggle();
                    })
                    .appendTo(li);
            } else {
                li.css({
                    'margin-left': '' + (filterInTrendIconWidth + filterInTrendIconmarginright) + 'px',
                })
            }

            jQuery('<label/>', {
                text: modelName,
            }).appendTo(li);

            if (isNoDeviceChild) continue;
            //devices
            var deviceUl = jQuery('<ul/>').appendTo(modelUl).hide();
            for (var i = 0; i < dataObj[productName][modelName].length; ++i) {
                var li = jQuery('<li/>').appendTo(deviceUl);

                jQuery('<label/>', {
                        text: dataObj[productName][modelName][i],
                    })
                    .css('padding-left', '3px')
                    .appendTo(li);
            }
        }
    }

    container.show();
    titleContainer.toggleClass('trendCollapsible-close trendCollapsible-open');
}

function createTwoLevelFilter(dataArray, container, titleContainer) {
    var ul = jQuery('<ul/>').appendTo(container);


    if (dataArray == observeLocFullName) {
        for (var i = 0; i < dataArray.length; ++i) {
            var li = jQuery('<li/>').appendTo($(ul));

            jQuery('<label/>', {
                text: dataArray[i],
            }).appendTo(li);
        }

        container.show();
        titleContainer.toggleClass('trendCollapsible-close trendCollapsible-open');
    } else {
        if (dataArray[0] == 'all') {
            var li = jQuery('<li/>').appendTo(ul);

            jQuery('<label/>', {
                text: "All",
            }).appendTo(li);
        } else {
            //            var allUl = jQuery('<ul/>').appendTo(ul);
            for (var i = 0; i < dataArray.length; ++i) {
                var li = jQuery('<li/>').appendTo(ul);

                jQuery('<label/>', {
                    text: dataArray[i],
                }).appendTo(li);
            }
            container.show();
            titleContainer.toggleClass('trendCollapsible-close trendCollapsible-open');
        }
    }
}

function createFilterResult() {
    //filter content
    var container = jQuery('<div/>', {
        class: 'filter_wrapper',
    }).css({
        'margin-top': '30%',
        'width': '100%',
        'border-radius': '5px',
        'z-index': 5,
    });

    var body = jQuery('<div/>').appendTo(container);

    //structure build for each filter
    for (var i in FilterList) {
        var filterName = FilterList[i];

        var $container = $('<div/>', {
                id: 'displayFilter_title_' + filterName,
                class: 'trendCollapsible-close',
            })
            .css({
                //                'border-top': (i != 0) ? ('solid #AAA 1pt') : (''),
                'margin': '10px 5px 0px 5px',
                'margin-bottom': '5px',
                'padding-top': '8px',
                'font-size': '24px',
            })
            .html(filterName + '<span></span>')
            .appendTo(body);

        var $content = $('<div/>', {
                id: 'displayFilter_content_' + filterName,
                class: 'selector customScrollBar',
                filterName: filterName,
            })
            .css({
                'max-height': '250px',
                //                'overflow': 'auto',
            })
            .appendTo(body).hide();

        $container.click(function ($content, $container) {
            return function () {
                $content.stop(true, true).slideToggle('medium');
                $container.toggleClass('trendCollapsible-close trendCollapsible-open');
            }
        }($content, $container));

        addingContent(filterName, $content, $container);
    }

    return container;
}

function addingContent(filterName, container, titleContainer) {
    //    console.log(container.get(0));

    switch (filterName) {
        case 'Device':
            //        console.log(observeTarget);
            var deviceObj = {};
            for (var j in observeTargetDeviceOnly) {
                var targetObj = observeTargetDeviceOnly[j];
                var dataType = targetObj.datatype;
                //top level
                var devices = targetObj.devices;
                //lower level
                var model = targetObj.model;
                var product = targetObj.product;

                if (dataType == 'devices') {
                    if (deviceObj[product] == undefined) {
                        deviceObj[product] = {};
                    }

                    if (deviceObj[product][model] == undefined) {
                        deviceObj[product][model] = [];
                    }

                    deviceObj[product][model].push(devices);
                } else if (dataType == 'model') {
                    if (deviceObj[product] == undefined) {
                        deviceObj[product] = {};
                    }

                    if (deviceObj[product][model] == undefined) {
                        deviceObj[product][model] = null;
                    }
                } else if (dataType == 'product') {
                    if (deviceObj[product] == undefined)
                        deviceObj[product] = null;
                }
            }
            //        console.log(deviceObj);
            createDeviceFilter(deviceObj, container, titleContainer);
            break;

        case 'Country':
            createTwoLevelFilter(observeLocFullName, container, titleContainer);
            break;
        case 'CPU':
            createTwoLevelFilter(observeSpec.cpu, container, titleContainer);
            break;
        case 'Color':
            createTwoLevelFilter(observeSpec.color, container, titleContainer);
            break;
        case 'RearCamera':
            createTwoLevelFilter(observeSpec.rear_camera, container, titleContainer);
            break;
        case 'FrontCamera':
            createTwoLevelFilter(observeSpec.front_camera, container, titleContainer);
            break;
    }
}

function createFilterDisplayer() {
    //filter content
    var container = jQuery('<div/>', {
        class: 'filter_wrapper panel',
    }).css({
        'position': 'absolute',
        'top': '' + getWindowHeightPercentagePx(0.15) + 'px',
        'right': '0px',
        'width': '90%',
        'border-radius': '5px',
        'z-index': 5,
    });

    var header = jQuery('<div/>', {
            class: 'panel-heading',
        })
        .text('Filter')
        .appendTo(container);

    var body = jQuery('<div/>', {
            class: 'panel-body',
        })
        .appendTo(container);

    //structure build for each filter
    for (var i in FilterList) {
        var filterName = FilterList[i];

        var $container = $('<div/>', {
                id: 'displayFilter_title_' + filterName,
                class: 'trendCollapsible-close',
            })
            .css({
                'border-top': (i != 0) ? ('solid black 1pt') : (''),
                'margin': '10px 5px 0px 5px',
                'margin-bottom': '5px',
                'padding-top': '8px',
            })
            .html(filterName + '<span></span>')
            .appendTo(body);

        var $content = $('<div/>', {
                id: 'displayFilter_content_' + filterName,
                class: 'selector customScrollBar',
                filterName: filterName,
            })
            .css({
                'max-height': '250px',
                //                'overflow': 'auto',
            })
            .appendTo(body).hide();

        $container.click(function ($content, $container) {
            return function () {
                $content.stop(true, true).slideToggle('medium');
                $container.toggleClass('trendCollapsible-close trendCollapsible-open');
            }
        }($content, $container));

        addingContent(filterName, $content, $container);
    }

    return container;
}

function showRegionChart(countryID, iso, displayname, displaynum, mapObj) {
    if (observeTarget.length > 0 && !mapObj.isEmpty) {
        loading("Creating Chart...");
//        resetFilterStatus();
        scrollToTop();
        popupChartShow(true);
        ajaxRegionChart(countryID, iso, displayname, displaynum, mapObj);
    }
}

//function closeLineChart(){
//    popupChartClose();
//}

function popupChartShow(needToLockScroll) {

    $('#myModal').modal({
        show: true
    });

    $('#myModal').on('hidden.bs.modal', function (e) {
        $('#popupChartContainer').empty();

        //for line chart
        chartDestroy(true);

        if (needToLockScroll) {
            enableScroll();
        }
        isNowBranchTrend = false;
        enableScroll();
        bodyShow();
        totalDataset = null;
    });
}

function popupChartClose(needToLockScroll) {
    document.getElementById('mapid').style.zIndex = 1;
    document.getElementById('mapidComparison').style.zIndex = 1;
    document.getElementById('toggle').style.zIndex = 1;
    $('.ui-widget').css('z-index', 1);
    $('#popupChartContainer').css({
        "min-height": '0px',
        "opacity": 0,
        'z-index': -1,
        //set height to 0 in order not to influence workset height
        //        'height': '0px',
    });

    $('#popupChartContainer').empty();

    //for line chart
    chartDestroy(true);

    if (needToLockScroll) {
        enableScroll();
    }
    isNowBranchTrend = false;
    enableScroll();
    bodyShow();
    totalDataset = null;
}

function showTrend(mapObj) {
    if (observeTarget.length > 0 && !mapObj.isEmpty) {
        loading("Creating Chart...");
        //        resetFilterStatus();
        scrollToTop();
        popupChartShow();
        ajaxTrendChart(mapObj);
    }
}

function setTrendLable(json) {
    //    console.log('setTrendLable[start]:'+getCurrentTime());
    trendObj = new lineDataObj();

    var startDate = json.start_time;
    var endDate = json.end_time;
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
    //    console.log(trendObj.labelsByDate);
    //    console.log(trendObj.labelsByMonth);
    //    console.log(trendObj.labelsByWeek);

    labelChange(defaultGroupBy);

    //    console.log('setTrendLable[end]:'+getCurrentTime());
}

function labelChange(chanegTo) {
    switch (chanegTo) {
        case 'By Day':
            trendObj.labels = trendObj.labelsByDate.slice();
            break;
        case 'By Month':
            trendObj.labels = trendObj.labelsByMonth.slice();
            break;
        case 'By Week':
            trendObj.labels = trendObj.labelsByWeek.slice();
            break;
    }

    //in order to adding space
    //    trendObj.labels.push("");
    //    trendObj.labels.push(" ");
    //    trendObj.labels.push(" ");
}

function setTrendData(jsonObj) {
    //clean
    trendObj.datasets.length = 0;

    //    console.log(jsonObj);
    var jsonArray = Object.keys(jsonObj);
    for (var index in jsonArray) {
        var name = jsonArray[index];
        var data = jsonObj[name];

        var color = getRandomColor();
        var highlight = ColorLuminance(color, 0.5);
        var transparentColor = colorHexToRGBString(color, 0.2);
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

        trendObj.datasets.push(dataset);
    }
}

function setTrendDataByRegion(jsonObj, regionName) {
    trendObj.datasets.length = 0;

    var regionName = regionName;
    var regionData = jsonObj;

    var color = getRandomColor();
    var highlight = ColorLuminance(color, 0.5);
    var transparentColor = colorHexToRGBString(color, 0.2);
    var regionDataset = new lineDatasetsObj(regionName, transparentColor, color, highlight, false);

    //group by date
    var regionDataDateIndex = 0
    for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
        if (regionDataDateIndex < regionData.length && trendObj.labelsByDate[i] == regionData[regionDataDateIndex].date) {
            regionDataset.dataByDate.push(regionData[regionDataDateIndex].count);
            ++regionDataDateIndex;
        } else {
            regionDataset.dataByDate.push(0);
        }
    }

    //group by month
    var currentM = null;
    var currentY = null;
    var sumInThatMonth = 0;
    var first = true;

    for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
        var date = trendObj.labelsByDate[i];
        var cnt = regionDataset.dataByDate[i];

        var d = new Date(date);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;

        if (currentM != month || currentY != year) {
            if (first) {
                first = false;
            } else {
                regionDataset.dataByMonth.push(sumInThatMonth);
                sumInThatMonth = 0;
            }
            currentM = month;
            currentY = year;
        }

        sumInThatMonth += cnt;
    }
    //last one
    regionDataset.dataByMonth.push(sumInThatMonth);


    //group by week
    var currentW = null;
    var currentY = null;
    var sumInThatWeek = 0;
    var first = true;

    for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
        var date = trendObj.labelsByDate[i];
        var cnt = regionDataset.dataByDate[i];

        var d = new Date(date);
        var weekAndYear = getWeekNumber(d);
        var year = weekAndYear.year;
        var week = weekAndYear.weekNumber;

        if (currentW != week || currentY != year) {
            if (first) {
                first = false;
            } else {
                regionDataset.dataByWeek.push(sumInThatWeek);
                sumInThatWeek = 0;
            }
            currentW = week;
            currentY = year;
        }

        sumInThatWeek += cnt;
    }
    //last one
    regionDataset.dataByWeek.push(sumInThatWeek);

    trendObj.datasets.push(regionDataset);
    //    console.log(regionDataset);
}

function setGapTrendData(jsonObj, gapDevide, branchName) {
    //clean
    trendObj.datasets.length = 0;

    //    console.log(jsonObj);
    var jsonArray = Object.keys(jsonObj);
    for (var index in jsonArray) {
        var name = jsonArray[index];
        var data = jsonObj[name];

        if (branchName) {
            name = removeBaseline(branchName);
            data = jsonObj[branchName.toUpperCase()];
        }

        var color = getRandomColor();
        var highlight = ColorLuminance(color, 0.5);
        var transparentColor = colorHexToRGBString(color, 0.2);
        var dataset = new lineDatasetsObj(name, transparentColor, color, highlight, false);

        //first
        //handle the data group by date 
        var DateIndex = 0
        for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
            var currentDate = trendObj.labelsByDate[i];
            var alreadyFound = false;
            while (DateIndex < data.length && currentDate == data[DateIndex].date) {
                if (data[DateIndex].isTargetBranch) {
                    dataset.dataByDate.push(data[DateIndex].count);
                    alreadyFound = true;
                }
                ++DateIndex;
            }

            if (!alreadyFound) {
                dataset.dataByDate.push(0);
            }
        }
        //        console.log(dataset.dataByDate);
        //        var total = 0;
        //        for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
        //            
        //            if(dataset.dataByDate[i] == 0) continue;
        //            
        //            var date = trendObj.labelsByDate[i];
        //            for(var j in data){
        //                if(data[j].date == date)
        //                    total += data[j].count;
        //            }
        //            
        //            dataset.dataByDate[i] = ((dataset.dataByDate[i]/total)/gapDevide-1);
        //            total = 0;
        //        }
        //        console.log(dataset.dataByDate);


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


        //4th step
        //re-calculate of Gap
        //by month
        for (var i = 0; i < trendObj.labelsByMonth.length; ++i) {
            var date = trendObj.labelsByMonth[i].split('-');
            //            console.log(date);
            var year = date[0];
            var month = date[1];

            var total = 0;
            for (var j in data) {
                var d = new Date(data[j].date);
                if (year == d.getFullYear() && month == (d.getMonth() + 1))
                    total += data[j].count;
            }
            //            console.log(trendObj.labelsByMonth[i]+':'+total);
            dataset.dataByMonth[i] = (dataset.dataByMonth[i] == 0) ? -1 : ((dataset.dataByMonth[i] / total) / gapDevide - 1);
        }

        //by week
        for (var i = 0; i < trendObj.labelsByWeek.length; ++i) {
            var date = trendObj.labelsByWeek[i];
            var total = 0;
            for (var j in data) {
                var d = new Date(data[j].date);
                if (date == getWeekNumber(d).lastDayOfWeek) {
                    total += data[j].count;
                }
            }
            dataset.dataByWeek[i] = (dataset.dataByWeek[i] == 0) ? -1 : ((dataset.dataByWeek[i] / total) / gapDevide - 1);
        }

        //by date
        for (var i = 0; i < trendObj.labelsByDate.length; ++i) {

            if (dataset.dataByDate[i] == 0) {
                dataset.dataByDate[i] = -1;
                continue;
            }
            var total = 0;
            var date = trendObj.labelsByDate[i];
            for (var j in data) {
                if (data[j].date == date)
                    total += data[j].count;
            }

            dataset.dataByDate[i] = (dataset.dataByDate[i] / total) / gapDevide - 1;
        }

        trendObj.datasets.push(dataset);
        //        console.log(dataset);
    }
}

function addingTotalLine(totalJson) {
    var totalData = totalJson;

    //    console.log(totalData);
    var color = getRandomColor();
    var highlight = ColorLuminance(color, 0.5);
    var transparentColor = colorHexToRGBString(color, 0.2);
    totalDataset = new lineDatasetsObj(totalName, transparentColor, color, highlight, false);

    var totalDataDateIndex = 0
    for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
        if (totalDataDateIndex < totalData.length && trendObj.labelsByDate[i] == totalData[totalDataDateIndex].date) {
            totalDataset.dataByDate.push(totalData[totalDataDateIndex].count);
            ++totalDataDateIndex;
        } else {
            totalDataset.dataByDate.push(0);
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
        var cnt = totalDataset.dataByDate[i];

        var d = new Date(date);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;

        if (currentM != month || currentY != year) {
            if (first) {
                first = false;
            } else {
                totalDataset.dataByMonth.push(sumInThatMonth);
                sumInThatMonth = 0;
            }
            currentM = month;
            currentY = year;
        }

        sumInThatMonth += cnt;
    }
    //last one
    totalDataset.dataByMonth.push(sumInThatMonth);


    //second 
    //group by week
    var currentW = null;
    var currentY = null;
    var sumInThatWeek = 0;
    var first = true;

    for (var i = 0; i < trendObj.labelsByDate.length; ++i) {
        var date = trendObj.labelsByDate[i];
        var cnt = totalDataset.dataByDate[i];

        var d = new Date(date);
        var year = d.getFullYear();
        var week = d.getWeek();

        if (currentW != week || currentY != year) {
            if (first) {
                first = false;
            } else {
                totalDataset.dataByWeek.push(sumInThatWeek);
                sumInThatWeek = 0;
            }
            currentW = week;
            currentY = year;
        }

        sumInThatWeek += cnt;
    }
    //last one
    totalDataset.dataByWeek.push(sumInThatWeek);

    trendObj.datasets.push(totalDataset);
    //    console.log(totalDataset);
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

function setActiveTrend(trend) {
    activeTrend = trend;
}

function getActiveTrend(trend) {
    return activeTrend;
}

function createChartElement(opt) {
    trendObjOriginal = jQuery.extend(true, {}, trendObj);

    var node = document.createElement("canvas");
    node.className = "chart";
    node.id = 'trendChart';
    var container = jQuery('<div/>', {
        class: 'customScrollBar',
    });
    //    var container = document.createElement("div");
    container.css({
            "top": "" + getWindowHeightPercentagePx(0.3) + 'px',
            "left": "2%",
            "width": "100%",
            'border': '10px solid rgba(255,255,255,0)',
            //        "overflow-x": "scroll",
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
                'height': '' + modalHeight + 'px',
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
        )
        .appendTo($('#popupChartContainer'));

    var ctx = node.getContext("2d");

    linechart = new Chart(ctx, {
        type: 'line',
        data: trendObj,
        options: (opt ? opt : newOptions)
    });

    //seperate legend
    var legend = linechart.generateLegend();
    console.log(legend);
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

function createsingleRegionChart(json, trendMode, regionName) {
    //data reset
    chartDestroy(true);
    //resetTotalToggleBtn();
    resetGroupByDelectMenu();
    //fetch data
    trendObj = new lineDataObj();
    setTrendLable(json);

    switch (trendMode) {
        case TREND_MODEL:
            setTrendData(json.groupByModelResults);
            addingTotalLine(json.groupByRegionResults);
            break;

        case TREND_REGION:
            setTrendDataByRegion(json.groupByRegionResults, regionName);
            break;

        case TREND_DEVICE:
            setTrendData(json.groupByDeviceResults);
            addingTotalLine(json.groupByRegionResults);
            break;

        case TREND_DIST:
            setTrendData(json.groupByDistResults);
            addingTotalLine(json.groupByRegionResults);
            break;

        case TREND_BRANCH:
            setTrendData(json.groupByBranchResults);
            addingTotalLine(json.groupByRegionResults);
            break;
    }

    setActiveTrend(trendMode);
    //create chart element
    createChartElement();

    //updateColorInfo();
    loadingDismiss();
}

function createBranchChart(json, trendMode, branchName) {
    //data reset
    chartDestroy(true);
    //resetTotalToggleBtn();
    resetGroupByDelectMenu();
    //fetch data
    trendObj = new lineDataObj();
    setTrendLable(json);

    switch (trendMode) {

        case TREND_MODEL:
            setGapTrendData(json.groupByModelResults, json.gapDevide);
            //        addingTotalLine(json.groupByRegionResults);
            break;

        case TREND_DEVICE:
            setGapTrendData(json.groupByDeviceResults, json.gapDevide);
            //        addingTotalLine(json.groupByRegionResults);
            break;

        case TREND_BRANCH:
            setGapTrendData(json.groupByBranchResults, json.gapDevide, branchName);
            //        addingTotalLine(json.groupByRegionResults);
            break;
    }

    setActiveTrend(trendMode);
    //create chart element
    createChartElement(negOptions);

    //updateColorInfo();
    loadingDismiss();
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

function createTrendChart(json, trendMode) {
    //destroy old chart
    chartDestroy(true);
    //resetTotalToggleBtn();
    resetGroupByDelectMenu();

    trendObj = new lineDataObj();
    //x-axis
    setTrendLable(json);

    //    console.log('setTrendData[start]:'+getCurrentTime());
    switch (trendMode) {
        case TREND_MODEL:
            setTrendData(json.groupByModelResults);
            addingTotalLine(json.groupByDateResults);
            break;

        case TREND_COUNTRY:
            setTrendData(json.groupByCountryResults);
            addingTotalLine(json.groupByDateResults);

            break;

        case TREND_DEVICE:
            setTrendData(json.groupByDeviceResults);
            addingTotalLine(json.groupByDateResults);
            break;
        case TREND_DIST:
            setTrendData(json.groupByDistResults);
            addingTotalLine(json.groupByDateResults);
            break;

        case TREND_BRANCH:
            setTrendData(json.groupByBranchResults);
            addingTotalLine(json.groupByDateResults);
            break;
    }
    setActiveTrend(trendMode);
    createChartElement();
    //updateColorInfo();
}

//no needed
//function updateColorInfo() {
//    var infoDiv = $('#trendColorInfo');
//    infoDiv.css({
//        'max-width': '15%',
////        'overflow-y': 'auto',
//        'top': '' + getWindowHeightPercentagePx(0.15) + 'px',
//    });
//
//    var totalHeight = 0;
//    for (var i in trendObj.datasets) {
//        var dataset = trendObj.datasets[i];
//        var color = dataset.backgroundColor;
//        var name = dataset.label;
//
//        var colorBlock = jQuery('<i/>').css({
//            'background': color,
//            'width': '18px',
//            'height': '18px',
//            'margin-right': '8px',
//            'opacit': '0.7',
//            'display': 'inline-block',
//        });
//
//        var colorName = jQuery('<p/>').css({
//            'margin': '0px',
//            'display': 'inline-block',
//        }).text(name);
//
//        var oneColorInfo = jQuery('<div/>')
//            .append(colorBlock)
//            .append(colorName)
//            .appendTo(infoDiv);
//
//        totalHeight += oneColorInfo.height();
//    }
//
//}

function createTable(isDiff, json, mapObj) {

    var mapSrc = isDiff ? mapObj : firstMap;

    console.log("createTable start");
    $("#tableContainer").empty();

    var tableContenr = '<table id="table" class="table hover table-bordered" cellspacing="0" width="100%">' + '<thead>' + '<tr role="row">' + '<th>Country</th>' + '<th>District/City</th>' + '<th>Model</th>' + '<th>Number</th>' + '</tr>' + '</thead>' + '</table>';
    $("#tableContainer").append(tableContenr);

    var finalTableArray = [];
    for (var i = 0; i < json.length; ++i) {
        if (json[i].displayName != '') {
            finalTableArray.push({
                displayName: json[i].name,
                iso: json[i].country,
                cnt: json[i].cnt,
                model: json[i].models,
            });
        }
    }
    //            console.log(json);
    var table = $('table#table').on('init.dt', function () {
//        $('.dt-buttons').append(
//            jQuery('<a/>', {
//                id: 'exportDetail',
//                class: 'dt-button buttons-html5',
//                tabindex: '0',
//                'aria-controls': "table",
//                href: "#"
//            })
//            .html('<span>Detail</span>')
//            .click(function () {
//                loading('Detail Table Exporting...');
//                ajaxTableDetailExport();
//                //                console.log('exportDetail');
//            })
//        );
    }).DataTable({
        data: finalTableArray,
        columns: [
            {
                data: 'iso'
            },
            {
                data: 'displayName'
            },
            {
                data: 'model'
            },
            {
                data: 'cnt'
            },
            ],
        pageLength: -1,
        dom: 'Bfrtip',
        buttons: [
                /*'copy', 'csv', */
            'excel', 'pdf', 'print'
            ]
    });

    $('#table_wrapper').css({
        "padding": "10px",
    });

    console.log("createTable end");
}

function showGapTrend(mapObj, branchName) {
    if (observeTarget.length > 0 && !mapObj.isEmpty) {
        //        console.log(branchName);
        loading("Creating Chart...");
        scrollToTop();
        popupChartShow(true);
        ajaxTrendOfBranchChart(mapObj, branchName);
    }
}

function tableExportToExcel(text, filename) {
    //    console.log(text);
    var blob = new Blob([text], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8,%EF%BB%BF"
    });
    var strFile = filename + ".xls";
    saveAs(blob, strFile);
    loadingDismiss();
}

function multiSheetTableExport(text, filename, sheetNameList) {
    var strFile = filename + ".xls";
    jQuery('<div/>', {
        id: 'exportDiv'
    }).append(text).appendTo('body');
    tablesToExcel(strFile, 'Excel', sheetNameList);

    loadingDismiss();
}

var tablesToExcel = (function () {
    //<Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders>
    var uri = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8,%EF%BB%BF',
        style = '<Style ss:ID="s66"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Interior ss:Color="#DAEEF3" ss:Pattern="Solid"/></Style><Style ss:ID="s67"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Interior ss:Color="#DAEEF3" ss:Pattern="Solid"/><NumberFormat ss:Format="Percent"/></Style><Style ss:ID="s68"><Interior ss:Color="#DAEEF3" ss:Pattern="Solid"/><NumberFormat ss:Format="0%"/></Style><Style ss:ID="s69"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="新細明體" x:CharSet="136" x:Family="Roman" ss:Size="12" ss:Color="#FF0000"/><Interior ss:Color="#FFFF00" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style><Style ss:ID="s76"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Interior/><NumberFormat ss:Format="Percent"/></Style><Style ss:ID="s77"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>',
        //        style = '<Style ss:ID="s69"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders><Font ss:FontName="新細明體" x:CharSet="136" x:Family="Roman" ss:Size="12" ss:Color="#FF0000"/><Interior ss:Color="#FFFF00" ss:Pattern="Solid"/><NumberFormat/><Protection/></Style><Style ss:ID="s64"><NumberFormat ss:Format="Percent"/></Style>',
        tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"> <Styles> ' + style + ' </Styles>' + '{worksheets}</Workbook>',
        tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>',

        tmplCellXML = '<Cell{ssIndex}{mergeDown}{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>',
        base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        },
        format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            })
        }
    return function (wbname, appname, sheetNameList) {
        var ctx = "";
        var workbookXML = "";
        var worksheetsXML = "";
        var rowsXML = "";

        var count = 0;
        $('#exportDiv table').each(function () {
            var table = this,
                sheetName = sheetNameList[count];

            for (var j = 0; j < table.rows.length; j++) {

                rowsXML += '<Row>';
                for (var k = 0; k < table.rows[j].cells.length; k++) {
                    var needHide = table.rows[j].cells[k].getAttribute("data-needhide");
                    if (needHide) continue;

                    var dataType = table.rows[j].cells[k].getAttribute("data-type");
                    var dataStyle = table.rows[j].cells[k].getAttribute("data-style");
                    var dataValue = table.rows[j].cells[k].getAttribute("data-value");
                    dataValue = (dataValue) ? dataValue : table.rows[j].cells[k].innerHTML;
                    var dataFormula = table.rows[j].cells[k].getAttribute("data-formula");
                    dataFormula = (dataFormula) ? dataFormula : (appname == 'Calc' && dataType == 'DateTime') ? dataValue : null;

                    var dataMerge = table.rows[j].cells[k].getAttribute("data-merge");
                    var ssIndex = table.rows[j].cells[k].getAttribute("data-index");
                    ctx = {
                        attributeStyleID: (dataStyle) ? ' ss:StyleID="' + dataStyle + '"' : '',
                        nameType: (dataType == 'Number' || dataType == 'DateTime' || dataType == 'Boolean' || dataType == 'Error') ? dataType : 'String',
                        data: (dataFormula) ? '' : dataValue,
                        attributeFormula: (dataFormula) ? ' ss:Formula="' + dataFormula + '"' : '',
                        mergeDown: (dataMerge) ? ' ss:MergeDown="' + dataMerge + '"' : '',
                        ssIndex: (ssIndex) ? ' ss:Index="' + ssIndex + '"' : '',
                    };
                    rowsXML += format(tmplCellXML, ctx);
                }
                rowsXML += '</Row>'
            }
            ctx = {
                rows: rowsXML,
                nameWS: sheetName || 'Sheet'
            };
            worksheetsXML += format(tmplWorksheetXML, ctx);
            rowsXML = "";
            ++count;
        });

        ctx = {
            created: (new Date()).getTime(),
            worksheets: worksheetsXML
        };

        workbookXML = format(tmplWorkbookXML, ctx);

        //use objURL instead of using href
        //preventing url exceeding the limit of length
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([uri + workbookXML]));
        a.download = wbname;

        // Append anchor to body.
        document.body.appendChild(a)
        a.click();

        // Remove anchor from body
        document.body.removeChild(a)


        $('#exportDiv').remove();
        loadingDismiss();
    }
})();

function gapReportExportDialogShow() {

    if (getFunction() != FUNC_GAP) return;

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
            'Summary by Branch': function () {
                ajaxGetGapExport('summary');
                $(this).dialog('close');
            },
            'Detail by District/City level': function () {
                ajaxGetGapExport('branch');
                $(this).dialog('close');
            },
        }
    });
    exportTypeDialogDiv.dialog('open');
}
