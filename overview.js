var topParameterList = ['country', 'model', 'cpu', 'rear_camera', 'front_camera', 'color'];
var topParameterDataSrc = ['observationCountry', 'observationModel', 'observationCpu', 'observationRearCamera', 'observationFrontCamera', 'observationColor'];

var overviewGroupByMode = ['By Day', 'By Week', 'By Month'],
    overviewDefaultGroupBy = overviewGroupByMode[0];

var overviewContainerWidthR = $(window).width() * 0.80 * 0.45 - 20;

var dauDateRangeMax, dauDateRangeMin;
var overviewDatebtn, au, overviewGroupBy;
var TAB_ACTIVATION = 'activation',
    TAB_LIFEZONE = 'lifezone';
var defaultTab = TAB_ACTIVATION,
    currentTab = defaultTab;

function overviewSetting() {

    $('li#info').click(function () {
        //container init
        $('#fullscreenContainer')
            .append('<div id="overview" style="height:100%"><div id="overviewContainer" class="container" style="height: 100%;"><ul style="margin-top:10px;" class="nav nav-tabs"><li class="active overviewtab" id="tabActivation" data-value="' + FUNC_ACTIVATION + '"><a href="#">Activation</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_LIFEZONE + '"><a href="#">Lifezone</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_ACTIVATION_TABLE + '"><a href="#">Activation Table</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_GAP + '"><a href="#">GAP by branch</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_DISTBRANCH + '"><a href="#">Branch vs. Disti</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_QC + '"><a href="#">CFR Map</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_PARALLEL + '"><a href="#">Parallel Goods</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_ACTIVATION_TREND + '"><a href="#">Activation Trend</a></li><li class="overviewtab" id="tabLifezone" data-value="' + FUNC_ACTIVATION_DISTRIBUTION + '"><a href="#">Activation Distribution</a></li><li class="overviewtab" id="tabMobile" data-value="' + FUNC_MOBILE + '"><a href="#">Mobile</a></li></ul><div id="overviewContent" class="container" style="height: 90%;"></div></div></div>');

        //tab pager
        $('.overviewtab').click(function () {
            if ($(this).attr('data-value') == currentTab) return;

            $('.overviewtab').removeClass('active');
            $(this).addClass('active');

            currentTab = $(this).attr('data-value');
            //            console.log(currentTab);
            overviewInit();
        });
        fullscreenShow(true);
        overviewInit();
    });
}

function fullscreenShow(needToLockScroll) {
    document.getElementById('mapid').style.zIndex = -1;
    document.getElementById('mapidComparison').style.zIndex = -1;
    //    document.getElementById('toggle').style.zIndex = -1;
    $('.ui-widget').css('z-index', -1);

    $('#fullscreenContainer').css({
        //"min-height": screen.height,
        "opacity": 0.99,
        'z-index': 1,
    });

    //close btn
    jQuery('<span/>', {
            id: 'closeLineChart',
            class: 'ui-icon ui-icon-arrow-1-w',
        })
        .hover(
            function () {
                $(this).removeClass("ui-icon-arrow-1-w").addClass("ui-icon-circle-arrow-w");
            },
            function () {
                $(this).removeClass("ui-icon-circle-arrow-w").addClass("ui-icon-arrow-1-w");
            }
        )
        .appendTo($('#fullscreenContainer'))
        .click(function () {
            if (isLoading()) return;
            fullscreenClose(needToLockScroll);
        });

    bodyHide();
}

function fullscreenClose(needToLockScroll) {
    document.getElementById('mapid').style.zIndex = 1;
    document.getElementById('mapidComparison').style.zIndex = 1;
    //    document.getElementById('toggle').style.zIndex = 1;
    $('.ui-widget').css('z-index', 1);
    $('#fullscreenContainer').css({
        "min-height": '0px',
        "opacity": 0,
        'z-index': -1,
    });

    $('#fullscreenContainer').empty();

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

function mobileExport() {
    var from = $("#overviewFrom").val();
    var newFrom = from;
    var to = $("#overviewTo").val();
    var newTo = to;
    console.log(newFrom);
    console.log(newTo);

    $.ajax({
        url: 'php/_dbqueryMobileOverviewExport.php',
        type: "GET",
        dataType: 'text',
        data: {
            stratTime: newFrom,
            endTime: newTo,
        },
        success: function (json) {
            var tableStr = decodeEntities(json);
            //            console.log(tableStr);
            tableExportToExcel(tableStr, 'MobileOverview');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("mobileExport:" + xhr.status);
            alert(thrownError);
        }

    });
}

function overviewInit() {
    $('#overviewContent').empty();

    $.ajax({
        url: 'php/_dbqueryGetOverview.php',
        type: "GET",
        dataType: 'text',
        data: {
            dataset: currentTab,
        },
        success: function (json) {
            json = JSON.parse(decodeEntities(json));
//            console.log(json);

            if (currentTab == FUNC_MOBILE) {
                $('#overviewContent').html('<div id="overviewDatebtn">' +
                    '<label style="margin-right: 5px;"><b>Date Range</b></label>' +
                    '<button id="timeSectionBtnButton" type="button" class="btn btn-default overviewDate">Date</button>' +

                    //----------
                    '<div id="overviewDateDropdown">' +
                    '<div class="dateDropdownSector" id="overviewDateDropdownLeft">' +
                    '<div id="overviewTimeSection">' +
                    '<p><b>Select date range</b></p>' +
                    '<div class="btn-group" id="overviewTimeSectionBtnDiv">' +
                    '<button type="button" id="overviewTimeSectionBtnButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Time Period <span class="caret"></span></button>' +
                    '<ul class="dropdown-menu" role="menu">' +
                    '<li id="overviewBtnLastSeven"><a href="#">Last 7 Days</a></li>' +
                    '<li id="overviewBtnLastThirty"><a href="#">Last 30 Days</a></li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>' +
                    '<div id="overviewDatepickContainer">' +
                    '<p><b>Custom</b></p>' +
                    '<div class="customTimeSelectorContainer">' +
                    '<span class="customTimeSelectorLabel">START:</span>' +
                    '<input class="timeSelectorInput customTimeSelectorInput" type="text" id="overviewFrom" name="from" placeholder="START">' +
                    '</div>' +
                    '<div class="customTimeSelectorContainer">' +
                    '<span class="customTimeSelectorLabel">END:</span>' +
                    '<input class="timeSelectorInput customTimeSelectorInput" type="text" id="overviewTo" name="to" placeholder="END">' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="dateDropdownSector needTohideAtFirst" id="overviewDateDropdownRight">' +
                    '<div id="overviewDatePicker"></div>' +
                    '</div>' +
                    '</div>' +

                    '</div>' +
                   '<button type="button" class="btn btn-default" id="overviewMobileExport">EXPORT</button>');
                overviewDateBtnInit();
                overviewDatepickerSetting();

                $('#overviewMobileExport').click(function () {
                    mobileExport();
                });

            }
            //no data
            else if (json.allCount == 0) {
                $('#overviewContent').html('<h2> No history record </h2>');
            } else {
                overviewElementCreate();

                overviewDateBtnInit();
                overviewDatepickerSetting();
                //display text init
                dauDateRangeMax = json.usercountEachDay[json.usercountEachDay.length - 1].date;
                dauDateRangeMin = json.usercountEachDay[0].date;
                var dataRange = dauDateRangeMin + '~' + dauDateRangeMax;

                overviewInitTop(json);
                overviewInitCenterLeft(json);
                overviewInitCenterCenter(json);
                overviewInitCenterRight(json);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("_dbqueryGetOverview:" + xhr.status);
            alert(thrownError);
        }
    });
}

function overviewElementCreate() {
    var container = $('#overviewContent')
        .append('<div id="overviewTop">' + '</div>' +
            '<div id="overviewCenter">' +
            '<div class="row" style="height: 100%;">' +

            '<div class="overviewCenter col-xs-3" style="height: 100%;" id="overviewCenterLeft">' +
            '<div id="todayLogin"></div>' +
            '<div id="divider"></div>' +
            '<div id="topTenLogin"></div>' +
            '</div>' +

            '<div class="col-xs-3" style="height: 100%;">' +
            '<div class="overviewCenter" id="overviewCenterCenter"></div>' +
            '</div>' +

            '<div class="col-xs-6" style="height: 100%;">' +
            '<div class="overviewCenter" id="overviewCenterRight">' +
            '<div id="overviewDatebtn">' +
            '<label style="margin-right: 5px;"><b>Date Range</b></label>' +
            '<button id="timeSectionBtnButton" type="button" class="btn btn-default overviewDate">Date</button>' +
            //---------------------
            '<div id="overviewDateDropdown">' +
            '<div class="dateDropdownSector" id="overviewDateDropdownLeft">' +
            '<div id="overviewTimeSection">' +
            '<p><b>Select date range</b></p>' +
            '<div class="btn-group" id="overviewTimeSectionBtnDiv">' +
            '<button type="button" id="overviewTimeSectionBtnButton" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Time Period <span class="caret"></span></button>' +
            '<ul class="dropdown-menu" role="menu">' +
            '<li id="overviewBtnLastSeven"><a href="#">Last 7 Days</a></li>' +
            '<li id="overviewBtnLastThirty"><a href="#">Last 30 Days</a></li>' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div id="overviewDatepickContainer">' +
            '<p><b>Custom</b></p>' +
            '<div class="customTimeSelectorContainer">' +
            '<span class="customTimeSelectorLabel">START:</span>' +
            '<input class="timeSelectorInput customTimeSelectorInput" type="text" id="overviewFrom" name="from" placeholder="START">' +
            '</div>' +
            '<div class="customTimeSelectorContainer">' +
            '<span class="customTimeSelectorLabel">END:</span>' +
            '<input class="timeSelectorInput customTimeSelectorInput" type="text" id="overviewTo" name="to" placeholder="END">' +
            '</div>' +
            '</div>' +
            '<div><button type="button" class="btn btn-default overviewSubmit">Apply</button></div>' +

            '</div>' +
            '<div class="dateDropdownSector needTohideAtFirst" id="overviewDateDropdownRight">' +
            '<div id="overviewDatePicker"></div>' +
            '</div>' +
            '</div>' +

            //------------------
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');
}

function overviewDatepickerSectionCollapse() {
    $('#overviewDateDropdownRight').addClass('needTohideAtFirst');
    $('#overviewDateDropdownLeft').removeClass('datepickerShow');

    $('#overviewDatepickContainer').removeClass();
    $('div#overviewDatePicker').datepicker('update', '');
}

function overviewDatepickerSectionExpend() {
    $('#overviewDateDropdownRight').removeClass('needTohideAtFirst');
    $('#overviewDateDropdownLeft').addClass('datepickerShow');
}

function overviewDatepickerSetting() {
    var endTime = new Date(getUpdateTime());
    var updateTime = endTime.getFullYear() + '-' + (endTime.getMonth() + 1) + '-' + endTime.getDate();
    //    console.log(updateTime);

    $('div#overviewDatePicker').datepicker({
        format: "yyyy-mm-dd",
        todayHighlight: true,
        autoclose: true,
        endDate: updateTime
    }).on('changeDate', function (e) {
        if ($('#overviewDatepickContainer').hasClass('datepickerFrom')) {
            $('#overviewFrom').val($('div#overviewDatePicker').datepicker('getFormattedDate'))
        } else if ($('#overviewDatepickContainer').hasClass('datepickerTo')) {
            $('#overviewTo').val($('div#overviewDatePicker').datepicker('getFormattedDate'))
        }
        overviewDatepickerSectionCollapse();
        $('#overviewTimeSectionBtnButton').html('Time Period <span class="caret"></span>');
    });

    $('#overviewFrom').click(function () {
        $('#overviewDatepickContainer').removeClass().addClass('datepickerFrom');
        overviewDatepickerSectionExpend();
    })

    $('#overviewTo').click(function () {
        $('#overviewDatepickContainer').removeClass().addClass('datepickerTo');
        overviewDatepickerSectionExpend();
    })
}

function overviewDateBtnInit(json) {
    //dropdown setting
    var dropdown = $("#overviewDateDropdown");
    $("button.overviewDate").click(function () {
        if (isLoading()) return;

        if (dropdown.css("display") == "none") {
            overviewDateMenuShow();
        } else {
            overviewDateMenuHide();
        }
    });

    $(document.body).click(function (e) {
        //click target is not dropdown menu
        if ((!$("#overviewDateDropdown").is(e.target) && $("#overviewDateDropdown").has(e.target).length === 0)) {
            //click target is not date button & datepicker is not showing
            if ((!$("button.overviewDate").is(e.target) && $("button.overviewDate").has(e.target).length === 0)) {
                //if menu is showing, hide it
                if (!$('#overviewDateDropdown').is(':hidden')) {
                    $('#overviewDateDropdown').fadeOut(300);
                }
            }
        }
    });

    //time period setting
    overviewTimePeriodBtnSetting();

    //submit setting
    overviewSubmitSetting();
}

function overviewTimePeriodBtnSetting() {
    document.getElementById("overviewBtnLastSeven").onclick = function () {

        var updateTime = new Date(getUpdateTime());
        var updateTimeStr = parseDateToStr(updateTime);

        var sevenDaysBefore = new Date(getUpdateTime());
        sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 6);
        var sevenDaysBeforeStr = parseDateToStr(sevenDaysBefore);

        $("#overviewFrom").val(sevenDaysBeforeStr);
        $("#overviewTo").val(updateTimeStr);

        datepickerSectionCollapse();


        $('#overviewTimeSectionBtnButton').html($(this).text() + '<span class="caret"></span>');
    }

    document.getElementById("overviewBtnLastThirty").onclick = function () {
        var updateTime = new Date(getUpdateTime());
        var updateTimeStr = parseDateToStr(updateTime);

        var thirtyDaysBefore = new Date(getUpdateTime());
        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 29);
        var thirtyDaysBeforeStr = parseDateToStr(thirtyDaysBefore);

        $("#overviewFrom").val(thirtyDaysBeforeStr);
        $("#overviewTo").val(updateTimeStr);

        datepickerSectionCollapse();
        $('#overviewTimeSectionBtnButton').html($(this).text() + '<span class="caret"></span>');
    }
}

function overviewDateMenuShow() {
    var dateBtn = $("button.overviewDate");
    var dropdown = $("#overviewDateDropdown");
    var pos = dateBtn.position();

    dropdown.css({
        "left": '' + pos.left + 'px',
        //        "top": '' + (pos.top + dateBtn.height() + 2) + 'px',
        //        "width": '' + dateBtn.width() - 8 + 'px',
        "z-index": 9999,
        "padding": "10px",
    });
    dropdown.fadeIn(300);
}

function overviewDateMenuHide() {
    $('#overviewDateDropdown').fadeOut(300);
}

function overviewDateBtnTextUpdate() {
    //    var from = $("#overviewFrom").datepicker("getDate");
    //    var to = $("#overviewTo").datepicker("getDate");
    //    //console.log(from);
    //    var text = (from.getFullYear() + "-" + (from.getMonth() + 1) + "-" + from.getDate()) + '~' + (to.getFullYear() + "-" + (to.getMonth() + 1) + "-" + to.getDate());
    //    $('button.overviewDate').button('option', 'label', text);
}

function overviewSubmitSetting() {
    $('button.overviewSubmit').click(function () {
        //dismiss menu
        $('#overviewDateDropdown').fadeOut(300);
        //remove single day history
        $('#loginHistoryContainer').remove();
        //load
        loading("Creating chart");

        var from = $("#overviewFrom").val();
        var newFrom = from;
        var to = $("#overviewTo").val();
        var newTo = to;

        var URLs = "php/_dbqueryGetLogUserCount.php";
        $.ajax({
            url: URLs,
            type: "GET",
            data: {
                dataset: currentTab,
                start: newFrom,
                end: newTo,
            },
            dataType: 'text',

            success: function (json) {
                json = JSON.parse(decodeEntities(json));
                //out of range
                if (parseDate(newTo) < parseDate(dauDateRangeMin) || parseDate(newFrom) > parseDate(dauDateRangeMax)) {
                    chartDestroy(false);
                    console.log('out of range');
                } else {
                    createDauChart(json);
                }
                $('#auLabel').text('DAU: ' + getAu());

                loadingDismiss();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("GetLogUserCount:" + xhr.status);
                alert(thrownError);
                loadingDismiss();
            }
        });
    });
}

function overviewInitTop(json) {
    var allUserCount = Number(decodeEntities(json.allUserCount));
    var allConsultationCount = Number(decodeEntities(json.allCount));
    var consultationPerEachUser = Math.round(allConsultationCount / allUserCount);

    if ($.isNumeric(allUserCount) && $.isNumeric(allConsultationCount)) {
        $('#overviewTop')
            .empty()
            .append('<b>Total user count:</b> ' + allUserCount + '　　' + '<b>Total consultation count:</b> ' + allConsultationCount + '　　' + '<b>Average consultation count per user:</b> ' + consultationPerEachUser);
    }
}

function overviewInitCenterLeft(json) {
    //todayLogin
    var container = $('#todayLogin');
    container.empty();
    container.addClass('w3-card-2 w3-light-grey w3-round-small card-padding');

    var title = jQuery('<div/>', {
            class: 'centerLeftTitle overviewTitle',
        })
        .text('Today login count')
        .appendTo(container);

    var list = jQuery('<div/>', {
            class: 'overviewList',
        })
        .css({
            'max-height': '400px',
            'margin-top': '10px',
        })
        .appendTo(container);

    if (json.todayUserArray.length == 0) {
        jQuery('<p/>')
            /*.css({
                        'list-style-type': 'none',
                    })*/
            .text('no login user yet today.').appendTo(list);
    } else {
        for (var i in json.todayUserArray) {
            var accountName = json.todayUserArray[i];
            jQuery('<li/>').css({
                'list-style-type': 'none',
            }).text(accountName).appendTo(list);
        }
    }
    //topTenLogin
    var container = $('#topTenLogin');
    container.empty();
    container.addClass('w3-card-2 w3-light-grey w3-round-small card-padding');

    var title = jQuery('<div/>', {
            class: 'centerLeftTitle overviewTitle',
        })
        .text('Active user Top 10')
        .appendTo(container);

    var tableContainer = jQuery('<div/>', {
            class: 'customScrollBar',
        })
        .css({
            'margin-top': '10px',
            'max-height': '85%',
        })
        .appendTo(container);

    var table = jQuery('<table/>').css({
        'width': '90%',
        //        'margin': '10px auto',
    }).appendTo(tableContainer);
    for (var i in json.topTenUserArray) {
        var accountName = json.topTenUserArray[i].username;
        var count = json.topTenUserArray[i].count;
        jQuery('<tr/>')
            .append(
                jQuery('<td/>').text(accountName)
            ).append(
                jQuery('<td/>')
                .text(count)
                .css({
                    'text-align': 'right',
                })
            ).appendTo(table);
    }
}

function overviewInitCenterCenter(json) {
    var selectedIndex = 0;

    var container = $('#overviewCenterCenter');
    container.empty();
    container.addClass('w3-card-2 w3-light-grey card-padding w3-round-small');

    var title = jQuery('<div/>', {
            class: 'centerCenterTitle',
        })
        .css({
            'margin-bottom': '10px',
        })
        .appendTo(container);

    jQuery('<label/>', {
            class: 'overviewTitle'
        })
        .text('Top consultation parameter')
        .css('margin-right', '5px')
        .appendTo(title);


    var selector = jQuery('<div/>', {
            class: 'btn-group'
        })
        .append(
            jQuery('<button/>', {
                type: "button",
                id: "overviewParameterSelect",
                class: "btn btn-default dropdown-toggle",
                'data-toggle': "dropdown"
            }).html(topParameterList[selectedIndex] + '<span class="caret"></span>')
        )
        .append(
            jQuery('<ul/>', {
                id: 'overviewParameterSelectUl',
                class: "dropdown-menu",
                role: "menu"
            })
        )
        .appendTo(title);

    for (var i in topParameterList) {
        var value = topParameterList[i];
        jQuery('<li/>', {
                value: value,
            }).html('<a href="#">' + value + '</a>')
            .appendTo('ul#overviewParameterSelectUl');
    }

    //    var selector = jQuery('<select/>').appendTo(title);
    //    for (var i in topParameterList) {
    //        var value = topParameterList[i];
    //        jQuery('<option/>', {
    //            value: value,
    //        }).text(value).appendTo(selector);
    //    }
    //    selector.children('option[value="' + topParameterList[selectedIndex] + '"]').attr('selected', 'selected');

    var contentContainer = jQuery('<div/>', {
            class: 'centerCenterContent customScrollBar',
        })
        .appendTo(container);

    var table = overviewTopParameterTable(topParameterList[selectedIndex], json);
    table.appendTo(contentContainer);

    //jqueryUI selector setting
    $('ul#overviewParameterSelectUl li').click(function () {
        if (isLoading()) return;
        contentContainer.hide();

        var parameter = $(this).attr('value');
        var table = overviewTopParameterTable(parameter, json);
        contentContainer.empty();
        table.appendTo(contentContainer);
        contentContainer.fadeIn(300);

        $('#overviewParameterSelect').html($(this).text() + '<span class="caret"></span>')
    });
}

function overviewTopParameterTable(parameter, json) {

    var dataSrc = topParameterDataSrc[topParameterList.indexOf(parameter)];

    var table = jQuery('<table/>')
        .css({
            'width': '90%',
            'margin': 'auto',
        });
    for (var i in json[dataSrc]) {
        var name = json[dataSrc][i].displayName;
        if (name == "_All") continue;

        var count = json[dataSrc][i].count;
        var percentage = '' + ((count / json[dataSrc][0].count) * 100).toFixed(2) + '%';
        jQuery('<tr/>')
            .append(
                jQuery('<td/>').text(name)
            ).append(
                jQuery('<td/>').text(percentage)
            ).append(
                jQuery('<td/>')
                .text(count)
                .css({
                    'text-align': 'right',
                })
            ).appendTo(table);
    }

    return table;
}

function overviewInitCenterRight(json) {
    var container = $('#overviewCenterRight');
    //container.empty();
    container.addClass('w3-card-2 w3-light-grey card-padding w3-round-small');

    var title = jQuery('<div/>', {
        class: 'centerRightTitle'
    }).css({
        'display': 'inline-block',
        'margin-left': '10px'
    }).appendTo(container);

    jQuery('<label/>', {
            class: 'overviewTitle'
        })
        .text('Active User:')
        .css('margin-right', '5px')
        .appendTo(title);

    //    <div class="btn-group">
    //        <button type="button" id="dimensionSelector" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Dimension <span class="caret"></span></button>
    //        <ul class="dropdown-menu" role="menu">
    //            <li class="dimension" data-dimension="dimension_country"><a href="#">Country</a></li>
    //            <li class="dimension" data-dimension="dimension_branch"><a href="#">Branch</a></li>
    //            <li class="dimension" data-dimension="dimension_l1"><a href="#">1st-level division</a></li>
    //            <li class="dimension" data-dimension="dimension_l2"><a href="#">2nd-level division</a></li>
    //        </ul>
    //    </div>


    var selector = jQuery('<div/>', {
            class: 'btn-group'
        })
        .append(
            jQuery('<button/>', {
                type: "button",
                id: "overviewTimePeriodSelect",
                class: "btn btn-default dropdown-toggle",
                'data-toggle': "dropdown"
            }).html('By... <span class="caret"></span>')
        )
        .append(
            jQuery('<ul/>', {
                id: 'overviewTimePeriodSelectUl',
                class: "dropdown-menu",
                role: "menu"
            })
        )
        .appendTo(title);
    for (var i in groupByMode) {
        var value = groupByMode[i];
        jQuery('<li/>', {
                value: value,
            }).html('<a href="#">' + value + '</a>')
            .appendTo('ul#overviewTimePeriodSelectUl');
    }
    overviewGroupBy = overviewDefaultGroupBy;


    //    var selector = jQuery('<select/>', {
    //        id: 'overviewTimePeriodSelect'
    //    }).appendTo(title);
    //    for (var i in groupByMode) {
    //        var value = groupByMode[i];
    //        jQuery('<option/>', {
    //            value: value,
    //        }).text(value).appendTo(selector);
    //    }

    //DAU calculation
    var dau = jQuery('<label/>', {
            class: 'overviewTitle',
            id: 'auLabel'
        })
        .css('margin-right', '5px')
        .appendTo(
            jQuery('<div/>').css({
                'display': 'inline-block',
                'margin-left': '10px',
            }).appendTo(container)
        );

    //jqueryUI selector setting
    $('ul#overviewTimePeriodSelectUl li').click(function () {
        //remove login history
        $('#loginHistoryContainer').remove();

        //not allow switching while loading
        overviewGroupBy = $(this).attr('value');
        overviewGroupByChange(overviewGroupBy);
        chartDestroy(false);
        createDauChartElement();
        switch (overviewGroupBy) {
            case 'By Day':
                dau.text('DAU: ' + getAu());
                break;

            case 'By Month':
                dau.text('MAU: ' + getAu());
                break;

            case 'By Week':
                dau.text('WAU: ' + getAu());
                break;
        }

        $('#overviewTimePeriodSelect').html($(this).text() + '<span class="caret"></span>');
    })

    createDauChart(json);
    dau.text('DAU: ' + getAu());
}

function createDauChart(json) {
    dauChartDestroy();

    trendObj = new lineDataObj();
    setDauLable(json);
    setDauData(json);
    overviewGroupByChange(overviewDefaultGroupBy);
    createDauChartElement();
    //    updateColorInfo();
}

function setDauLable(json) {
    var dataSrc = json.dau;
    trendObj = new lineDataObj();

    //LABEL SETTING
    //======================================================
    var startDate = dataSrc[0].date;
    var endDate = dataSrc[dataSrc.length - 1].date;
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
    //    overviewGroupByChange(overviewDefaultGroupBy);
}

function setDauData(json) {
    var dataSrc = json.dau;

    //clean
    trendObj.datasets.length = 0;

    var color = getRandomColor();
    var highlight = ColorLuminance(color, 0.5);
    var transparentColor = colorHexToRGBString(color, 0.2);
    var dataset = new lineDatasetsObj('User Count', transparentColor, color, highlight, false);

    //first
    //handle the data group by date 
    var DateIndex = 0
    for (var i = 0; i < trendObj.labelsByDate.length; ++i) {

        var find = dataSrc.filter(function (obj) {
            return obj.date == trendObj.labelsByDate[i]
        });
        if (find == false) {
            dataset.dataByDate.push(0);
        } else {
            dataset.dataByDate.push(find[0].count);
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
        var year = d.getFullYear();
        var week = d.getWeek();

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
    //    console.log(trendObj);
}

function createDauChartElement(c) {
    var node = document.createElement("canvas");
    node.className = "chart";
    node.id = 'trendChart';

    var container = jQuery('<div/>', {
        class: 'customScrollBar',
        id: 'trendContainer',
    }).css({
        'border': '10px solid rgba(255,255,255,0)',
        "overflow-y": "hidden",
        //hide first
        "opacity": "0",
    }).append($(node));

    //width cal
    var labelCount = trendObj.labels.length;
    var tmpSpacing = (overviewContainerWidthR - axisWidth) / (labelCount + 1);
    var spacing = (tmpSpacing < chartSpacing) ? chartSpacing : tmpSpacing;

    node.style.height = '300px';
    node.style.width = (axisWidth + spacing * trendObj.labels.length > 32500) ? ('32500px') : '' + (axisWidth + spacing * trendObj.labels.length) + 'px';

    $("#overviewCenterRight").append(container);
    var ctx = node.getContext("2d");
    linechart = new Chart(ctx, {
        type: 'line',
        data: trendObj,
        options: newOptions
    });
    //    console.log(trendObj);
    container.scrollLeft(parseInt(node.style.width));

    node.onclick = function (evt) {
        $('#loginHistoryContainer').remove();

        var activePoints = linechart.getElementsAtEvent(evt);
        if (activePoints.length == 0)
            return;

        var loginHistoryContainer = jQuery('<div/>', {
            class: 'customScrollBar',
            id: 'loginHistoryContainer',
        }).css({
            'margin-top': '10px',
            'height': '30%',
        }).appendTo($('#overviewCenterRight'));

        var pointingLabel = activePoints[0]._chart.config.data.labels[activePoints[0]._index];
        var startTime, endTime;
        switch (overviewGroupBy){
            case 'By Day':
                startTime = pointingLabel;
                endTime = pointingLabel;
                break;
            case 'By Week':
                var date = new Date(pointingLabel);
                var dateSplit = getWeekNumber(date);
                var year = dateSplit.year;
                var week = dateSplit.weekNumber;
                var startDate = getDateOfISOWeek(week, year);
                startTime = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();

                var endDate = new Date(startTime);
                endDate.setDate(endDate.getDate() + 6);
                endTime = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();
                break;
            case 'By Month':
                var dateSplit = pointingLabel.split('-');
                var year = dateSplit[0];
                var month = dateSplit[1];
                startTime = year + '-' + month + '-1';
                var endTimeTmp = new Date(startTime);
                endTimeTmp.setMonth(endTimeTmp.getMonth() + 1);
                endTimeTmp.setDate(endTimeTmp.getDate() - 1);
                endTime = endTimeTmp.getFullYear() + '-' + (endTimeTmp.getMonth() + 1) + '-' + endTimeTmp.getDate();

                break;
        }

        $.ajax({
            url: 'php/_dbqueryGetOverviewLoginCnt.php',
            type: "GET",
            data: {
                dataset: currentTab,
                startTime: startTime,
                endTime: endTime,
            },
            dataType: 'text',

            success: function (json) {
                json = JSON.parse(decodeEntities(json));
                //                console.log(json);
                jQuery('<label/>', {
                        class: 'overviewTitle'
                    })
                    .text('[' + pointingLabel + ']:')
                    .css('margin-bottom', '5px')
                    .appendTo(loginHistoryContainer);

                if (json.length == 0) {
                    jQuery('<h4/>').text('no history').appendTo(loginHistoryContainer);
                } else {
                    var table = jQuery('<table/>')
                        .css('width', '40%')
                        .append(
                            jQuery('<tr/>').html('<th>user</th><th>count</th>')
                        )
                        .appendTo(loginHistoryContainer);

                    for (var i in json) {
                        var username = json[i].username;
                        var count = json[i].count;
                        jQuery('<tr/>')
                            .append(
                                jQuery('<td/>').text(username)
                            ).append(
                                jQuery('<td/>').text(count)
                            ).appendTo(table);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("GetLogUserCount:" + xhr.status);
                alert(thrownError);
            }
        });
    }
    //show up
    container.animate({
        opacity: 1,
    }, 'slow');
}

function dauChartDestroy() {
    if (trendObj != null) {
        trendObj = null;
    }

    if (linechart != null) {
        linechart.destroy();
    }

    $('#trendContainer').remove();
}

function auCalculation() {
    var sum = 0;
    for (var i in trendObj.datasets[0].data) {
        sum += trendObj.datasets[0].data[i];
    }
    au = (sum / (trendObj.labels.length)).toFixed(2);
}

function getAu() {
    return au;
}

function overviewGroupByChange(chanegTo) {
    switch (chanegTo) {
        case 'By Day':
            trendObj.labels = trendObj.labelsByDate.slice();
            trendObj.datasets[0].data = trendObj.datasets[0].dataByDate;
            break;
        case 'By Month':
            trendObj.labels = trendObj.labelsByMonth.slice();
            trendObj.datasets[0].data = trendObj.datasets[0].dataByMonth;
            break;
        case 'By Week':
            trendObj.labels = trendObj.labelsByWeek.slice();
            trendObj.datasets[0].data = trendObj.datasets[0].dataByWeek;
            break;
    }
    auCalculation();

    //    trendObj.labels.push("");
}
