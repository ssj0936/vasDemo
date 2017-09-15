var actiationControlPanel = (function () {

    function actiationControlPanelInit() {
        //button init
        //disable first
        $("#mode button").attr("disabled", "disabled");

        //activation mode btn setting
        var modeBtns = $("#mode button");
        modeBtns.click(function () {
            if (isLoading()) return;

            //check ehwther clicking the same btn or not
            var isCurrentButtonSet = (isModeActive(MODE_REGION) || isModeActive(MODE_MARKER)) ? true : false;
            var isTargetButtonSet = ($(this).attr("id") == 'region' || $(this).attr("id") == 'marker') ? true : false;
            if ((!isCurrentButtonSet && !isTargetButtonSet) && $(this).hasClass("active")) return;

            var pressedTarget = $(this);
            //buttonset switch
            if (isCurrentButtonSet && isTargetButtonSet) {
                if (pressedTarget.hasClass("active")) {
                    pressedTarget.removeClass("active");
                    unactiveModeBtn($(this));
                } else {
                    pressedTarget.addClass("active");
                    activeModeBtn($(this));
                }
            }
            //buttonset -> unbuttonset
            else if (isCurrentButtonSet && !isTargetButtonSet) {
                modeBtns.removeClass("active");
                modeBtns.each(function () {
                    if ($(this).attr("id") != pressedTarget.attr("id")) {
                        unactiveModeBtn($(this));
                    }
                });

                $(this).addClass("active");
                activeModeBtn($(this));
            }
            //unbuttonset -> buttonset
            else if (!isCurrentButtonSet && isTargetButtonSet) {
                modeBtns.removeClass("active");
                modeBtns.each(function () {
                    if ($(this).attr("id") != pressedTarget.attr("id")) {
                        unactiveModeBtn($(this));
                    }
                });

                $(this).addClass("active");
                activeModeBtn($(this));
            }
        });

        //disable first
        $("#dimension button").attr("disabled", "disabled");

        var dimensionBtn = $('li.dimension');
        dimensionBtn.click(function () {
            if (isLoading())
                return false;

            isDimensionChanged = true;
            let dimension = $(this).attr("data-dimension");
            if (firstMap.currentDimension != dimension) {
                firstMap.currentDimension = dimension;
                setActiveOption(dimension);
                submitRegion();
            }
        });

        $("button#showtrendActivation").attr("disabled", true);
        $("button#showtrendActivation").click(function () {
            showTrend(firstMap);
        })

        //init mode
        $("#activation").addClass("active");
        setFunction(FUNC_ACTIVATION);
    }

    function setActiveOption(option) {
        let text = $('*[data-dimension="' + option + '"]').text();
        console.log(text);
        $('button#dimensionSelector').html(text + ' <span class="caret"></span>');
    }

    return {
        actiationControlPanelInit: actiationControlPanelInit,
        setActiveOption: setActiveOption,
    }
}());


var lifezoneControlPanel = (function () {
    function lifezoneControlPanelInit() {
        //lifezone time button setting
        $('li.lifezoneWeekDayBtnset').click(function () {
            if (isLoading())
                return false;

            lifeZoneTime.week = $(this).attr('data-value');
            setWeekDayActiveOption(lifeZoneTime.week);
            if (isDifferentTime() && !$.isEmptyObject(heatmapLayer)) {
                submitHeatMap();
            }
        });

        $('li.lifezonePartOfDayBtnset').click(function () {
            if (isLoading())
                return false;

            lifeZoneTime.time = $(this).attr('data-value');
            setPartOfDayActiveOption(lifeZoneTime.time);
            if (isDifferentTime() && !$.isEmptyObject(heatmapLayer)) {
                submitHeatMap();
            }
        });

        $("#lifezoneWeekDayBtnset").attr("disabled", "disabled");
        $("#lifezonePartOfDayBtnset").attr("disabled", "disabled");

        //        $('div#lifezoneWeekDayBtnset').buttonset("disable");
        //        $('div#lifezonePartOfDayBtnset').buttonset("disable");

        lifezoneButtonsetSetCurrentValue();
    }

    function setWeekDayActiveOption(option) {
        let text = $('.lifezoneWeekDayBtnset[data-value="' + option + '"]').text();
        //        console.log(text);
        $('button#lifezoneWeekDayBtnset').html(text + ' <span class="caret"></span>');
    }

    function setPartOfDayActiveOption(option) {
        let text = $('.lifezonePartOfDayBtnset[data-value="' + option + '"]').text();
        //        console.log(text);
        $('button#lifezonePartOfDayBtnset').html(text + ' <span class="caret"></span>');
    }

    function lifezoneButtonsetSetCurrentValue() {
        setWeekDayActiveOption(lifeZoneTime.week);
        setPartOfDayActiveOption(lifeZoneTime.time);
        //        $('div#lifezoneWeekDayBtnset button[data-value="' + lifeZoneTime.week + '"]').addClass('active');
        //        $('div#lifezonePartOfDayBtnset button[data-value="' + lifeZoneTime.time + '"]').addClass('active');
    }

    function lifezoneButtonsetResetToDefault() {
        lifeZoneTime.time = 1;
        lifeZoneTime.week = 1;
        setWeekDayActiveOption(lifeZoneTime.week);
        setPartOfDayActiveOption(lifeZoneTime.time);
    }

    return {
        lifezoneControlPanelInit: lifezoneControlPanelInit,
        setWeekDayActiveOption: setWeekDayActiveOption,
        setPartOfDayActiveOption: setPartOfDayActiveOption,
        lifezoneButtonsetSetCurrentValue: lifezoneButtonsetSetCurrentValue,
        lifezoneButtonsetResetToDefault: lifezoneButtonsetResetToDefault,
    }
}());

var qcControlPanel = (function () {
    function qcControlPanelInit() {

        currentCategory = DEFAULT_CATEGORY;
        currentView = DEFAULT_VIEW;

        //category selector
        $("li.qcCategory").off().click(function () {
            if (currentCategory == $(this).attr('value'))
                return false;

            if (firstMap.map)
                firstMap.map.closePopup();

            currentCategory = $(this).attr('value');
            setCategorySelectorText(currentCategory);
            rePaintCFR();
        })

        //qcMode
        $('button.qcMode').click(function () {
            if (isLoading()) return;
            if ($(this).hasClass('active')) return;

            if (firstMap.map)
                firstMap.map.closePopup();

            var pressedTarget = $(this);
            //buttonset switch
            $("button.qcMode").each(function () {
                $(this).removeClass('active');
                unactiveModeBtn($(this));
            });
            //$('#qcMode').children('button').removeClass('active');
            pressedTarget.addClass("active");
            activeModeBtn($(this));
        });

        //qcView
        $('li.qcView').click(function () {
            if (isLoading())
                return false;
            if (currentView == $(this).attr('data-value'))
                return false;

            if (firstMap.map)
                firstMap.map.closePopup();

            currentView = $(this).attr('data-value');
            setViewSelectorText(currentView);
            if (isModeActive(MODE_QC_REGION)) {
                submitSQRegion($(this).attr('data-value'));
            }
            if (isModeActive(MODE_QC_MARKER)) {
                submitSQMarker($(this).attr('data-value'));
            }
        });

        $("button#showtrendCFR").click(function () {
            trendQC.showChart(observeLocFullName[0]);
        })

        disableQCControl();
    }

    function initCFRCategory(list) {
        //append option
        let container = $("#qcCategoryUl");
        container.empty().append('<li class="qcCategory" value="ALL"><a href="#">All</a></li>')
        for (let k = 0; k < list.length; k++) {
            if (list[k] == '')
                container.append('<li class="qcCategory" value="' + list[k] + '"><a href="#">　</a></li>' + "<option value='");
            else
                container.append('<li class="qcCategory" value="' + list[k] + '"><a href="#">' + list[k] + '</a></li>' + "<option value='");
        }
        currentCategory = DEFAULT_CATEGORY;
        setCategorySelectorText(currentCategory);

        //adding listener
        $("li.qcCategory").off().click(function () {
            if (firstMap.map)
                firstMap.map.closePopup();

            currentCategory = $(this).attr('value');
            setCategorySelectorText(currentCategory);
            rePaintCFR();
        })
    }

    function setCategorySelectorText(option) {
        let text = $('.qcCategory[value="' + option + '"]').text();
        console.log(text);
        $('button#qcCategory').html(text + ' <span class="caret"></span>');
    }

    function setViewSelectorText(option) {
        let text = $('.qcView[data-value="' + option + '"]').text();
        console.log(text);
        $('button#qcViewSelector').html(text + ' <span class="caret"></span>');
    }

    function buttonTextSetting() {
        setCategorySelectorText(currentCategory);
        setViewSelectorText(currentView);
    }

    return {
        qcControlPanelInit: qcControlPanelInit,
        initCFRCategory: initCFRCategory,
        buttonTextSetting: buttonTextSetting,
    }
}());

var parallelControlPanel = (function () {
    function parallelControlPanelInit() {
        //disable first
        disableParallelControl();

        //first time launching
        if (!isModeActive(MODE_PARALLEL_IMPORT) && !isModeActive(MODE_PARALLEL_EXPORT)) {
            setModeOn(MODE_PARALLEL_IMPORT);
            setActiveOption(MODE_PARALLEL_IMPORT);
        }

        var parallelModeBtns = $("li.parallelMode");
        parallelModeBtns.click(function () {
            if (isLoading())
                return false;

            //reset all
            parallelModeBtns.each(function () {
                setModeOff($(this).attr('id'));
            });
            //set pressed item
            setModeOn($(this).attr('id'));


            setActiveOption($(this).attr('id'));

            if (firstMap.map)
                firstMap.map.closePopup();
            //            if (comparisonMap.map)
            //                comparisonMap.map.closePopup();

            //data reset
            loading('Data loading');
            firstMap.setParallelMaxMin();
            firstMap.mapDataLoad();
            firstMap.updateLegend();
            firstMap.info.update();
            loadingDismiss();
        });
    }

    function setActiveOption(option) {
        let text = $('#' + option).text();
        //        console.log(text);
        $('button#parallelModeSelector').html(text + ' <span class="caret"></span>');
    }

    return {
        parallelControlPanelInit: parallelControlPanelInit,
        setActiveOption: setActiveOption,
    }

}());


var activationTrendControlPanel = (function () {
    function activationTrendControlPanelInit() {
        $('li.activationTrendBy').click(function () {
            if (isLoading())
                return false;
            if ($(this).hasClass('active') && currentTrendBy == $(this).attr('id'))
                return false;

            currentTrendBy = $(this).attr('id');
            setTrendByOption(currentTrendBy);

            if (currentTrendBy == MODE_ACTIVATION_TREND_BY_REGION) {
                if (observeLoc.length > 1) {
                    currentTrendLevel = MODE_ACTIVATION_TREND_LEVEL_COUNTRY;
                } else {
//                    if (isInArray(countryGapModeSupported, observeLoc[0]))
//                        currentTrendLevel = MODE_ACTIVATION_TREND_LEVEL_BRANCH;
//                    else
                        currentTrendLevel = MODE_ACTIVATION_TREND_LEVEL_L1;
                }
                setTrendLevelOption(currentTrendLevel);
                $('#activationTrendRight').removeClass('needTohideAtFirst');
            } else {
                $('#activationTrendRight').addClass('needTohideAtFirst');
            }
            submitActivateTrend();
            trendRankButtonTextReset();
        });

        $('li.activationTrendLevel').click(function () {
            if (isLoading())
                return false;
            if ($(this).hasClass('active') && currentTrendLevel == $(this).attr('id'))
                return false;
            currentTrendLevel = $(this).attr('id');
            setTrendLevelOption(currentTrendLevel);
            submitActivateTrend();
            trendRankButtonTextReset();
        });

        $('li.activationTrendTimeScale').click(function () {
            if (isLoading())
                return false;
            if ($(this).hasClass('active') && currentTrendTimescale == $(this).attr('id'))
                return false;
            currentTrendTimescale = $(this).attr('id');
            setTrendTimescaleOption(currentTrendTimescale);

            //no need to switch when no target been selected
            if (observeTarget.length != 0)
                activationTrend.switchTimescale(currentTrendTimescale);
        });

        //disable first
        disableActivationTrendControl();
        rankSelectorListenerSetting();
    }

    function rankSelectorListenerSetting() {
        $('li.showSelector').off().click(function () {
            setTrendRankOption($(this));

            let lowerbound = $(this).attr('data-ranklowerbound'),
                upperbound = $(this).attr('data-rankupperbound');
            if (observeTarget.length != 0)
                activationTrend.newRange(lowerbound, upperbound);
        });
    }

    function setTrendByOption(option) {
        let text = $('#' + option).text();
        $('button#activationTrendBy').html(text + ' <span class="caret"></span>');
    }

    function setTrendLevelOption(option) {
        let text = $('#' + option).text();
        $('button#activationTrendLevel').html(text + ' <span class="caret"></span>');
    }

    function setTrendTimescaleOption(option) {
        let text = $('#' + option).text();
        $('button#activationTrendTimeScale').html(text + ' <span class="caret"></span>');
    }

    function setTrendRankOption(option) {
        let text = option.text();
        $('button#showSelector').html(text + ' <span class="caret"></span>');
    }

    function trendRankButtonTextReset() {
        $('button#showSelector').html('Top 5' + ' <span class="caret"></span>');
    }

    function buttonTextSetting() {
        setTrendByOption(currentTrendBy);
        setTrendLevelOption(currentTrendLevel);
        setTrendTimescaleOption(currentTrendTimescale);
        trendRankButtonTextReset();
    }

    //some condition of trend by region 
    function trendRegionAccessSetting() {
        //only country is accessable
        $('li.activationTrendLevel').hide();
        if (observeLoc.length > 1) {
            $('li#activationTrendLevelCountry').show();
        } else {
            $('li#activationTrendLevelCountry').show();
            $('li#activationTrendLevelL1').show();
            $('li#activationTrendLevelL2').show();
            if (isInArray(countryGapModeSupported, observeLoc[0]))
                $('li#activationTrendLevelBranch').show();
        }
    }

    function enableActivationTrendControl() {
        $('button#activationTrendBy , button#activationTrendLevel, button#activationTrendTimeScale, button#showSelector').removeAttr("disabled");
    }

    function disableActivationTrendControl() {
        $('button#activationTrendBy , button#activationTrendLevel, button#activationTrendTimeScale, button#showSelector').attr("disabled", true);
    }

    return {
        activationTrendControlPanelInit: activationTrendControlPanelInit,
        rankSelectorListenerSetting: rankSelectorListenerSetting,
        buttonTextSetting: buttonTextSetting,
        trendRegionAccessSetting: trendRegionAccessSetting,
        enableActivationTrendControl: enableActivationTrendControl,
        disableActivationTrendControl: disableActivationTrendControl,
    }
}());

var activationDistributedControlPanel = (function () {
    //countryGapModeSupported
    function activationDistributedRegionBtnSetting() {
        //only country is accessable
        $('li.activationDistributedLevel').hide();
        if (observeLoc.length > 1) {
            $('li#activationDistributedLevelCountry').show();
        } else {
            $('li#activationDistributedLevelL1').show();
            $('li#activationDistributedLevelL2').show();
            if (isInArray(countryGapModeSupported, observeLoc[0]))
                $('li#activationDistributedLevelBranch').show();
        }
    }

    function activationDistributedControlPanelInit() {

        $('li.activationDistributedBy').click(function () {
            if (isLoading())
                return false;
            if ($(this).hasClass('active') && currentDistributedBy == $(this).attr('id'))
                return false;

            currentDistributedBy = $(this).attr('id');
            setDistributedByOption(currentDistributedBy);

            if (currentDistributedBy == MODE_ACTIVATION_DISTRIBUTED_BY_REGION) {
                if (observeLoc.length > 1) {
                    currentDistributedLevel = MODE_ACTIVATION_DISTRIBUTED_LEVEL_COUNTRY;
                } else {
//                    if (isInArray(countryGapModeSupported, observeLoc[0]))
//                        currentDistributedLevel = MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH;
//                    else
                        currentDistributedLevel = MODE_ACTIVATION_DISTRIBUTED_LEVEL_L1;
                }
                setDistributedLevelOption(currentDistributedLevel);
                $('#activationDistributedRight').removeClass('needTohideAtFirst');
            } else {
                $('#activationDistributedRight').addClass('needTohideAtFirst');
            }
            submitActivateDistribution();
        });

        $('li.activationDistributedLevel').click(function () {
            if (isLoading())
                return false;
            if ($(this).hasClass('active') && currentDistributedLevel == $(this).attr('id'))
                return false;

            currentDistributedLevel = $(this).attr('id');
            setDistributedLevelOption(currentDistributedLevel);
            submitActivateDistribution();
        });

        disableActivationDistributionControl();
    }

    function disableActivationDistributionControl() {
        $('#activationDistributedBy, #activationDistributedLevel').attr("disabled", true);
    }

    function enableActivationDistributionControl() {
        $('#activationDistributedBy,#activationDistributedLevel').removeAttr("disabled");
    }

    function setDistributedByOption(option) {
        let text = $('#' + option).text();
        $('button#activationDistributedBy').html(text + ' <span class="caret"></span>');
    }

    function setDistributedLevelOption(option) {
        let text = $('#' + option).text();
        $('button#activationDistributedLevel').html(text + ' <span class="caret"></span>');
    }

    function buttonTextSetting() {
        setDistributedByOption(currentDistributedBy);
        setDistributedLevelOption(currentDistributedLevel);
    }

    return {
        activationDistributedControlPanelInit: activationDistributedControlPanelInit,
        activationDistributedRegionBtnSetting: activationDistributedRegionBtnSetting,
        disableActivationDistributionControl: disableActivationDistributionControl,
        enableActivationDistributionControl: enableActivationDistributionControl,
        buttonTextSetting: buttonTextSetting,
    }
}());
