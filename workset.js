"use strict";

var drawerCollapseBtnWidth = 5;

function init_() {
    loading("initializing...")

    //    console.log('account:' + account);
    //    console.log('isVip:' + isVip);
    //selector option init
    var URLs = "php/dbqueryInit.txt";
    $.ajax({
        url: URLs,
        type: "GET",
        dataType: 'text',
//        data: {
//            account: account,
//            isVIP: isVip,
//            isCFR: isCFR,
//        },
        success: function (json) {
            //            console.log(json);
            json = JSON.parse(decodeEntities(json));
            console.log(json);

            if (!isVip && !json.isPass && !isCFR) {
                noPermissionShow();
            }

            isVip = json.isVIP;
            permission = jQuery.extend({}, json.accountPermission);
            console.log(permission);
            console.log('ispass:' + json.isPass);
            console.log('isVIP:' + isVip);
            console.log('isCFR:' + isCFR);

            //custom user options depend on permission
            if (!DEVMode && !isAdministrator) {
                if (!isCFR) {
                    $('div[data-value="' + FUNC_QC + '"]').remove();
                } else if (isCFR) {
                    if (isVip) {
                        //all functions are accessable
                    }
                    if (!isVip) {
                        //full permission
                        permission = {};

                        $('.homeMenuListItem:not(div[data-value="' + FUNC_QC + '"])').remove();

                        activeFunctionTmp = FUNC_QC;
                        controlPanelDisplayRefresh(FUNC_QC);
                        if (isDistBranchFilterShowing) {
                            //data delete
                            observeDistBranch.length = 0;
                            //UI remove
                            destroyDistBranchCheckBox();
                        }
                        checkboxLocationInit(allLoc);
                    }
                }
            }


            productTopProductIDList = jQuery.extend({}, json.productToProductID);
            //            console.log(productTopProductIDList);

            allDevicesList = jQuery.extend({}, json.allDevices);
            unpopularList = json.unpopularModel;
            checkboxDeviceInit();
            //                    console.log(allDevicesList);

            allLoc = jQuery.extend(true, {}, json.allLoc);
            //            console.log(allLoc);



            //check is Gap mode need to hide
            gapLoc = jQuery.extend(true, {}, json.allLoc);
            for (var terrority in gapLoc) {
                for (var country in gapLoc[terrority]) {
                    if (!isInArray(countryGapModeSupported, gapLoc[terrority][country][0])) {
                        delete gapLoc[terrority][country];
                    }
                }

                if (Object.keys(gapLoc[terrority]).length == 0)
                    delete gapLoc[terrority];
            }
            if (Object.keys(gapLoc).length == 0)
                isNeedToHideGap = true;

            //check is distBranch mode need to hide
            distBranchLoc = jQuery.extend(true, {}, json.allLoc);
            for (var terrority in distBranchLoc) {
                for (var country in distBranchLoc[terrority]) {
                    if (!isInArray(countryNeedToShowDistBranch, distBranchLoc[terrority][country][0])) {
                        delete distBranchLoc[terrority][country];
                    }
                }

                if (Object.keys(distBranchLoc[terrority]).length == 0)
                    delete distBranchLoc[terrority];
            }
            if (Object.keys(distBranchLoc).length == 0)
                isNeedToHideDistBranch = true;

            //if is needed, hide it
            if (isNeedToHideGap)
                $('#dataset option[value="gap"]').remove();

            if (isNeedToHideDistBranch)
                $('#dataset option[value="distBranch"]').remove();


            checkboxLocationInit(allLoc);
            branchDistInit();

            filterDataNull();

            updateTime.activation = json.activationUpdateTime;
            updateTime.lifezone = json.lifezoneUpdateTime;

            datepickerSetting();
            defaultDateSetting();

            //init is activation dataset
            setUpdateTime(updateTime.activation);

            //overview
            if (isAdministrator || DEVMode) {
                overviewSetting();
            } else {
                $('li#info').remove();
            }

            //            filterSubmitButtonColorListener();
            loadingDismiss();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });

    setAccount(' ' + account);

    //    ajaxLoadBookmark();

    //init
    windowSizeSetting();
    resizeInit();
    //    saveBookmarkBtnSetting();
    //    loadBookmarkBtnSetting();

    dateBtnSetting();
    submitBtnSetting();
    buttonInit();
    timePeriodBtnSetting();

    collapseBtnInit();
    //    serviceBtnSetting();
    //    dealerBtnSetting();
    //    helpBtnSetting();
    updateReleaseNote();
    menuAndFilterSetting();

    //    mapContainerFitsize();


    //--------------------------------------
    starIconHoverSetting();

    //expend at first
    activationFunctionListExpend();
}

function windowSizeSetting() {
    var screenHeight = window.innerHeight,
        navHeight = $('.navbar').outerHeight();

    $('#bodyContainer').height(screenHeight - navHeight);
}

//resize mapcontainer
function mapContainerFitsize() {
    //    if (isInArray([FUNC_ACTIVATION, FUNC_DISTBRANCH, FUNC_GAP, FUNC_LIFEZONE, FUNC_PARALLEL, FUNC_QC], getFunction())) {
    //        $('#mapContainer').css("height", '' + (window.innerHeight - $('.navbar').outerHeight() - $('#control_Panel').outerHeight() - 30) + 'px');
    //    } else
    //        $('#mapContainer').css("height", 'auto');
}

function starIconHoverSetting() {
    $('#starHintIcon').hover(
        function () {
            let top = $(this).offset().top,
                left = $(this).offset().left;

            $('#star-tooltip').css({
                top: '' + top + 'px',
                left: '' + left + 'px',
                display: 'block',
            })
        },
        function () {
            $('#star-tooltip').css({
                display: 'none',
            })
        }
    );
}

function menuAndFilterSetting() {
    //menu height setting
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    let bodyHeight = $('body').height(),
        navHeight = $('nav.navbar').outerHeight(),
        menuWidth = $('div#selector').outerWidth();
    //    console.log(navHeight);

    //    let contentHeight = h - navHeight - 10;
    //    $('#selector').css("height", '' + contentHeight + 'px');
    //    $('#rightSideArea').css("height", '' + contentHeight + 'px');

    //menu list padding-left
    let iconWidth = $('.homeMenuItemIcon').outerWidth();
    $('.homeMenuList').css('padding-left', '' + iconWidth + 'px');

    $('#activationTitle').click(function () {
        activationFunctionListExpend();
    });

    $('#collapseBtnContainer').click(function () {

        //need to expend Function List
        if ($('#homeMenuLeft').hasClass('filterShowing')) {
            activationFunctionListExpend();
        }
        //need to collapse Function List
        else if (!$('#homeMenuLeft').hasClass('filterShowing')) {
            activationFunctionListCollapse();
        }
    });

    //

    $('.collapseBtnPart')
        .height($('#bodyContainer').height())
        .css({
            'height': '' + $('#bodyContainer').height() + 'px',
            'top': '0px',
            'left': '' + $('#selector').width() + 'px',
        });


}

function activationFunctionListCollapse() {
    let iconWidth = $('.homeMenuItemIcon').outerWidth(),
        menuWidth = $('div#selector').outerWidth();
    $('#homeMenuLeft').stop().animate({
        width: '' + iconWidth + 'px',
    }, 'fast', 'swing', function () {
        $('#activationTitle').removeClass('expend');
        $('#activationTitleList').slideUp(500, function () {
            $(this).removeClass('expend');
            $(this).css('display', '');
        });

        $('#collapseBtnContainer .glyphicon').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
        $(this).addClass('filterShowing');
        $('#homeMenuRight').css({
            'margin-left': '' + iconWidth + 'px',
            'width': '' + (menuWidth - iconWidth) + 'px',
        });
    });
}

function activationFunctionListExpend() {
    if ($('#homeMenuLeft').hasClass('filterShowing')) {
        $('#homeMenuLeft')
            .removeClass('filterShowing')
            .css('width', '');
    }

    $('#activationTitle').toggleClass('expend');
    $('#activationTitleList').slideToggle(500, function () {
        $(this).toggleClass('expend');
        $(this).css('display', '');
    });

    $('#collapseBtnContainer .glyphicon').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
}

function datepickerSectionCollapse() {
    $('#dateDropdownRight').addClass('needTohideAtFirst');
    $('#dateDropdownLeft').removeClass('datepickerShow');

    $('#datepickContainer').removeClass();
    $('div#datePicker').datepicker('update', '');
}

function datepickerSectionExpend() {
    $('#dateDropdownRight').removeClass('needTohideAtFirst');
    $('#dateDropdownLeft').addClass('datepickerShow');
}

function datepickerSetting() {
    var endTime = new Date(getUpdateTime());
    var updateTime = endTime.getFullYear() + '-' + (endTime.getMonth() + 1) + '-' + endTime.getDate();
    //    console.log(updateTime);

    $('div#datePicker').datepicker({
        format: "yyyy-mm-dd",
        todayHighlight: true,
        autoclose: true,
        endDate: updateTime
    }).on('changeDate', function (e) {
        if ($('#datepickContainer').hasClass('datepickerFrom')) {
            $('input#from').val($('div#datePicker').datepicker('getFormattedDate'))
        } else if ($('#datepickContainer').hasClass('datepickerTo')) {
            $('input#to').val($('div#datePicker').datepicker('getFormattedDate'))
        }
        datepickerSectionCollapse();
        $('#timeSectionBtnButton').html('Time Period <span class="caret"></span>');

        if ($('#dateOK').hasClass('submited'))
            $('#dateOK').removeClass('submited')
    });

    $('.timeSelectorInput#from').click(function () {
        $('#datepickContainer').removeClass().addClass('datepickerFrom');
        datepickerSectionExpend();
    })

    $('.timeSelectorInput#to').click(function () {
        $('#datepickContainer').removeClass().addClass('datepickerTo');
        datepickerSectionExpend();
    })
}

//default setting to Last30Days
function defaultDateSetting() {
    $('#btnLastThirty').trigger('click');
}

function resizeInit() {
    $(window).resize(function () {
        windowSizeSetting();

        mapContainerFitsize();

        //date dropdown re-position
        if ($("#dateDropdown").css("display") != "none") {
            var dateBtn = $("#databtn");
            var dropdown = $("#dateDropdown");
            var offset = dateBtn.offset();

            dropdown.css({
                "left": '' + offset.left + 'px',
                "top": '' + (offset.top + dateBtn.outerHeight() + 2) + 'px',
                "z-index": 9999,
            });
        }

        //toggle reposition
        var selector = $(".filter_wrapper");
        var toggleBtn = $("#toggle");
        var pos = selector.offset();

        if (selector.is(":visible")) {
            toggleBtn.css({
                "left": '' + (pos.left + selector.width() + 5) + 'px',
                "top": '' + pos.top + 'px',
            });
        }

        //map container resize
        optMapSize();

        //info size
        if ($(".legend_" + firstMap.mapName).length > 0) {
            var maxHeight = $("#mapContainer").height() - ($(".legend_" + firstMap.mapName).outerHeight() + 150);
            $('#showModelCount_' + firstMap.mapName).css('max-height', (maxHeight > 0) ? '' + maxHeight + 'px' : '0px');
            //                    console.log('maxHeight change:'+maxHeight);
        }
        if ($(".legend_" + comparisonMap.mapName).length > 0) {
            var maxHeight = $("#mapContainer").height() - ($(".legend_" + comparisonMap.mapName).outerHeight() + 150);
            $('#showModelCount_' + comparisonMap.mapName).css('max-height', (maxHeight > 0) ? '' + maxHeight + 'px' : '0px');
            //                    console.log('maxHeight change:'+maxHeight);
        }

        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        let bodyHeight = $('body').height(),
            navHeight = $('nav.navbar').outerHeight(),
            menuWidth = $('div#selector').outerWidth();
        //    console.log(navHeight);

        //        let contentHeight = h - navHeight - 10;
        //        $('#selector').css("height", '' + contentHeight + 'px');
        //        $('#rightSideArea').css("height", '' + contentHeight + 'px');

        //menu list padding-left
        let iconWidth = $('.homeMenuItemIcon').outerWidth();
        $('.homeMenuList').css('padding-left', '' + iconWidth + 'px');

        //filter resize
        $('#homeMenuRight').css({
            'margin-left': '' + iconWidth + 'px',
            'width': '' + (menuWidth - iconWidth) + 'px',
        });

        $('.collapseBtnPart')
            .height($('#bodyContainer').height())
            .css({
                'height': '' + $('#bodyContainer').height() + 'px',
                'top': '0px',
                'left': '' + $('#selector').width() + 'px',
            })
    });
}

//deprecated currently
function showFilterResult() {
    $('#filterResult').removeClass('needTohideAtFirst');

    var spanDevice = $("#filterBarResults");
    for (var i = 0; i < observeTarget.length; ++i) {
        var devicebtn = jQuery('<button/>')
            .attr({
                type: "button",
                "class": "devices btn btn-default btn-sm",
                "product": observeTarget[i].product,
                "model": observeTarget[i].model,
                "devices": observeTarget[i].devices,
                "datatype": observeTarget[i].datatype,
            })
            .append(
                observeTarget[i].product +
                ((observeTarget[i].model == observeTarget[i].product) ? "" : ("/" + getModelDisplayName(observeTarget[i].model))) +
                ((observeTarget[i].devices == observeTarget[i].model) ? "" : ("/" + observeTarget[i].devices)) +
                '<span class = "closeIcon glyphicon glyphicon-remove"></span>'
            )
            .appendTo(spanDevice);

        devicebtn.click(function (product, model, devices, datatype) {
            return function () {
                if (isLoading()) return;

                //console.log($(this).attr('model'));
                setIsClickFromFilterResult(true);
                console.log("filter delete:" + product + "/" + model + "/" + devices + "/" + datatype);
                for (var i = 0; i < observeTarget.length; ++i) {
                    if (observeTarget[i].product == product && observeTarget[i].model == model && observeTarget[i].devices == devices && observeTarget[i].datatype == datatype) {
                        observeTarget.splice(i, 1);
                        break;
                    }
                }
                console.log(observeTarget);

                needToLoadTwoModeSameTime = (isRegionMarkerSametime()) ? true : false;

                if (getFunction() == FUNC_ACTIVATION) {
                    if (isModeActive(MODE_REGION)) {
                        submitRegion();
                    }
                    if (isModeActive(MODE_MARKER)) {
                        //loading("updating...");
                        submitMarker();
                    }
                } else if (getFunction() == FUNC_GAP) {
                    submitGap();
                } else if (getFunction() == FUNC_LIFEZONE) {
                    submitHeatMap();
                } else if (getFunction() == FUNC_ACTIVATION_TABLE) {
                    $(tableContainer).empty();
                    showTable();
                } else if (getFunction() == FUNC_QC) {
                    if (isModeActive(MODE_QC_REGION))
                        submitSQRegion();
                    if (isModeActive(MODE_QC_MARKER))
                        submitSQMarker();
                } else if (getFunction() == FUNC_PARALLEL) {
                    submitParallel();
                } else if (getFunction() == FUNC_ACTIVATION_DISTRIBUTION) {
                    submitActivateDistribution();
                } else if (getFunction() == FUNC_ACTIVATION_TREND) {
                    submitActivateTrend();
                }
                $(this).off();
                $(this).remove();
            }
        }(observeTarget[i].product, observeTarget[i].model, observeTarget[i].devices, observeTarget[i].datatype));
    }

    if (document.getElementById("filterResult").style.display == "none") {
        $("#filterResult").show();
    }
}

function clearFilterResult() {
    document.getElementById("filterBarResults").innerHTML = "";
}

function noPermissionShow() {
    $('body').empty();

    var container = jQuery('<div/>').appendTo('body');
    var img = jQuery('<img/>', {
        src: 'img/Lock.png',
    }).css({
        'display': 'block',
        'margin': 'auto',
        'width': '15%',
    }).appendTo(container);

    var text = jQuery('<p/>', {
            'class': 'text-info',
        })
        .css({
            'font-size': '18px',
            'text-align': 'center',
            'font-weight': 'bold',
        })
        .text('Permission Deny')
        .appendTo(container);

    container.css({
        'margin-top': '10%'
        //        'position': 'absolute',
        //        'top': '50%',
        //        'left': '50%',
        //        'width': ''+container.outerWidth()+'px',
        //        'height': ''+container.outerHeight()+'px',
        //        'margin-top':'' + (-1*(container.outerHeight()/2)) + 'px',
        //        'margin-left':'' + (-1*(container.outerWidth()/2)) + 'px',
    })
}

function setMainpageTitle(dataSet) {
    //show title bar
    $('.titleBar').removeClass('needTohideAtFirst');
    $('span#title').html($('.homeMenuListItem[data-value="' + dataSet + '"]').text());
}
