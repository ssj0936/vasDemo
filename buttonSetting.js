"use strict";

var isFunctionSelectorInit = false;

function buttonInit() {
    //dataset selector init
    $('.homeMenuListItem').click(function () {
        if (isLoading())
            return false;

        if ($(this).attr('click-disable') == "true")
            return false;

        activationFunctionListCollapse();

        var dataSet = $(this).attr('data-value');
        activeFunctionTmp = dataSet;

        setMainpageTitle(dataSet);
        controlPanelDisplayRefresh(dataSet);

        switch (dataSet) {
            case FUNC_GAP:
                if (isDistBranchFilterShowing) {
                    //data delete
                    observeDistBranch.length = 0;
                    //UI remove
                    destroyDistBranchCheckBox();
                }
                checkboxLocationInit(gapLoc);

                break;

            case FUNC_DISTBRANCH:
                var needToShowDistBranch = false;
                for (var i in observeLocTmp) {
                    if (countryNeedToShowDistBranch.indexOf(observeLocTmp[i]) != -1) {
                        needToShowDistBranch = true;
                        break;
                    }
                }
                //create dist branch filter
                if (needToShowDistBranch && observeLocTmp.length == 1) {
                    if (!isDistBranchFilterShowing) {
                        isDistBranchFilterShowing = true;
                        //filter show up
                        $('#section_branch_dist').stop(true, true).fadeIn('medium');
                        $('#section_branch_dist').collapsible('open');

                        ajaxLoadBranchDist();
                    }
                } else {
                    if (isDistBranchFilterShowing) {
                        //data delete
                        observeDistBranch.length = 0;
                        //UI remove
                        destroyDistBranchCheckBox();
                    }
                }
                checkboxLocationInit(distBranchLoc);
                break;

            default:
                if (isDistBranchFilterShowing) {
                    //data delete
                    observeDistBranch.length = 0;
                    //UI remove
                    destroyDistBranchCheckBox();
                }
                checkboxLocationInit(allLoc);

                break;
        }
        //        console.log(observeTarget);
        //        console.log(observeLoc);
        if (observeTarget.length > 0 || observeLoc.length > 0) {
            $("#submit").trigger('click')
        }
    });

    actiationControlPanel.actiationControlPanelInit();
    lifezoneControlPanel.lifezoneControlPanelInit();
    qcControlPanel.qcControlPanelInit();
    parallelControlPanel.parallelControlPanelInit();
    activationTrendControlPanel.activationTrendControlPanelInit();
    activationDistributedControlPanel.activationDistributedControlPanelInit();
}

function controlPanelDisplayRefresh(dataset) {
    //hide all first
    $('.controlPanel').hide();
    $('.model-plus').show();
    exportButtonSetting();
    switch (dataset) {
        case FUNC_PARALLEL:
            //hide date button
            $('#dateContainer').hide();
            //control panel switch
            $('.control_panel_right').show();
            $('#parallelControlPanel').show("medium");
            $('#filterCountryContainer').show('medium');
            collapseDeviceDescription();
            recheckDeviceCheckbox();
            break;

        case FUNC_ACTIVATION:
            //show date button
            $('#dimension').show('medium');
            $('#dateContainer').show('medium');
            //control panel switch
            $('.control_panel_right').hide();
            $('#activationControlPanel').show("medium");
            $('#filterCountryContainer').show('medium');

            break;
        case FUNC_LIFEZONE:
            //hide date button
            $('#dateContainer').hide();
            //control panel switch
            $('.control_panel_right').hide();
            $('#lifezoneControlPanel').show("medium");
            $('#filterCountryContainer').show('medium');

            break;
        case FUNC_QC:
            //hide date button
            $('#dateContainer').hide();
            //control panel switch
            clearControlPanel();
            $('.control_panel_right').hide();
            $('#qcControlPanel').show("medium");
            $('#filterCountryContainer').show('medium');
            collapseDeviceDescription();
            recheckDeviceCheckbox();

            break;

        case FUNC_ACTIVATION_TABLE:
            //show date button
            $('#dateContainer').show('medium');
            //control panel switch
            $('.control_panel_right').hide();
            $('#filterCountryContainer').show('medium');

            break;

        case FUNC_DISTBRANCH:
            //show date button
            $('#dimension').hide();
            $('#dateContainer').show('medium');
            //control panel switch
            clearControlPanel();
            $('.control_panel_right').hide();
            $('#activationControlPanel').show("medium");
            $('#filterCountryContainer').show('medium');

            break;

        case FUNC_GAP:
            //show date button
            $('#dateContainer').show('medium');
            //control panel switch
            clearControlPanel();
            $('.control_panel_right').show('medium');
            $('#filterCountryContainer').show('medium');

            break;

        case FUNC_ACTIVATION_TREND:
            //show date button
            $('#dateContainer').show('medium');
            //control panel switch
            clearControlPanel();
            $('.control_panel_right').show('medium');
            $('#activationTrendControlPanel').show("medium");
            $('#filterCountryContainer').show('medium');

            break;

        case FUNC_ACTIVATION_DISTRIBUTION:
            //show date button
            $('#dateContainer').show('medium');
            //control panel switch
            clearControlPanel();
            $('.control_panel_right').hide();
            $('#activationDistributionControlPanel').show("medium");
            $('#filterCountryContainer').show('medium');

            break;
    }
}

function clearControlPanel() {
    $('.controlPanel').find('button').removeClass('active');
    lifezoneControlPanel.lifezoneButtonsetSetCurrentValue();
    actiationControlPanelRefresh();
}

function exportButtonSetting() {
    //    rightControlPanelInit();
    //    console.log(observeTarget);
    //    console.log(observeLoc);
    if (observeTarget.length == 0 || observeLoc.length == 0 || (getFunction() != FUNC_GAP && getFunction() != FUNC_PARALLEL && getFunction() != FUNC_ACTIVATION_TREND)) {
        $('.control_panel_right #export *[type="button"]').attr('disabled', true);
    } else {
        $('.control_panel_right #export *[type="button"]').removeAttr('disabled');
    }

    //decide to show button or button group
    if (getFunction() == FUNC_GAP || getFunction() == FUNC_PARALLEL) {
        $('#panelRightButton').addClass('needTohideAtFirst');
        $('#panelRightButtonGroup').removeClass('needTohideAtFirst');
    } else if (getFunction() == FUNC_ACTIVATION_TREND) {
        $('#panelRightButton').removeClass('needTohideAtFirst');
        $('#panelRightButtonGroup').addClass('needTohideAtFirst');
    }

    //append options for certain function
    switch (getFunction()) {
        case FUNC_GAP:
            $('#panelRightButtonGroupUl').empty();
            $('#panelRightButtonGroupUl').append(
                jQuery('<li/>')
                .append(jQuery('<a/>', {
                        href: "#"
                    })
                    .text("Summary by Branch")
                )
                .click(function () {
                    ajaxGetGapExport('summary');
                })
            );

            $('#panelRightButtonGroupUl').append(
                jQuery('<li/>')
                .append(jQuery('<a/>', {
                        href: "#"
                    })
                    .text("Detail by District/City level")
                )
                .click(function () {
                    ajaxGetGapExport('branch');
                })
            );
            break;
        case FUNC_PARALLEL:

            $('#panelRightButtonGroupUl').empty();
            $('#panelRightButtonGroupUl').append(
                jQuery('<li/>')
                .append(jQuery('<a/>', {
                        href: "#"
                    })
                    .text("Parallel Import")
                )
                .click(function () {
                    ajaxParallelExport(FILE_EXPORT_TYPE_IMPORT);
                })
            );

            $('#panelRightButtonGroupUl').append(
                jQuery('<li/>')
                .append(jQuery('<a/>', {
                        href: "#"
                    })
                    .text("Parallel Export")
                )
                .click(function () {
                    ajaxParallelExport(FILE_EXPORT_TYPE_EXPORT);
                })
            );
            break;

        case FUNC_ACTIVATION_TREND:
            $('#panelRightButton').off().click(function () {
                activationTrend.exportFile();
            })
            break;
    }
}

//function lifezoneButtonsetValueReset() {
//    lifeZoneTime.time = 1;
//    lifeZoneTime.week = 1;
//}
//
//function lifezoneButtonsetRefresh() {
//    $('div#lifezoneWeekDayBtnset button').removeClass('active');
//    $('div#lifezonePartOfDayBtnset button').removeClass('active');
//
//    $('div#lifezoneWeekDayBtnset button[data-value="' + lifeZoneTime.week + '"]').addClass('active');
//    $('div#lifezonePartOfDayBtnset button[data-value="' + lifeZoneTime.time + '"]').addClass('active');
//}

function actiationControlPanelRefresh() {
    $("#mode button").removeClass("active");

    var modeList = [MODE_MARKER, /*MODE_COMPARISION*/ , MODE_REGION, /*MODE_GAP*/ ];
    for (var i in modeList) {
        var mode = modeList[i];

        if (isModeActive(mode)) {
            $("#mode button#" + mode).addClass("active");
        }
    }
}

function unactiveModeBtn($this) {
    switch ($this.attr("id")) {
        case "region":
            //console.log("region");
            firstMap.removePolygonMap();
            setModeOff(MODE_REGION);
            firstMap.info.update();
            if (firstMap.hasSnapshotBtn) {
                firstMap.removeSnapshot();
            }
            if (isModeActive(MODE_MARKER)) {
                firstMap.hideLegend();
            }
            break;
        case "marker":
            //console.log("marker");
            removeMarkerMap();
            firstMap.showLegend();
            setModeOff(MODE_MARKER);
            //resetIsClickFromFilterResult();
            break;
        case "comparison":
            //console.log("comparison");
            setCompareCheckbox(false);
            comparisionMapShrink();
            setModeOff(MODE_COMPARISION);
            //console.log("unactiveModeBtn_comparison");
            break;
        case "gap":
            //change table button text
            //            $('#table').button('option', 'label', 'Table');

            firstMap.removePolygonMap();
            cleanBranch();
            break;
        case "qcRegion":
            removeSQRegion();
            setModeOff(MODE_QC_REGION);
            break;
        case "qcMarker":
            removeSQMarker();
            setModeOff(MODE_QC_MARKER);
            break;
    }
}

function activeModeBtn($this) {
    switch ($this.attr("id")) {
        case "region":
            if (!firstMap.hasSnapshotBtn) {
                firstMap.addSnapshot();
            }
            setModeOn(MODE_REGION);
            submitRegion();
            break;
        case "marker":
            setModeOn(MODE_MARKER);
            if (!isRegionMarkerSametime())
                firstMap.hideLegend();
            submitMarker();
            break;
        case "gap":
            submitGap();
            break;
        case "qcRegion":
            submitSQRegion();
            break;
        case "qcMarker":
            submitSQMarker();
            break;
    }
}

function timePeriodBtnSetting() {
    document.getElementById("btnLastSeven").onclick = function () {

        var updateTime = new Date(getUpdateTime());
        var updateTimeStr = parseDateToStr(updateTime);

        var sevenDaysBefore = new Date(getUpdateTime());
        sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 6);
        var sevenDaysBeforeStr = parseDateToStr(sevenDaysBefore);

        $("#from").val(sevenDaysBeforeStr);
        $("#to").val(updateTimeStr);

        datepickerSectionCollapse();


        $('#timeSectionBtnButton').html($(this).text() + '<span class="caret"></span>');
        if ($('#dateOK').hasClass('submited'))
            $('#dateOK').removeClass('submited')
    }

    document.getElementById("btnLastThirty").onclick = function () {
        var updateTime = new Date(getUpdateTime());
        var updateTimeStr = parseDateToStr(updateTime);

        var thirtyDaysBefore = new Date(getUpdateTime());
        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 29);
        var thirtyDaysBeforeStr = parseDateToStr(thirtyDaysBefore);

        $("#from").val(thirtyDaysBeforeStr);
        $("#to").val(updateTimeStr);

        datepickerSectionCollapse();
        $('#timeSectionBtnButton').html($(this).text() + '<span class="caret"></span>');
        if ($('#dateOK').hasClass('submited'))
            $('#dateOK').removeClass('submited')
    }
}

function dealerBtnSetting() {
    $('#dealer').click(function () {
        if (isLoading()) return;
        dealerSubmit();
    });
}

function serviceBtnSetting() {
    $('button#service').click(function () {
        if (isLoading()) return;

        serviceSubmit();
    });
}

function dateBtnSetting() {
    var dropdown = $("#dateDropdown");
    $("button.date").click(function () {
        if (isLoading()) return;

        if (dropdown.css("display") == "none") {
            dateMenuShow();
        } else {
            dateMenuHide();
        }
    });

    $('button#dateOK').click(function () {
        dateMenuHide();
        //set text of date 
        let fromTimeStr = $('.timeSelectorInput#from').val(),
            toTimeStr = $('.timeSelectorInput#to').val();
        console.log(fromTimeStr);
        console.log(toTimeStr);
        $('#dateTextDisplay').html(fromTimeStr + "<br> ~ <br>" + toTimeStr);
        $(this).addClass('submited');
    });

    $(document.body).click(function (e) {
        //        console.log(e.target);
        //click target is not dropdown menu
        if ((!$("#dateDropdown").is(e.target) && $("#dateDropdown").has(e.target).length === 0)) {
            //click target is not date button & datepicker is not showing
            if ((!$("button.date").is(e.target) && $("button.date").has(e.target).length === 0)) {
                //if menu is showing, hide it
                if (!$('#dateDropdown').is(':hidden')) {
                    dateMenuHide();
                }
            }
        }
    });

}

function dateMenuShow() {
    var dateBtn = $("#databtn");
    var dropdown = $("#dateDropdown");
    var offset = dateBtn.offset();

    dropdown.css({
        "left": '' + offset.left + 'px',
        "top": '' + (offset.top + dateBtn.outerHeight() + 2) + 'px',
        //        "width": '250px',
        "z-index": 9999,
    });
    dropdown.fadeIn(300);
}

function dateMenuHide() {
    $('#dateDropdown').fadeOut(300, datepickerSectionCollapse);
}

function mapBtnSetting() {
    document.getElementById("map").onclick = function () {
        $("#workset").show();
        $("#homepage").hide();
        $("#homepage").empty();
        if (document.getElementById("mapid").childNodes.length == 0) {
            mapInit();
        }
    }
}

function setSubmitPressed() {
    $('button#submit').css({
        background: '#BEBEBE',
        color: '#FFF',
    });
}

function setSubmitUnpressed() {
    $('button#submit').css({
        background: '#007FFF',
        color: '#FFF',
    });
}

function submitBtnSetting() {
    $("#submit").click(function () {
        if (isLoading()) return;

        setSubmitUnpressed();

        if (observeTargetTmp.length == 0) {
            showAlert("Please select a observation Target");
            $("#workset").hide();
            $("#tableContainer").hide();
            $("#homepage").show();
            $("#homepage").empty().html('<span class="font13">Please select a observation Target</span>');

        } else if ($("#locationFilter input[type='checkbox']:checked").length == 0 && isNeedCheckCountry()) {
            showAlert("Please select a observation Location");
            $("#workset").hide();
            $("#tableContainer").hide();
            $("#homepage").show();
            $("#homepage").empty().html('<span class="font13">Please select a observation Location</span>');
        } else if (activeFunctionTmp == FUNC_QC && $("#locationFilter input[type='checkbox'][datatype='country']:checked").length > 1) {
            cleanLocFilter();
            showAlert("Only allows of 1 country checked in CFR function");
            $("#workset").hide();
            $("#tableContainer").hide();
            $("#homepage").show();
            $("#homepage").empty().html('<span class="font13">Only allows of 1 country checked in CFR function</span>');
        } else if (parseDate($("#from").val()) > parseDate($("#to").val())) {
            showAlert("From <b>" + $("#from").val() + "</b> to <b>" + $("#to").val() + "</b><br>" + "Time input error !");
            $("#workset").hide();
            $("#tableContainer").hide();
            $("#homepage").show();
            $("#homepage").empty().html('<span class="font13">' + "From <b>" + $("#from").val() + "</b> to <b>" + $("#to").val() + "</b><br>" + "Time input error !" + '</span>');
        } else {

            //change apply button color
            setSubmitPressed();

            if (activeFunctionTmp == null) {
                setMainpageTitle(FUNC_ACTIVATION);
                controlPanelDisplayRefresh(FUNC_ACTIVATION);
            }

            resetIsClickFromFilterResult();
            //UI display change
            dateMenuHide();
            //init
            if (document.getElementById('workset').style.display == "none" && activeFunctionTmp != FUNC_ACTIVATION_TABLE && activeFunctionTmp != FUNC_ACTIVATION_DISTRIBUTION) {
                $("#workset").show();
                $("#homepage").hide();
                //                $("#homepage").empty();
                if (document.getElementById("mapid").childNodes.length == 0) {
                    mapInit();
                }
            } else if (activeFunctionTmp == FUNC_ACTIVATION_TABLE || activeFunctionTmp == FUNC_ACTIVATION_DISTRIBUTION) {
                $("#homepage").hide();
                //                $("#homepage").empty();
            }

            //if change dataset
            //need to clean old setting
            if (getFunction() != null && activeFunctionTmp != null && getFunction() != activeFunctionTmp) {
                console.log('switch to ' + activeFunctionTmp);
                switch (getFunction()) {

                    case FUNC_ACTIVATION_TREND:
                        $('#activationTrendBy button').removeClass('active');
                        $('#activationTrendLevel button').removeClass('active');
                        $('#activationTrendTimeScale button').removeClass('active');

                        $('#activationTrendRight').addClass('needTohideAtFirst');
                        currentTrendBy = defaultTrendBy;
                        currentTrendLevel = defaultTrendLevel;
                        currentTrendTimescale = defaultTrendTimescale;
                        activationTrend.chartDestroy();

                        //empty selector
                        $('#showSelector').empty();
                        activationTrendControlPanel.disableActivationTrendControl();
                        break;

                    case FUNC_ACTIVATION_DISTRIBUTION:
                        $('#activationDistributedLeft button').removeClass('active');
                        $('#activationDistributedRight button').removeClass('active');
                        $('#activationDistributedRight').addClass('needTohideAtFirst');
                        currentDistributedLevel = defaultDistributedLevel;
                        currentDistributedBy = defaultDistributedBy;
                        activationDistribution.chartDestroy();
                        activationDistributedControlPanel.disableActivationDistributionControl();
                        break;

                    case FUNC_PARALLEL:
                        //console.log("region");
                        firstMap.removePolygonMap();
                        $('#parallelMode button').removeClass('active');
                        setModeOff(MODE_PARALLEL_EXPORT);
                        setModeOff(MODE_PARALLEL_IMPORT);
                        //                        firstMap.info.update();
                        if (firstMap.hasSnapshotBtn) {
                            firstMap.removeSnapshot();
                        }
                        disableParallelControl();
                        break;

                    case FUNC_DISTBRANCH:
                    case FUNC_ACTIVATION:
                        console.log('switch from ' + FUNC_ACTIVATION);
                        //un-pressed every mode btn
                        $("#mode button.active").each(function () {
                            console.log($(this).attr('id'));
                            unactiveModeBtn($(this));
                            $(this).removeClass('active');
                        });
                        firstMap.currentRegionIso = [];
                        disableActivationMapControl();
                        //close overlay
                        closeDealer();
                        closeService();
                        break;
                        //switch from lifezone
                    case FUNC_LIFEZONE:
                        console.log('switch from ' + FUNC_LIFEZONE);
                        removeHeatMap();
                        disableLifezoneControl();
                        firstMap.addSnapshot();
                        break;
                    case FUNC_ACTIVATION_TABLE:
                        console.log('switch from ' + FUNC_ACTIVATION_TABLE);
                        $('#tableContainer').empty();
                        break;

                    case FUNC_GAP:
                        console.log('switch from ' + FUNC_GAP);
                        //change table button text
                        firstMap.currentRegionIso = [];
                        firstMap.removePolygonMap();
                        cleanBranch();
                        break;
                    case FUNC_QC:
                        //reset
                        currentView = DEFAULT_VIEW;
                        currentCategory = DEFAULT_CATEGORY;

                        console.log('switch from ' + FUNC_QC);
                        //reset view button
                        $('#qcView button').removeClass('active');


                        //change table button text
                        firstMap.currentRegionIso = [];
                        firstMap.removePolygonMap();
                        if (isModeActive(MODE_QC_MARKER)) {
                            removeSQMarker();
                            setModeOff(MODE_QC_MARKER);
                        }

                        if (isModeActive(MODE_QC_REGION)) {
                            removeSQRegion();
                            setModeOff(MODE_QC_REGION);
                        }

                        removeSQMarker();
                        removeSQRegion();
                        disableQCControl();
                        mapInit();
                        break;
                }
                needToForceExtractMap = true;
                setFunction(activeFunctionTmp);
                console.log('diff');
            }

            //need to close popup
            if (firstMap.map)
                firstMap.map.closePopup();
            if (comparisonMap.map)
                comparisonMap.map.closePopup();

            firstMap.needRefetchColorGrade = true;
            //clone decided filter from tmpFilter
            //then clear tmp filter
            observeTarget = observeTargetTmp.slice();
            console.log("observeTarget:");
            console.log(observeTarget);

            observeTargetDeviceOnly = observeTargetDeviceOnlyTmp.slice();

            observeLoc = observeLocTmp.slice();
            console.log("observeLoc:");
            console.log(observeLoc);

            observeLocFullName = observeLocFullNameTmp.slice();
            console.log("observeLocFullName:");
            console.log(observeLocFullName);

            observeSpec = jQuery.extend({}, observeSpecTmp);
            console.log("observeSpec:");
            console.log(observeSpec);

            filterRecordClean();
            filterRecord();

            //filter data collection
            var from = $("#from").val();
            var to = $("#to").val();
            //console.log(from);

            firstMap.fromFormatStr = from;
            firstMap.toFormatStr = to;

            console.log(firstMap.fromFormatStr);
            console.log(firstMap.toFormatStr);

            //2017/08/16
            //date button text display
            $('#dateTextDisplay').html(firstMap.fromFormatStr + "<br> ~ <br>" + firstMap.toFormatStr);
            
            saveLog();
            mapContainerFitsize();
            //            console.log(getFunction());
            switch (getFunction()) {
                case FUNC_ACTIVATION:
                case FUNC_DISTBRANCH:

                    if (getFunction() == FUNC_DISTBRANCH && $('input[name="branchDist"]:checked').length == 0 && $('input[name="distBranch"]:checked').length == 0 && $('input[name="onlineDist"]:checked').length == 0) {
                        showAlert('plz check any dist/branch');
                        $("#workset").hide();
                        $("#tableContainer").hide();
                        $("#homepage").show();
                        $("#homepage").empty().html('<span class="font13">plz check any dist/branch</span>');
                        break;
                    }

                    $('#tableContainer').hide();
                    $('#workset').show('medium');


                    enableActivationMapControl();

                    //                    firstMap.currentDimension = DIMENSION_L2;
                    //need to detect dimension every submit
                    let allSelectedCountryIsBranchAccessable = true;
                    for (var i in observeLoc) {
                        if (!isInArray(countryGapModeSupported, observeLoc[i]))
                            allSelectedCountryIsBranchAccessable = false;
                    }

                    if (allSelectedCountryIsBranchAccessable)
                        $('li[data-dimension="' + DIMENSION_BRANCH + '"]').show();
                    else
                        $('li[data-dimension="' + DIMENSION_BRANCH + '"]').hide();

                    if (getFunction() == FUNC_DISTBRANCH) {
                        firstMap.currentDimensionTmp = DIMENSION_L2;
                    }
//                    else if (allSelectedCountryIsBranchAccessable) {
//                        firstMap.currentDimensionTmp = DIMENSION_BRANCH;
//                    } 
                    else if (observeLoc.length == 1) {
                        firstMap.currentDimensionTmp = DIMENSION_L2;
                    } else if (observeLoc.length > 1) {
                        firstMap.currentDimensionTmp = DIMENSION_L1;
                    }

                    if (firstMap.currentDimensionTmp != firstMap.currentDimension) {
                        firstMap.currentDimension = firstMap.currentDimensionTmp;
                        isDimensionChanged = true;
                        actiationControlPanel.setActiveOption(firstMap.currentDimension);
                    }

                    //doesnt press mode yet, default press "region"
                    if ($("#mode button.active").length == 0 || $("button#region").hasClass("active")) {
                        setModeOn(MODE_REGION);
                        if (!$("button#region").hasClass("active"))
                            modeBtnPress($("button#region"));

                        if (!firstMap.hasSnapshotBtn) {
                            firstMap.addSnapshot();
                        }

                        needToLoadTwoModeSameTime = (isRegionMarkerSametime()) ? true : false;
                        console.log("needToLoadTwoModeSameTime:" + needToLoadTwoModeSameTime);

                        comparisonMap.fromFormatStr = undefined;
                        comparisonMap.toFormatStr = undefined;

                        firstMap.zoomToSelectedLocation();
                        submitRegion();
                    }
                    if ($("button#marker").hasClass("active")) {
                        if (!$("button#marker").hasClass("active"))
                            modeBtnPress($("button#marker"));
                        //$("button#marker").toggleClass("active");

                        needToLoadTwoModeSameTime = (isRegionMarkerSametime()) ? true : false;
                        console.log("needToLoadTwoModeSameTime:" + needToLoadTwoModeSameTime);

                        comparisonMap.fromFormatStr = undefined;
                        comparisonMap.toFormatStr = undefined;

                        firstMap.zoomToSelectedLocation();
                        submitMarker();
                    }
                    //button class reset

                    if (isServiceLayerShowing) {
                        openService();
                    }

                    if (isDealerLayerShowing) {
                        openDealer();
                    }

                    //reset time section button
                    //                    $("#timeSection button").each(function () {
                    //                        $(this).removeClass("btn_pressed").addClass("btn_unpressed");
                    //                    });

                    break;
                case FUNC_LIFEZONE:
//                    enableLifezoneControl();

                    $('#tableContainer').hide();
                    $('#workset').show('medium');

                    firstMap.zoomToSelectedLocation();
                    lifezoneControlPanel.lifezoneButtonsetResetToDefault();
                    submitHeatMap();
                    break;

                case FUNC_ACTIVATION_TABLE:
                    //clear the content
                    $(tableContainer).empty();

                    //hide map
                    $('#workset').hide();
                    $('#tableContainer').show('medium');

                    showTable();

                    break;

                case FUNC_GAP:
                    if (!isGapButtonCanShow) {
                        showAlert('GAP mode only supported in single selected country');
                        cleanLocFilter();
                        return;
                    }

                    $('#tableContainer').hide();
                    $('#workset').show('medium');
                    submitGap();
                    firstMap.zoomToSelectedLocation();
                    break;

                case FUNC_QC:
                    enableQCControl();

                    $('#tableContainer').hide();
                    $('#workset').show('medium');

                    if ($("#qcMode button.active").length == 0 || $("button#qcRegion").hasClass("active")) {
                        if (!$("button#qcRegion").hasClass("active"))
                            modeBtnPress($("button#qcRegion"));

                        submitSQRegion();
                    }

                    if ($("button#qcMarker").hasClass("active")) {
                        submitSQMarker();
                    }

                    qcControlPanel.buttonTextSetting();

                    needToLoadTwoModeSameTime = (isRegionMarkerSametime()) ? true : false;
                    console.log("needToLoadTwoModeSameTime:" + needToLoadTwoModeSameTime);
                    firstMap.zoomToSelectedLocation();
                    setInitialZoom(firstMap.map.getZoom());
                    break;

                case FUNC_PARALLEL:
                    enableParallelControl();
                    $('#tableContainer').hide();
                    $('#workset').show('medium');

                    submitParallel();
                    break;

                    //                case FUNC_COMPOSE:
                    //
                    //                    $(tableContainer).empty();
                    //                    //hide map
                    //                    $('#workset').hide();
                    //                    $('#tableContainer').show('medium');
                    //                    submitCompose();
                    //                    break;

                case FUNC_ACTIVATION_DISTRIBUTION:
                    activationDistributedControlPanel.enableActivationDistributionControl();
                    activationDistributedControlPanel.activationDistributedRegionBtnSetting();

                    currentDistributedBy = defaultDistributedBy;
                    currentDistributedLevel = defaultDistributedLevel;
                    $('#activationDistributedRight').addClass('needTohideAtFirst');
                    activationDistributedControlPanel.buttonTextSetting();

                    $(tableContainer).empty();
                    //hide map
                    $('#workset').hide();
                    $('#tableContainer').show('medium');
                    submitActivateDistribution();
                    break;

                case FUNC_ACTIVATION_TREND:
                    activationTrendControlPanel.enableActivationTrendControl();
                    activationTrendControlPanel.trendRegionAccessSetting();

                    currentTrendBy = defaultTrendBy;
                    currentTrendLevel = defaultTrendLevel;
                    currentTrendTimescale = defaultTrendTimescale;

                    $('#activationTrendRight').addClass('needTohideAtFirst');
                    activationTrendControlPanel.buttonTextSetting();

                    $(tableContainer).empty();
                    //hide map
                    $('#workset').hide();
                    $('#tableContainer').show('medium');
                    submitActivateTrend();
                    break;
            }
            //text in date button
            var buttonStr = ($('button.btn_pressed').length == 0) ? "" : ("<br>(" + $('button.btn_pressed').children('span').text() + ")");
            exportButtonSetting();

            //            clearFilterResult();
            //            showFilterResult();

        }
    });
}

function modeBtnPress($this) {
    $(".mode.active").each(function () {
        unactiveModeBtn($(this));
    });
    $(".mode.active").removeClass("active");

    $this.addClass("active");
}

function submitCompose() {
    //    loading("Data loading...");
    compose.showChart();
}

function submitActivateDistribution() {
    loading("Data loading...");
    ajaxGetActivationDistribution();
}

function submitActivateTrend() {
    loading("Data loading...");
    ajaxGetActivationTrend();
}

function submitGap() {
    loading("Data loading...");
    observeBranchName = ['all'];

    if (observeTarget.length == 0) {
        firstMap.info.update();
        firstMap.removePolygonMap();
        cleanBranch();
        loadingDismiss();
        return;
    }

    if (JSON.stringify(firstMap.currentRegionIso) == JSON.stringify(observeLoc) && !needToForceExtractMap) {
        console.log("same world region");
        ajaxGetGapData(function () {
            ajaxFetchMapValue();
        });
    } else {
        console.log("diff world region");
        ajaxExtractMap(false, function () {
            ajaxGetGapData(function () {
                ajaxFetchMapValue();
            });
        });
    }
    needToForceExtractMap = false;
}

function submitParallel() {
    loading("Data loading...");

    if (observeTarget.length == 0) {
        firstMap.info.update();
        firstMap.cleanMap();
        loadingDismiss();
    } else {
        if (JSON.stringify(firstMap.currentRegionIso) == JSON.stringify(observeLoc) && !needToForceExtractMap) {
            console.log("same world region");
            ajaxFetchParallelValue();
        } else {
            console.log("diff world region");
            ajaxExtractParallelMap(ajaxFetchParallelValue);
        }
        needToForceExtractMap = false;
    }
}

function submitRegion() {
    if (observeTarget.length == 0) {
        firstMap.info.update();
        //initMapProperties();
        firstMap.cleanMap();
        //removePolygonMap(false);
        //        loadingDismiss();
        //enableResultBtn();
        showToast("Empty Data During This Date Time Period");
        firstMap.isEmpty = true;
    } else {
        loading("Data loading...");
        firstMap.needRefetchColorGrade = true;

        ajaxGetBranchObject(function () {
            //same world region, no need to re-fetch/*
            if (JSON.stringify(firstMap.currentRegionIso) == JSON.stringify(observeLoc) && !isMapModified && !needToForceExtractMap && !isDimensionChanged) {
                console.log("same world region");
                if (observeTarget.length != 0) {
                    ajaxFetchMapValue();
                } else {
                    loadingDismiss();
                }
            } else {
                console.log("diff world region");
                if (firstMap.currentDimension != DIMENSION_COUNTRY) {
                    ajaxExtractMap(false, function () {
                        ajaxFetchMapValue();
                    });
                } else {
                    ajaxExtractCountryMap(function () {
                        ajaxFetchMapValue();
                    });
                }
                isDimensionChanged = false;
            }
            needToForceExtractMap = false;
        });
    }
    //button class reset
    //    $("#timeSection button").each(function () {
    //        $(this).removeClass("btn_pressed").addClass("btn_unpressed");
    //    });
}

function submitMarker() {
    if (observeTarget.length == 0) {
        //        console.log('123');
        removeMarkerMap();
        //        loadingDismiss();
        if (!needToLoadTwoModeSameTime)
            showToast("Empty Data During This Date Time Period");
        firstMap.isEmpty = true;
    } else {
        loading("Data loading...");
        ajaxGetMarker();
    }

    firstMap.info.update();

    //button class reset
    //    $("#timeSection button").each(function () {
    //        $(this).removeClass("btn_pressed").addClass("btn_unpressed");
    //    });
}

function submitHeatMap() {
    ajaxGetHeatMap();
}

function submitSQRegion() {
    setModeOn(MODE_QC_REGION);
    if (observeTarget.length == 0) {
        firstMap.info.update();
        removeSQRegion();
        loadingDismiss();
    } else {
        //same world region, no need to re-fetch/*
        if (JSON.stringify(firstMap.currentRegionIso) == JSON.stringify(observeLoc) && !isMapModified && !needToForceExtractMap) {
            console.log("same world region");
            if (observeTarget.length != 0) {
                ajaxGetSQRegion();
            } else {
                loadingDismiss();
            }
        } else {
            console.log("diff world region");
            ajaxExtractMap(false, ajaxGetSQRegion);
        }
        needToForceExtractMap = false;
    }
}

function submitSQMarker(view) {
    setModeOn(MODE_QC_MARKER);
    ajaxGetSQMarker();
}

function collapseBtnInit() {
    // up side filter toggle
    var toggleTopBtn = $('li#toggleControlPanel');
    var toggleTopBtnIcon = $('span#toggleControlPanelIcon')
    var controlPanelTop = $('div#control_Panel');
    toggleTopBtn.click(function () {
        toggleTopBtnIcon.toggleClass("glyphicon-menu-up").toggleClass("glyphicon-menu-down");
        //collaspe
        if (toggleTopBtnIcon.hasClass('glyphicon-menu-down')) {
            controlPanelTop.stop(true, true).slideUp("medium",
                function () {
                    optMapSize();
                    comparisionMapResize();
                });
        }
        //show up
        else {
            controlPanelTop.stop(true, true).slideDown("medium", function () {
                optMapSize();
                comparisionMapResize();
            });
        }
    });


    //left side filter toggle
    var leftToggleBtn = $('span.filterCollapseBtn'),
        leftToggleBtnContainer = $('div.collapseBtnPart'),
        toggleTarget = $('#selector');
    leftToggleBtn.click(function () {
        if (toggleTarget.is(':visible')) {
            leftToggleBtnContainer.hide();

            toggleTarget.fadeOut(function () {
                leftToggleBtnContainer.css({
                    left: '0px'
                }).show();
                leftToggleBtn.text('>');
                $('#rightSideArea').removeClass('col-xs-10').addClass('col-xs-12');
                mapContainerFitsize();
            });
        } else {
            leftToggleBtnContainer.hide();
            toggleTarget.fadeIn(function () {
                leftToggleBtnContainer.css({
                    'left': '' + $('#selector').width() + 'px',
                }).show();
                leftToggleBtn.text('<');
                $('#rightSideArea').removeClass('col-xs-12').addClass('col-xs-10');
                mapContainerFitsize();
            });
        }
    });
}

function showTable() {
    loading("Creating Table...");
    if (JSON.stringify(firstMap.currentRegionIso) == JSON.stringify(observeLoc)) {
        console.log("same region");
        ajaxFetchTableValue(false);
    } else {
        console.log("diff region");
        ajaxFetchTableValue(true);
    }
}

function enableControlPanel() {
    //    console.log('enable ControlPanel');
    $("#control_Panel button").removeAttr("disabled");
}

function disableActivationMapControl() {
    //    console.log('disable activation');
    $("#mode button").attr("disabled", true);
    $("#dimension button").attr("disabled", true);
    $("button#showtrendActivation").attr("disabled", true);
}

function enableActivationMapControl() {
    //    console.log('enable activation');
    $("#mode button").removeAttr("disabled");
    $("#dimension button").removeAttr("disabled");
    $("button#showtrendActivation").removeAttr("disabled");
}

function disableLifezoneControl() {
    //    console.log('disable lifezone');
    $('#lifezoneWeekDayBtnset').attr("disabled", true);
    $('#lifezonePartOfDayBtnset').attr("disabled", true);
}

function enableLifezoneControl() {
    //    console.log('enable lifezone');
    $('#lifezoneWeekDayBtnset').removeAttr("disabled");
    $('#lifezonePartOfDayBtnset').removeAttr("disabled");
}

function disableParallelControl() {
    $("#parallelModeSelector").attr("disabled", true);
}

function enableParallelControl() {
    $("#parallelModeSelector").removeAttr("disabled");
}

function disableQCControl() {
    $('button.qcMode, button#qcViewSelector, button#qcCategory, button#showtrendCFR').attr("disabled", true);

}

function enableQCControl() {
    $('button.qcMode, button#qcViewSelector, button#qcCategory, button#showtrendCFR').removeAttr("disabled");
}

//return current mode whether need check country or not
function isNeedCheckCountry() {
    return $('#filterCountryContainer').is(':visible')
}

function helpBtnSetting() {
    $('li#help').click(function () {
        window.open("https://asus-my.sharepoint.com/personal/ian_tseng_asus_com/_layouts/15/guestaccess.aspx?guestaccesstoken=BU2IOjBOaDRC1SYG3Zbl8oleTaILoQ%2bJ2dqLlFxSDRU%3d&docid=06088da14c0af498f9fdda46073db83d9&rev=1");
    });
}
