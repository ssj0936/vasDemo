"use strict";

function saveBookmarkBtnSetting() {
    $('li#navAddBookmark').click(function () {
        if (isLoading()) return;
        if (account == undefined) {
            showToast('This feature is not available for guest.');
            return;
        }

        if (observeTarget.length != 0) {

            var titleStr = '[';
            for (var i = 0; i < observeTarget.length; ++i) {
                titleStr += observeTarget[i].model + ", ";
            }
            titleStr += ']';
            titleStr += ('[' + getFunction() + ']');
            $('#bookmark_title').val(titleStr);

            var descStr = '[';
            for (var i = 0; i < observeLoc.length; ++i) {
                descStr += observeLoc[i] + ", ";
            }
            descStr += ']';
            $('#bookmark_description').val(descStr);

            $("#addBookmarkDialog").dialog({
                //if modal set true then only focus on dialog
                modal: true,
                resizable: false,
                title: 'Add new bookmark',
                width: 500,
                //animation
                show: {
                    effect: "blind",
                    duration: 100
                },
                buttons: {
                    Add: function () {
                        if ($('#bookmark_title').val() == '') {
                            showAlert("Title should not be empty!");
                        } else {
                            //call ajax function
                            addBookmark();
                            $(this).dialog('close');
                            $('#bookmark_title').val('');
                            $('#bookmark_description').val('');
                        }
                    },
                    Cancel: function () {
                        $(this).dialog('close');
                        $('#bookmark_title').val('');
                        $('#bookmark_description').val('');
                    }
                }
            });
            $("#addBookmarkDialog").dialog('open');
            //$("#addBookmarkDialog").css("z-index","9999");

            //            console.log(JSON.stringify(observeTarget));
            // console.log(fromFormatStr);
            // console.log(toFormatStr);
        } else {
            showToast("Empty Observation");
        }
    });
}

function addBookmark() {
    var stringifyObserveTarget = JSON.stringify(observeTarget);
    var stringifyObserveLoc = JSON.stringify(observeLoc);
    var stringifyObserveSpec = JSON.stringify(observeSpec);
    //    var firstMapTime = JSON.stringify({
    //        from: firstMap.fromFormatStr,
    //        to: firstMap.toFormatStr
    //    });
    //    var comparisonMapTime = JSON.stringify({
    //        from: comparisonMap.fromFormatStr,
    //        to: comparisonMap.toFormatStr
    //    });
    var activeMode = (isModeActive(MODE_COMPARISION) ? MODE_COMPARISION : MODE_REGION);
    var dataset = getFunction();
    // console.log("stringifyObserveTarget:"+stringifyObserveTarget);
    // console.log("stringifyObserveLoc:"+stringifyObserveLoc);
    console.log("stringifyObserveSpec:" + stringifyObserveSpec);
    // console.log("firstMapTime:"+firstMapTime);
    // console.log("comparisonMapTime:"+comparisonMapTime);
    //console.log("activeMode:"+activeMode);

    // ajax to save bookmark
    //    ajaxAddBookmark(stringifyObserveTarget, stringifyObserveLoc, stringifyObserveSpec, firstMapTime, comparisonMapTime, activeMode, dataset);
    ajaxAddBookmark(stringifyObserveTarget, stringifyObserveLoc, stringifyObserveSpec, activeMode, dataset);
}

function loadBookmarkBtnSetting() {
    $('li#navBookmark').click(function () {
        if (isLoading()) return;
        if (account == undefined) {
            showToast('This feature is not available for guest.');
            return;
        }
        createBookmarkPopup();
    })
}

function bookmarkSubmit(index) {
    if (document.getElementById('workset').style.display = "none") {
        $("#workset").show();
        $("#homepage").hide();
        $("#homepage").empty();
        if (document.getElementById("mapid").childNodes.length == 0) {
            mapInit();
        }
    }
    enableControlPanel();

    closeService();
    closeDealer();

    resetIsClickFromFilterResult();

    closeBookmarkList();
    loading("Data loading...");
    var targetIndex;
    for (var i = 0; i < bookmarkList.length; ++i) {
        if (bookmarkList[i].index == index) {
            targetIndex = i;
            break;
        }
    }

    var bookmarkObj = bookmarkList[targetIndex];
    console.log(bookmarkObj);
    var devicesJson = JSON.parse(bookmarkObj.devicesJson);
    var locJson = JSON.parse(bookmarkObj.locJson);
    var specJson = JSON.parse(bookmarkObj.specJson);
    //    var firstMapTime = JSON.parse(bookmarkObj.firstMapTime);
    //    var comparisonMapTime = JSON.parse(bookmarkObj.comparisonMapTime);
    var activeMode = bookmarkObj.activeMode;
    var dataset = bookmarkObj.dataset;

    var functionSwitchFrom = getFunction();
    var functionSwitchTo = dataset;
    //------------------------------

    //if change function
    //need to clean old setting
    if (functionSwitchFrom != null && functionSwitchTo != null && functionSwitchFrom != functionSwitchTo) {
        console.log('bookmark Function switchTo:' + functionSwitchTo);
        console.log('bookmark Function switchFrom:' + functionSwitchFrom);
        switch (functionSwitchFrom) {
            //switch from activation
            case FUNC_DISTBRANCH:
            case FUNC_ACTIVATION:
                //un-pressed every mode btn
                $("#mode button.active").each(function () {
                    //                    console.log($(this).attr('id'));
                    unactiveModeBtn($(this));
                    $(this).removeClass('active');
                });
                disableActivationMapControl();
                firstMap.currentRegionIso = [];

                //close overlay
                closeDealer();
                closeService();
                break;
                //switch from lifezone
            case FUNC_LIFEZONE:
                removeHeatMap();
                disableLifezoneControl();
                firstMap.addSnapshot();
                break;
            case FUNC_ACTIVATION_TABLE:
                $('#tableContainer').empty();
                break;

            case FUNC_GAP:
                //change table button text
                //                $('#table').button('option', 'label', 'Table');
                firstMap.currentRegionIso = [];
                firstMap.removePolygonMap();
                cleanBranch();
                break;

            case FUNC_ACTIVATION_TREND:
                $('#activationTrendBy button').removeClass('active');
                $('#activationTrendLevel button').removeClass('active');
                $('#activationTrendTimeScale button').removeClass('active');

                $('#activationTrendRight').hide();
                currentTrendBy = defaultTrendBy;
                currentTrendLevel = defaultTrendLevel;
                currentTrendTimescale = defaultTrendTimescale;
                activationTrend.chartDestroy();

                //empty selector
                //                $('#showSelector').empty();
                //                $('#showSelector').selectmenu("refresh");

                activationTrendControlPanel.disableActivationTrendControl();
                break;

            case FUNC_ACTIVATION_DISTRIBUTION:
                $('#activationDistributedLeft button').removeClass('active');
                $('#activationDistributedRight button').removeClass('active');
                $('#activationDistributedRight').hide();
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
        console.log('diff');
    }

    //clear dist/branch anyway
    if (functionSwitchFrom == FUNC_DISTBRANCH && isDistBranchFilterShowing) {
        //data delete
        observeDistBranch.length = 0;
        //UI remove
        destroyDistBranchCheckBox();
    }

    //record new current Function
    setFunction(functionSwitchTo);
    activeFunctionTmp = functionSwitchTo;

    //filter data collection--------------------------------------
    if (firstMap.fromFormatStr == undefined || firstMap.toFormatStr == undefined) {
        var from = $("#from").val();
        var to = $("#to").val();

        firstMap.fromFormatStr = from;
        firstMap.toFormatStr = to;
    }
    //2017/08/16
    //date button text display
    $('#dateTextDisplay').html(firstMap.fromFormatStr + "<br> ~ <br>" + firstMap.toFormatStr);


    //clone decided filter from tmpFilter
    observeTarget = devicesJson.slice();
    observeTargetTmp = devicesJson.slice();

    observeLoc = locJson.slice();
    observeLocTmp = locJson.slice();

    observeSpec = jQuery.extend({}, specJson);
    observeSpecTmp = jQuery.extend({}, specJson);

    filterRecordClean();
    filterRecord();

    firstMap.needRefetchColorGrade = true;

    //-------------------------------------------------------
    controlPanelDisplayRefresh(functionSwitchTo);
    activationFunctionListCollapse();

    switch (functionSwitchTo) {
        //default set to region mode
        case FUNC_ACTIVATION:
            //case FUNC_DISTBRANCH:

            if (functionSwitchTo == FUNC_ACTIVATION)
                checkboxLocationInit(allLoc);

            $('#tableContainer').hide();
            $('#workset').show('medium');
            enableActivationMapControl();

            modeReset();
            setModeOn(MODE_REGION);
            needToLoadTwoModeSameTime = false;

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
            } else if (allSelectedCountryIsBranchAccessable) {
                firstMap.currentDimensionTmp = DIMENSION_BRANCH;
            } else if (observeLoc.length == 1) {
                firstMap.currentDimensionTmp = DIMENSION_L2;
            } else if (observeLoc.length > 1) {
                firstMap.currentDimensionTmp = DIMENSION_L1;
            }

            if (firstMap.currentDimensionTmp != firstMap.currentDimension) {
                firstMap.currentDimension = firstMap.currentDimensionTmp;
                isDimensionChanged = true;
                actiationControlPanel.setActiveOption(firstMap.currentDimension);
            }


            if (!$("button#region").hasClass("active"))
                modeBtnPress($("button#region"));

            firstMap.zoomToSelectedLocation();
            submitRegion();

            break;

        case FUNC_ACTIVATION_TABLE:
            checkboxLocationInit(allLoc);

            //clear the content
            $(tableContainer).empty();

            //hide map
            $('#workset').hide();
            $('#tableContainer').show('medium');

            showTable();
            break;

        case FUNC_GAP:
            checkboxLocationInit(gapLoc);

            $('#tableContainer').hide();
            $('#workset').show('medium');
            submitGap();
            firstMap.zoomToSelectedLocation();
            break;

            //default set to week day:1/part of day:1
        case FUNC_LIFEZONE:
            checkboxLocationInit(allLoc);
            lifezoneControlPanel.lifezoneButtonsetResetToDefault();

            enableLifezoneControl();

            $('#tableContainer').hide();
            $('#workset').show('medium');
            firstMap.zoomToSelectedLocation();
            submitHeatMap();
            break;

        case FUNC_ACTIVATION_DISTRIBUTION:
            checkboxLocationInit(allLoc);

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
            checkboxLocationInit(allLoc);
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

            $(tableContainer).empty();
            //hide map
            $('#workset').hide();
            $('#tableContainer').show('medium');
            submitActivateTrend();
            break;

        case FUNC_PARALLEL:
            checkboxLocationInit(allLoc);
            enableParallelControl();
            $('#tableContainer').hide();
            $('#workset').show('medium');

            //first time launching
            if (!isModeActive(MODE_PARALLEL_IMPORT) && !isModeActive(MODE_PARALLEL_EXPORT)) {
                setModeOn(MODE_PARALLEL_IMPORT);
                $('button#' + MODE_PARALLEL_IMPORT).addClass('active');
            }

            submitParallel();
            break;

        case FUNC_QC:
            checkboxLocationInit(allLoc);
            enableQCControl();

            $('#tableContainer').hide();
            $('#workset').show('medium');

            removeSQMarker();
            setModeOff(MODE_QC_MARKER);
            removeSQRegion();
            setModeOff(MODE_QC_REGION);


            setModeOn(MODE_QC_REGION);
            if (!$("button#qcRegion").hasClass("active"))
                modeBtnPress($("button#qcRegion"));

            submitSQRegion();

            currentView = DEFAULT_VIEW;
            if (!$('#qcView button[data-value="' + currentView + '"]').hasClass("active"))
                $('#qcView button[data-value="' + currentView + '"]').addClass("active");

            needToLoadTwoModeSameTime = (isRegionMarkerSametime()) ? true : false;
            console.log("needToLoadTwoModeSameTime:" + needToLoadTwoModeSameTime);
            firstMap.zoomToSelectedLocation();
            setInitialZoom(firstMap.map.getZoom());
            break;

    }
//    clearFilterResult();
//    showFilterResult();
    setMainpageTitle(functionSwitchTo);
    mapContainerFitsize();
    //--------filter----------------------------------------
    cleanFilterCheck();
    console.log(observeTarget);
    //device filter target check
    for (var i = 0; i < observeTarget.length; i++) {
        var $this = $("input[data-productname='" + observeTarget[i].product + "'][data-modelname='" + observeTarget[i].model + "'][data-devicesname='" + observeTarget[i].devices + "'][datatype='" + observeTarget[i].datatype + "']");
        $this.prop('checked', true);
        checkListener($this, ($this.prop("checked") ? true : false));
    }
    //location filter target check
    observeLocFullNameTmp.length = 0;
    observeLocFullName.length = 0;
    for (var i = 0; i < observeLoc.length; i++) {
        $("input[iso='" + observeLoc[i] + "']").each(function () {
            var $this = $(this);
            $this.prop('checked', true);
            checkListener($this, ($this.prop("checked") ? true : false));
            observeLocFullNameTmp.push($(this).val());
            observeLocFullName.push($(this).val());
        });
    }
    //spec filter
    specDeviceTmp.length = 0;
    var checktarget = $("#check_device_li");
    updateSpecFilter(checktarget);
    ajaxGetDeviceSpec(specDeviceTmp, observeSpec);
}

function closeBookmarkList() {
    $("#bookmarkList").dialog('close');
    $('#bookmark').removeClass('clicked');

    //need to unbind or 
    //linstener will be called multiple times
    $("#bookmarkList").unbind();
}

//change list to checkbox
function editBookmark() {
    if (bookmarkList) {
        var content = '';
        for (var i = 0; i < bookmarkList.length; ++i) {
            content += '<li><label for="' + bookmarkList[i].index + '">';
            content += '<input type = "checkbox" id="' + bookmarkList[i].index + '" class = "bk-edit-item">' + "<div style='display: inline;'>" + bookmarkList[i].title + " / " + bookmarkList[i].desc + "</div>";
            content += '</label></li>'

        }
        $('#bk-ul').html(content);
        //show the remove buttons
        $('.bk-list-btn').show();
    }
}

function submitRemoveBookmark() {
    var index = 0;
    var idOfBookmarkDel = [];
    $('.bk-edit-item').each(function () {
        if ($(this).prop("checked")) {
            idOfBookmarkDel.push($(this).attr("id"));
        }
        index++;
    });
    //update bookmark list here
    ajaxRemoveBookmark(idOfBookmarkDel);


    console.log(JSON.stringify(idOfBookmarkDel));
    closeBookmarkList();
}

function createBookmarkPopup() {
    var content = '';
    for (var i = 0; i < bookmarkList.length; ++i) {
        var bookmarkObj = bookmarkList[i];
        var index = bookmarkObj.index;
        var title = bookmarkObj.title;
        var desc = bookmarkObj.desc;

        content += '<li class ="bk-item" id="' + index + '" onclick="bookmarkSubmit(\'' + index + '\')">' + title + "<br>" + desc + '</li>';
        content += '</ul>'
    }
    $('#bk-ul').html(content);

    $("#bookmarkList").dialog({
        modal: false,
        resizable: false,
        title: 'Bookmarks',
        dialogClass: 'bk-list',
        draggable: false,
        position: {
            my: "left top",
            at: "left bottom",
            of: $('li#navBookmark')
        },
        width: 300,
        show: {
            effect: "blind",
            duration: 100
        },
        buttons: [
            {
                text: 'Delete',
                class: 'bk-list-btn',
                click: function () {
                    submitRemoveBookmark();
                }
            }, {
                text: 'Cancel',
                class: 'bk-list-btn',
                click: function () {
                    closeBookmarkList();
                }
            }
        ]
    }).bind('clickoutside', function (event) {
        //console.log("outside");
        //close the list if click outside
        if (!$(event.target).closest('.ui-dialog').length && !$(event.target).closest('li#navBookmark').length) {
            closeBookmarkList();
        }
    });

    //prevent top-right InfoDiv overlap
    $(".bk-list").css("z-index", "9999");

    if ($('#editBookmarkButton').length == 0) {
        //add the edit button
        $(".bk-list").children(".ui-dialog-titlebar").append("<span id='editBookmarkButton' class='ui-icon ui-icon-trash'></span>");
        $('#editBookmarkButton').click(function () {
            editBookmark();
            $('#editBookmarkButton').hide();
        });
    } else {
        $('#editBookmarkButton').show();
    }
    //hide the remove buttons if not in edit mode
    $('.bk-list-btn').hide();
    $("#bookmarkList").dialog('open');
}
