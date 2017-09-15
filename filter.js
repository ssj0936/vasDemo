"use strict";
var countryGapModeSupported = ['IND', 'IDN', 'VNM', 'PHL', 'BGD', 'MMR', 'MYS', 'THA', 'JPN'];
var countryNeedToShowDistBranch = ['IND'];
var countryNeedToShowGAPInL1 = new Set(['VNM', 'PHL', 'MYS', 'THA']);

function checkListener(el, check) {
    if ($(el).next().attr('class') == 'fakeCheckbox') {
        $(el).removeClass('notAllCheck');
        $(el).next().remove();
    }
    checkChild(el, check);
    checkParent(el);
}

//2016-11-23 update: only apply to enable item
function checkChild(el, check) {
    var nextUl = $(el).parent().next("ul");
    //console.log(nextUl);
    if (nextUl.length > 0) {
        //console.log("checkChild");
        var tar = $("li input:enabled", nextUl);

        tar.each(function () {
            $(this).prop("checked", check);
            if ($(this).next().attr('class') == 'fakeCheckbox') {
                $(this).removeClass('notAllCheck');
                $(this).next().remove();
            }
        });

        tar.each(function () {
            checkChild($(this), check);
        });
    }
    //deepest
    else {
        return;
    }
}

//2016-11-23 update: only apply to enable item
function checkParent(el) {
    var upperUl = $(el).parentsUntil("ul").parent();
    var tar = $("input:enabled", upperUl.prev("li"));
    if (tar.length == 0) return;

    //check
    //check all sib is checked or not
    if ($(el).prop("checked")) {
        //find latest ul from target
        var isAllChecked = true;
        var uncheckedCount = 0;
        $("li input:enabled", upperUl).each(function () {
            if (!$(this).prop("checked")) {
                isAllChecked = false;
                ++uncheckedCount;
            }
        });
        if (!isAllChecked && uncheckedCount > 0) {
            tar.addClass('notAllCheck');
            if (tar.next().attr('class') != 'fakeCheckbox')
                tar.after(
                    jQuery('<label/>', {
                        'for': tar.attr('id'),
                        'class': 'fakeCheckbox',
                        'name': tar.attr('name'),
                    }).append(
                        jQuery('<span/>', {
                            class: 'ui-icon ui-icon-stop fakeNotAllCheckbox'
                        }))
                );
            checkParent(tar[0]);
        } else if (isAllChecked) {
            tar.removeClass('notAllCheck');
            tar.prop("checked", true);
            if (tar.next().attr('class') == 'fakeCheckbox')
                tar.next().remove();
            checkParent(tar[0]);
        }
    } else {
        var isAllChecked = true;
        var checkCount = 0;
        $("li input:enabled", upperUl).each(function () {
            if (!$(this).prop("checked")) {
                isAllChecked = false;
            } else {
                ++checkCount;
            }
        });
        if (!isAllChecked && checkCount > 0) {
            tar.prop("checked", false);
            tar.addClass('notAllCheck');
            if (tar.next().attr('class') != 'fakeCheckbox')
                tar.after(
                    jQuery('<label/>', {
                        'for': tar.attr('id'),
                        'class': 'fakeCheckbox',
                        'name': tar.attr('name'),
                    }).append(
                        jQuery('<span/>', {
                            class: 'ui-icon ui-icon-stop fakeNotAllCheckbox'
                        }))
                );
            checkParent(tar[0]);
        } else {
            tar.prop("checked", false);
            tar.removeClass('notAllCheck');
            if (tar.next().attr('class') == 'fakeCheckbox')
                tar.next().remove();
            checkParent(tar[0]);
        }

    }
}

function checkboxDeviceInit() {

    var productUl = jQuery('<ul/>', {
        id: 'productUl'
    }).appendTo($("#deviceFilter"));
    //ui-icon-squaresmall-plus
    for (var productName in allDevicesList) {
        var li = jQuery('<li/>').appendTo($(productUl));
        //all product
        //collapse icon
        jQuery('<span />', {
                class: "ui-icon ui-icon-circlesmall-plus",
            })
            .css({
                'display': 'inline-block',
                'font-size': '18px',
                'height': '12px',
                'width': '12px',
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

        jQuery('<input/>', {
            id: 'filter_device_' + productName,
            type: 'checkbox',
            value: productName,
            datatype: "product",
            devices: productName,
            'data-productID': productTopProductIDList[productName],
            'data-productName': productName,
            'data-modelName': productName,
            'data-devicesName': productName,
            name: "devicesList",
        }).appendTo($(li));

        jQuery('<label/>', {
            text: productName,
            for: 'filter_device_' + productName,
        }).appendTo(li);

        var modelUl = jQuery('<ul/>').appendTo($(productUl)).hide();

        for (var modelName in allDevicesList[productName]) {
            var li = jQuery('<li/>').appendTo(modelUl);
            //all product
            //collapse icon
            jQuery('<span />', {
                    class: "ui-icon ui-icon-circlesmall-plus model-plus",
                })
                .css({
                    'display': 'inline-block',
                    'font-size': '18px',
                    'height': '12px',
                    'width': '12px',
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
            jQuery('<input/>', {
                id: 'filter_device_' + modelName,
                type: 'checkbox',
                value: modelName,
                datatype: "model",
                'data-productID': productTopProductIDList[productName],
                'data-productName': productName,
                'data-modelName': modelName,
                'data-devicesName': modelName,
                name: "devicesList",
            }).appendTo($(li));

            jQuery('<label/>', {
                text: getModelDisplayName(modelName),
                for: 'filter_device_' + modelName,
            }).appendTo(li);

            var deviceUl = jQuery('<ul/>').appendTo(modelUl).hide();
            //model
            for (var i = 0; i < allDevicesList[productName][modelName].length; ++i) {
                var li = jQuery('<li/>').appendTo(deviceUl);
                jQuery('<input/>', {
                    id: 'filter_device_' + allDevicesList[productName][modelName][i],
                    type: 'checkbox',
                    value: allDevicesList[productName][modelName][i],
                    datatype: "devices",
                    'data-productID': productTopProductIDList[productName],
                    'data-productName': productName,
                    'data-modelName': modelName,
                    'data-devicesName': allDevicesList[productName][modelName][i],
                    name: "devicesList",
                }).appendTo($(li));
                jQuery('<label/>', {
                    text: allDevicesList[productName][modelName][i],
                    for: 'filter_device_' + allDevicesList[productName][modelName][i],
                }).appendTo(li);
            }
        }
    }

    //listener setting
    $("#deviceFilter input").each(function (index) {
        $(this).on("click", function () {
            checkListener(this, ($(this).prop("checked") ? true : false));

            observeTargetTmp.length = 0;
            specDeviceTmp.length = 0;
            observeTargetDeviceOnlyTmp.length = 0;
            var checktarget = $("#productUl");
            checkDevicePush(checktarget);
            //            console.log(observeTargetTmp);
            updateSpecFilter(checktarget);
            //            console.log(specDeviceTmp);

//            ajaxGetDeviceSpec(specDeviceTmp);
//            disableSubmit();
            setSubmitUnpressed();
        });
    });
}

function checkboxLocationInit(locSet) {

    $("#locationFilter input").off();
    $("#locationFilter").empty();
    var worldList = [];

    var allUl = jQuery('<ul/>').appendTo($("#locationFilter"));

    for (var terrorityName in locSet) {
        //work around
        if (terrorityName == "CHINA")
            continue;

        var li = jQuery('<li/>').attr("class", "filter_country").appendTo($(allUl));
        jQuery('<span />', {
                class: "ui-icon ui-icon-circlesmall-plus",
            })
            .css({
                'display': 'inline-block',
                'font-size': '18px',
                'height': '12px',
                'width': '12px',
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

        //continents
        var terrBox = jQuery('<input/>', {
                id: 'filter_location_' + terrorityName,
                type: 'checkbox',
                datatype: "terrority",
                name: "loc",
            })
            .appendTo($(li));
        if(terrorityName != 'APAC'){
            terrBox.attr('disabled','disabled');
        }
        jQuery('<label/>', {
            text: terrorityName,
            for: 'filter_location_' + terrorityName
        }).appendTo(li);


        var terrorityUl = jQuery('<ul/>').appendTo($(allUl)).hide();

        for (var countryName in locSet[terrorityName]) {
            var li = jQuery('<li/>').attr("class", "filter_country").appendTo($(terrorityUl));

            //continents
            var isoBox = jQuery('<input/>', {
                    id: 'filter_location_' + countryName,
                    type: 'checkbox',
                    value: countryName,
                    datatype: "country",
                    iso: locSet[terrorityName][countryName],
                    name: "loc",
                })
                .appendTo($(li));

            if('IND' != locSet[terrorityName][countryName]){
                isoBox.attr('disabled','disabled');
            }
            jQuery('<label/>', {
                text: countryName,
                for: 'filter_location_' + countryName,
            }).appendTo(li);
        }
    }

    //check the item already check
    if (observeLocTmp.length != 0) {
        for (var i = 0; i < observeLocTmp.length; i++) {
            $("input[iso='" + observeLocTmp[i] + "']").each(function () {
                var $this = $(this);
                //                console.log($this[0]);
                $this.prop('checked', true);
                checkListener($this, ($this.prop("checked") ? true : false));
            });
        }
        //preventing observeLocTmp contain country not in Range while switching function from Activation to Gap(or Dist/Branch)
        //ex. ['TWN','IDN','IND'] -> ['IDN','IND'] need to remove country not in GAP list

        //so need to re-check
        observeLocTmp.length = 0;
        observeLocFullNameTmp.length = 0;
        checkLocPush();
        if (activeFunctionTmp == FUNC_DISTBRANCH) {
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
        }
    }

    //listener setting
    $("#locationFilter input").each(function (index) {
        $(this).on("click", function () {
            checkListener(this, ($(this).prop("checked") ? true : false));

            observeLocTmp.length = 0;
            observeLocFullNameTmp.length = 0;
            checkLocPush();
            //            console.log(observeLocTmp);
            //            console.log(observeLocFullNameTmp);
            if (activeFunctionTmp == FUNC_DISTBRANCH) {
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
            }
            setSubmitUnpressed();
        });
    });
}

function checkboxSpecInit(checkOption) {
    $('.hardware_filter').each(
        function (key, e) {
            var hardware = e.id.substring(9),
                displayNameOfAll = e.getAttribute('data-title');
            observeSpecTmp[hardware] = [];
            if ($.isEmptyObject(allSpec)) {
                var specArray = [];
            } else {
                var specArray = allSpec[hardware];
            }

            //            if (!$(e).collapsible('collapsed') && specArray.length == 0) {
            //                $(e).collapsible('close');
            //            }
            //$(".specFilter").empty();
            $($(".specFilter")[key]).empty();
            var ul = jQuery('<ul/>').appendTo($($(".specFilter")[key]));
            if (specArray.length > 0) {
                var li = jQuery('<li/>').attr("id", "check_" + hardware + "_li").appendTo($(ul));

                jQuery('<span />', {
                        class: "ui-icon ui-icon-circlesmall-plus",
                    })
                    .css({
                        'display': 'inline-block',
                        'font-size': '18px',
                        'height': '12px',
                        'width': '12px',
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

                jQuery('<input/>', {
                    id: 'filter_' + hardware + '_' + "all",
                    type: 'checkbox',
                    value: "all",
                    name: hardware,
                    class: "checkbox" + hardware,
                }).hide().appendTo($(li)).fadeIn(300);
                jQuery('<label/>', {
                    text: displayNameOfAll,
                    for: 'filter_' + hardware + '_' + "all",
                }).hide().appendTo(li).fadeIn(300);
            }
            var allUl = jQuery('<ul/>').appendTo($(ul)).hide();;

            for (var i = 0; i < specArray.length; ++i) {
                var li = jQuery('<li/>').appendTo($(allUl));

                //continents
                jQuery('<input/>', {
                        id: 'filter_' + hardware + '_' + specArray[i],
                        type: 'checkbox',
                        value: specArray[i],
                        name: hardware,
                        class: "checkbox" + hardware,
                    })
                    .hide().appendTo($(li)).fadeIn(300);

                jQuery('<label/>', {
                    text: specArray[i],
                    for: 'filter_' + hardware + '_' + specArray[i],
                }).hide().appendTo(li).fadeIn(300);
            }

            //listener setting
            $('#' + $(".specFilter")[key].id + ' input').each(function (index) {
                $(this).on("click", function () {
                    checkListener(this, ($(this).prop("checked") ? true : false));

                    observeSpecTmp[hardware].length = 0;
                    var checktarget = $("#check_" + hardware + "_li");
                    checkSpecPush(checktarget, hardware);
                    setSubmitUnpressed();
                });
            });

            //if check option exist, then apply it
            //or default movement is checking 'all' option for all filter
            if (!checkOption) {
                $('input[name="' + hardware + '"]').prop('checked', true);
                //                $("#filter_" + hardware + "_all").trigger('click');
                var checktarget = $("#check_" + hardware + "_li");
                checkSpecPush(checktarget, hardware);
            } else {
                for (var i in checkOption[hardware]) {
                    var id = checkOption[hardware][i];
                    var checkThis = $("#filter_" + hardware + "_" + id).get(0);
                    $(checkThis).prop('checked', true);
                    //                    console.log($(checkThis).attr('name'));
                    checkListener(checkThis, ($(checkThis).prop("checked") ? true : false));
                }
                var checktarget = $("#check_" + hardware + "_li");
                checkSpecPush(checktarget, hardware);
            }
            enableSubmit();
        }
    );
}

function branchDistInit() {
    //branch / Dist
    $('#locsetButton').html('Branch/Dist<span class="caret"></span>');

    $('.locset').each(function () {
        $(this).click(function ($this) {
            return function () {
                if (!$this.hasClass('active')) {

                    $('#locsetButton').html($this.text() + '<span class="caret"></span>');

                    $('.locset').removeClass('active');
                    $this.addClass('active');

                    cleanDistBranchFilter();
                    switch ($this.attr('id')) {
                        case 'branch':
                            $('#distToBranch').stop(true, true).fadeOut('medium');
                            $('#onlineDist').stop(true, true).fadeOut('medium');
                            $('#branchToDist').stop(true, true).fadeIn('medium');
                            break;
                        case 'dist':
                            $('#branchToDist').stop(true, true).fadeOut('medium');
                            $('#onlineDist').stop(true, true).fadeOut('medium');
                            $('#distToBranch').stop(true, true).fadeIn('medium');
                            break;
                        case 'online':
                            $('#branchToDist').stop(true, true).fadeOut('medium');
                            $('#distToBranch').stop(true, true).fadeOut('medium');
                            $('#onlineDist').stop(true, true).fadeIn('medium');
                            break;
                    }
                }
            }
        }($(this)));
    });
}

function createDistBranchCheckBox() {

    //dist -> branch
    var container = $('#distToBranch');

    var ul = jQuery('<ul/>').appendTo(container);
    var li = jQuery('<li/>').attr("id", "filter_distBranch_li").appendTo(ul);
    jQuery('<input/>', {
        id: 'filter_distBranch_' + "all",
        type: 'checkbox',
        value: 'all',
        'data-dist': 'all',
        'data-branch': 'all',
        'data-isDeepestLevel': false,
        name: "distBranch",
    }).appendTo($(li));
    jQuery('<label/>', {
        text: "All",
        for: 'filter_distBranch_' + "all",
    }).appendTo(li);

    var distUl = jQuery('<ul/>').appendTo(ul);


    for (var i in distBranch) {
        var dist = distBranch[i].dist;
        var branchList = distBranch[i].branch;

        var li = jQuery('<li/>').appendTo(distUl);
        //all product
        //collapse icon
        jQuery('<span />', {
                class: "ui-icon ui-icon-circlesmall-plus",
            })
            .css({
                'display': 'inline-block',
                'font-size': '18px',
                'height': '12px',
                'width': '12px',
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

        jQuery('<input/>', {
            id: 'filter_distBranch_' + dist,
            type: 'checkbox',
            value: dist,
            'data-dist': dist,
            'data-branch': dist,
            'data-isDeepestLevel': false,
            name: "distBranch",
        }).appendTo($(li));

        jQuery('<label/>', {
            text: dist,
            for: 'filter_distBranch_' + dist,
        }).appendTo(li);

        var branchUl = jQuery('<ul/>').appendTo(distUl).hide();

        for (var index in branchList) {
            var branchName = branchList[index]
            var li = jQuery('<li/>').appendTo(branchUl);
            jQuery('<input/>', {
                id: 'filter_distBranch_' + dist + '_' + branchName,
                type: 'checkbox',
                value: branchName,
                'data-dist': dist,
                'data-branch': branchName,
                'data-isDeepestLevel': true,
                name: "distBranch",
            }).appendTo($(li));

            jQuery('<label/>', {
                text: branchName,
                for: 'filter_distBranch_' + dist + '_' + branchName,
            }).appendTo(li);
        }
    }

    //branch -> dist
    var container = $('#branchToDist');

    var ul = jQuery('<ul/>').appendTo(container);
    var li = jQuery('<li/>').attr("id", "filter_branchDist_li").appendTo(ul);
    jQuery('<input/>', {
        id: 'filter_branchDist' + "all",
        type: 'checkbox',
        value: 'all',
        'data-dist': 'all',
        'data-branch': 'all',
        'data-isDeepestLevel': false,
        name: "branchDist",
    }).appendTo($(li));
    jQuery('<label/>', {
        text: "All",
        for: 'filter_branchDist' + "all",
    }).appendTo(li);

    var branchUl = jQuery('<ul/>').appendTo(ul);

    for (var i in branchDist) {
        var distList = branchDist[i].dist;
        var branch = branchDist[i].branch;

        var li = jQuery('<li/>').appendTo(branchUl);
        //all product
        //collapse icon
        jQuery('<span />', {
                class: "ui-icon ui-icon-circlesmall-plus",
            })
            .css({
                'display': 'inline-block',
                'font-size': '18px',
                'height': '12px',
                'width': '12px',
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

        jQuery('<input/>', {
            id: 'filter_branchDist' + branch,
            type: 'checkbox',
            value: branch,
            'data-dist': branch,
            'data-branch': branch,
            'data-isDeepestLevel': false,
            name: "branchDist",
        }).appendTo($(li));

        jQuery('<label/>', {
            text: branch,
            for: 'filter_branchDist' + branch,
        }).appendTo(li);

        var distUl = jQuery('<ul/>').appendTo(branchUl).hide();

        for (var index in distList) {
            var distName = distList[index]
            var li = jQuery('<li/>').appendTo(distUl);
            jQuery('<input/>', {
                id: 'filter_branchDist' + branch + '_' + distName,
                type: 'checkbox',
                value: distName,
                'data-dist': distName,
                'data-branch': branch,
                'data-isDeepestLevel': true,
                name: "branchDist",
            }).appendTo($(li));

            jQuery('<label/>', {
                text: distName,
                for: 'filter_branchDist' + branch + '_' + distName,
            }).appendTo(li);
        }
    }

    //online -> dist
    var container = $('#onlineDist');

    var ul = jQuery('<ul/>').appendTo(container);
    var li = jQuery('<li/>').attr("id", "filter_onlineDist_li").appendTo(ul);
    jQuery('<input/>', {
        id: 'filter_onlineDist_' + "all",
        type: 'checkbox',
        value: 'all',
        'data-online': 'all',
        'data-dist': 'all',
        'data-isDeepestLevel': false,
        name: "onlineDist",
    }).appendTo($(li));
    jQuery('<label/>', {
        text: "All",
        for: 'filter_onlineDist_' + "all",
    }).appendTo(li);

    var onlineUl = jQuery('<ul/>').appendTo(ul);


    for (var i in onlineDist) {
        var online = onlineDist[i].online_dist;
        var distList = onlineDist[i].dist;

        var li = jQuery('<li/>').appendTo(onlineUl);
        //all product
        //collapse icon
        jQuery('<span />', {
                class: "ui-icon ui-icon-circlesmall-plus",
            })
            .css({
                'display': 'inline-block',
                'font-size': '18px',
                'height': '12px',
                'width': '12px',
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

        jQuery('<input/>', {
            id: 'filter_onlineDist_' + online,
            type: 'checkbox',
            value: online,
            'data-online': online,
            'data-dist': online,
            'data-isDeepestLevel': false,
            name: "onlineDist",
        }).appendTo($(li));

        jQuery('<label/>', {
            text: online,
            for: 'filter_onlineDist_' + online,
        }).appendTo(li);

        var distUl = jQuery('<ul/>').appendTo(onlineUl).hide();

        for (var index in distList) {
            var distName = distList[index]
            var li = jQuery('<li/>').appendTo(distUl);
            jQuery('<input/>', {
                id: 'filter_onlineDist_' + online + '_' + distName,
                type: 'checkbox',
                value: distName,
                'data-online': online,
                'data-dist': distName,
                'data-isDeepestLevel': true,
                name: "onlineDist",
            }).appendTo($(li));

            jQuery('<label/>', {
                text: distName,
                for: 'filter_onlineDist_' + online + '_' + distName,
            }).appendTo(li);
        }
    }

    $("#branchDistFilter input").each(function () {
        $(this).on("click", function () {
            checkListener(this, ($(this).prop("checked") ? true : false));
            setSubmitUnpressed();
        });
    });
}

function filterRecord() {
    //dist branch
    observeDistBranch.length = 0;
    var isOnlineDist = false;
    $('input:checked[data-isdeepestlevel=true]').each(function () {
        if ($(this)[0].hasAttribute('data-branch')) {
            observeDistBranch.push({
                dist: $(this).attr('data-dist'),
                branch: $(this).attr('data-branch'),
            });
        } else if ($(this)[0].hasAttribute('data-online')) {
            isOnlineDist = true;
        }
    });

    //whether Gap button can show(no branch/dist selected & only one country be select & country in the list)
    isGapButtonCanShow = (observeDistBranch.length == 0 && !isOnlineDist && observeLoc.length == 1 && $.inArray(observeLoc[0], countryGapModeSupported) != -1) ? true : false;
    //whether any branch/dist be selected
    isDistBranchSelected = (observeDistBranch.length > 0) ? true : false;

    //get selected branch
    observeBranchName.length = 0;
    var observeBranchNameTmp = [];
    $('input:checked[name="branchDist"], input:checked[name="distBranch"]').each(function () {
        observeBranchNameTmp.push($(this).attr('data-branch'));
    });
    observeBranchName = observeBranchNameTmp.filter(
        function (value, index, self) {
            return self.indexOf(value) === index;
        }
    );

    observeDistName.length = 0;
    $('input:checked[name="onlineDist"]').each(function () {
        observeDistName.push($(this).attr('data-dist'));
    });
}

function filterRecordClean() {
    //dist branch
    observeDistBranch.length = 0;
    observeBranchName.length = 0;
    observeDistName.length = 0;
}

function destroyDistBranchCheckBox() {

    //clean
    $('#distToBranch').empty();
    $('#distToBranch').hide();
    $('#branchToDist').empty();
    $('#branchToDist').hide();
    $('#onlineDist').empty();
    $('#onlineDist').hide();
    distBranch.length = 0;
    branchDist.length = 0;
    onlineDist.length = 0;


    $('#locset button').removeClass('active');

    //filter show up
    if (!$('#section_branch_dist').collapsible('collapsed'))
        $('#section_branch_dist').collapsible('close');
    $('#section_branch_dist').stop(true, true).fadeOut('medium');

    isDistBranchFilterShowing = false;
}

function checkDevicePush(el) {
    el.children("li").each(function () {
        if ($(this).children("input").is(":checked")) {
            observeTargetTmp.push({
                model: $("input", this).attr("data-modelName"),
                devices: $("input", this).val(),
                product: $("input", this).attr("data-productName"),
                datatype: $("input", this).attr("datatype"),
            });
        } else {
            checkDevicePush($(this).next("ul"));
        }
    });
}

function checkLocPush() {
    $('input:checked[name="loc"][datatype="country"]').each(function () {
        observeLocTmp.push($(this).attr("iso"));
        observeLocFullNameTmp.push($(this).val());
    });
}

function checkSpecPush(el, hardware) {
    if ($("input", el).prop("checked")) {
        observeSpecTmp[hardware].push($("input", el).attr("value"));
    } else {
        el.next("ul").children("li").each(function () {
            checkSpecPush($(this), hardware);
        })
    }
}


function updateSpecFilter(el) {
    $('input:checked[name="devicesList"][datatype="devices"]').each(function () {
        specDeviceTmp.push($(this).val());

        observeTargetDeviceOnlyTmp.push({
            model: $(this).attr("data-modelName"),
            devices: $(this).val(),
            product: $(this).attr("data-productName"),
            datatype: $(this).attr("datatype"),
        });
    });
}

function getFilterModel() {
    var model = [];
    $('input:checked[name="devicesList"][datatype="devices"]').each(function () {
        model.push($(this).attr("data-modelName"));
    });

    return model.filter(
        function (value, index, self) {
            return self.indexOf(value) === index;
        }
    );
}


function resetFilterStatus() {
    $('.hardware_filter').each(
        function (key, e) {
            if (!$(e).collapsible('collapsed')) {
                $(e).collapsible('close');
            }
        }
    );
}

function cleanFilterCheck() {
    $("input[name='devicesList']").prop('checked', false);
    $("input[name='loc']").prop('checked', false);
    $("input[name='cpu']").prop('checked', false);
    $("input[name='color']").prop('checked', false);
    $("input[name='rear_camera']").prop('checked', false);
    $("input[name='front_camera']").prop('checked', false);
}

function cleanLocFilter() {
    $("input[datatype='terrority']").prop('checked', false);
    $("input[datatype='country']").prop('checked', false);
    observeLocTmp.length = 0;
    observeLocFullNameTmp.length = 0;
}

function cleanDevFilter() {
    $("input[datatype='product']").prop('checked', false);
    $("input[datatype='model']").prop('checked', false);
    $("input[datatype='devices']").prop('checked', false);

    observeTargetTmp.length = 0;
}

function cleanDistBranchFilter() {
    $("input[name='distBranch']").prop('checked', false);
    $("input[name='branchDist']").prop('checked', false);
    $("input[name='onlineDist']").prop('checked', false);
}

function collapseDeviceDescription() {
    $('.model-plus').each(function (el) {
        if ($(this).hasClass('ui-icon-circlesmall-minus')) {
            $(this).removeClass("ui-icon-circlesmall-minus").addClass("ui-icon-circlesmall-plus");
            $(this).parent().next('ul').slideUp()
        }
    });
    $('.model-plus').hide();
}

function recheckDeviceCheckbox() {
    //no need to do this if nothing has been checked
    if (observeTargetTmp.length == 0) return;

    var indexOfValueNeedToDelete = [];
    for (var i in observeTargetTmp) {
        if (observeTargetTmp[i].datatype == 'devices') {
            indexOfValueNeedToDelete.push(i);
        }
    }

    //no need to d this if no device level checkbox has been checked
    if (indexOfValueNeedToDelete.length == 0) return

    for (var i = indexOfValueNeedToDelete.length - 1; i >= 0; i--) {

        //uncheck those [data-type = device] value in observaerTargetTmp
        var datatype = observeTargetTmp[indexOfValueNeedToDelete[i]].datatype;
        var devices = observeTargetTmp[indexOfValueNeedToDelete[i]].devices;
        var model = observeTargetTmp[indexOfValueNeedToDelete[i]].model;
        var product = observeTargetTmp[indexOfValueNeedToDelete[i]].product;

        var target = $("input[datatype='" + datatype + "'][data-productname='" + product + "'][data-modelname='" + model + "'][data-devicesname='" + devices + "']");

        target.prop('checked', false);

        checkListener(target, false);
        //and delete those [data-type = device] value in observaerTargetTmp
        observeTargetTmp.splice(indexOfValueNeedToDelete[i], 1);
    }


    observeTargetTmp.length = 0;
    specDeviceTmp.length = 0;
    observeTargetDeviceOnlyTmp.length = 0;
    var checktarget = $("#productUl");
    checkDevicePush(checktarget);
    updateSpecFilter(checktarget);
    ajaxGetDeviceSpec(specDeviceTmp);

    disableSubmit();
}

function filterSubmitButtonColorListener() {
    $('.filterPart input[type="checkbox"]').off().click(function () {
        console.log('click');
    })
}
