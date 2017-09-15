"use strict";

function toggle(id) {
    $('#' + id).slideToggle()
}

function remoteCheckFilter(el) {
    $('.filter_country input[value="' + $(el).val() + '"]').trigger('click');
    //$('input[value="'+$(el).val()+'"]').prop('checked',$(el).prop("checked"));

}

function isHighlightNeeded() {
    //no data need to observe
    if (observeTarget.length == 0)
        return false;
    else if (!(getFunction() == FUNC_ACTIVATION || getFunction() == FUNC_DISTBRANCH || getFunction() == FUNC_GAP || getFunction() == FUNC_PARALLEL))
        return false;
    else if (getFunction() == FUNC_ACTIVATION) {
        if ((!isModeActive(MODE_REGION) && isModeActive(MODE_MARKER)) || (!isModeActive(MODE_REGION) && !isModeActive(MODE_MARKER)))
            return false;
        else
            return true;
    } else {
        return true;
    }
}

//function checkInvalidCountryAlert(checkAttr) {
//    var inValidLoc = [];
//    var dataset = (checkAttr == 'inActivation') ? 'Activation' : 'Lifezone';
//    $(".filter_country input[type='checkbox']:checked").each(function () {
//        if ($(this).attr(checkAttr) == 0)
//            inValidLoc.push($(this).val());
//    });
//    if (inValidLoc.length != 0) {
//        var str = '';
//        for (var i = 0; i < inValidLoc.length; ++i) {
//            str += '<li class="needToUncheck">';
//            str += '<input type="checkbox" value = "' + inValidLoc[i] + '" checked="true" onClick="remoteCheckFilter(this)">';
//            str += '<label>' + inValidLoc[i] + '</label>';
//            str += '</li>';
//        }
//        showAlert("These countries are not in the dataset[ " + dataset + " ]:<br><b>" + str + "</b><br><br>Please uncheck these options then submit again");
//        return true;
//    }
//    return false;
//}

function isInArray(array, el) {
    return (array.indexOf(el) == -1) ? false : true;
}

function setUpdateTime(time) {
    $("#updatetime").html("<b>Last update</b>: " + time);
}

function getUpdateTime() {
    var func = ((getFunction() == FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION);
    return updateTime[func];
}

function mapHasShowsUp() {
    return document.getElementById('workset').style.display != "none";
}

function modeReset() {
    $(".mode.active").each(function () {
        $(this).removeClass("active");
        unactiveModeBtn($(this));
    });

    // isRegionOn=true;
    // isMarkerOn=false;
    // isComparisonOn=false;
}

function isRegionMarkerSametime() {
    return (isRegionOn && isMarkerOn);
}

function setFunction(func) {
    activeFunction = func;
}

function getFunction() {
    return activeFunction;
}

function setModeOn(mode) {
    if (mode == MODE_REGION) {
        isRegionOn = true;
    } else if (mode == MODE_MARKER) {
        isMarkerOn = true;
    } else if (mode == MODE_COMPARISION) {
        isComparisonOn = true;
    } else if (mode == MODE_QC_REGION) {
        isQcRegionOn = true;
    } else if (mode == MODE_QC_MARKER) {
        isQcMarkerOn = true;
    } else if (mode == MODE_PARALLEL_EXPORT) {
        isParallelExportOn = true;
    } else if (mode == MODE_PARALLEL_IMPORT) {
        isParallelImportOn = true;
    }
}

function setModeOff(mode) {
    if (mode == MODE_REGION) {
        isRegionOn = false;
    } else if (mode == MODE_MARKER) {
        isMarkerOn = false;
    } else if (mode == MODE_COMPARISION) {
        isComparisonOn = false;
    } else if (mode == MODE_QC_REGION) {
        isQcRegionOn = false;
    } else if (mode == MODE_QC_MARKER) {
        isQcMarkerOn = false;
    } else if (mode == MODE_PARALLEL_EXPORT) {
        isParallelExportOn = false;
    } else if (mode == MODE_PARALLEL_IMPORT) {
        isParallelImportOn = false;
    }
}

function isModeActive(mode) {
    if (mode == MODE_REGION) {
        return isRegionOn;
    } else if (mode == MODE_MARKER) {
        return isMarkerOn;
    } else if (mode == MODE_COMPARISION) {
        return isComparisonOn;
    } else if (mode == MODE_QC_REGION) {
        return isQcRegionOn;
    } else if (mode == MODE_QC_MARKER) {
        return isQcMarkerOn;
    } else if (mode == MODE_PARALLEL_EXPORT) {
        return isParallelExportOn;
    } else if (mode == MODE_PARALLEL_IMPORT) {
        return isParallelImportOn;
    }
}

function isClickFromFilterResult() {
    return clickFromFilterResult;
}

function setIsClickFromFilterResult(ans) {
    clickFromFilterResult = ans;
}

function resetIsClickFromFilterResult() {
    clickFromFilterResult = false;
}

function setAccount(string) {
    $('#navAccount').text(string);
    //    $('#account').text(string);
}

function parseDateToStr(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    return yyyy + '-' + mm + '-' + dd;
}

function pressToggle(target) {
    //    console.log("target:"+$(target).attr("id"));
    var parent = $(target).parent();
    parent.children("button").each(function () {
        //console.log("$(this):"+$(this).attr("id"));
        if ($(target).attr("id") == $(this).attr("id")) {
            $(this).removeClass("btn_unpressed").addClass("btn_pressed");
        } else {
            $(this).removeClass("btn_pressed").addClass("btn_unpressed");
        }
    });
}

function showAlert(text) {
    $('#alertDialog p').html(text);
    $('#alertDialogModal').modal({
        show: true
    });
    //    $("#alertDialog").dialog("open");
}

function showToast(text) {
    $('.toast').html(text).fadeIn(400).delay(1000).fadeOut(400);
}

function loading(text) {
    $("body").css("cursor", "progress");
    //if($('.toast').css("display")=='none')
    $('.toast').html(text).fadeIn(400);

    disableFuncSelector();
}

function loadingDismiss() {
    $("body").css("cursor", "default");
    if ($('.toast').css("display") != 'none')
        $('.toast').fadeOut(400);

    enableFuncSelector();
}

function enableFuncSelector() {
    if (isFunctionSelectorInit)
        $(".homeMenuListItem").attr('click-disable', true);
}

function disableFuncSelector() {
    if (isFunctionSelectorInit)
        $(".homeMenuListItem").removeAttr('click-disable');
}

function isLoading() {
    return ($('.toast').css("display") != 'none')
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return '#' + color;
}

function NewDate(str, spliter) {
    str = str.split(spliter);
    var date = new Date();
    date.setUTCFullYear(str[0], parseInt(str[1]) - 1, str[2]);
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

function parseDate(date) {
    if (getBrowser() == BROWSER_IE) {
        let strdate = date.split("-");
        let y = strdate[0];
        let m = parseInt(strdate[1]) - 1;
        let d = strdate[2];
        let newDate = new Date();
        newDate.setUTCFullYear(y, m, d);
        newDate.setUTCHours(0, 0, 0, 0);
        return newDate.valueOf();
    } else {
        return Date.parse(date).valueOf();
    }
}

function getBrowser() {
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
        return 'Opera';
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return BROWSER_CHROME;
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
        return BROBSER_SAFARI;
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return 'Firefox';
    } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
    {
        return BROWSER_IE;
    } else {
        return 'unknown';
    }
}

//-------------------------------Color section---------------------------------
//return a highlight color of input color
function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "",
        c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    return '#' + rgb;
}

function colorHexToRGBString(htmlColor, alpha) {

    var arrRGB = htmlColor.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
    if (arrRGB === null) {
        alert("Invalid color passed, the color should be in the html format. Example: #ff0033");
    }
    var red = parseInt(arrRGB[1], 16);
    var green = parseInt(arrRGB[2], 16);
    var blue = parseInt(arrRGB[3], 16);
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
}
//-------------------------------Color section---------------------------------

function compareByContinent(a, b) {
    if (a.properties.CONTINENT < b.properties.CONTINENT)
        return -1;
    else if (a.properties.CONTINENT > b.properties.CONTINENT)
        return 1;
    else {
        if (a.properties.NAME < b.properties.NAME)
            return -1;
        else if (a.properties.NAME > b.properties.NAME)
            return 1;
        else
            return 0;
    }
}

function compareByName(a, b) {
    if (a.properties.NAME < b.properties.NAME)
        return -1;
    else if (a.properties.NAME > b.properties.NAME)
        return 1;
    else
        return 0;
}

function boundaryInOneArray(boundary) {
    var boundaryArray = [];
    for (var i = 0; i < boundary.length; ++i) {
        //not deepest
        if (typeof boundary[i] !== 'number') {
            boundaryArray = boundaryArray.concat(boundaryInOneArray(boundary[i]));
        } else {
            //need to swap from(lng,lat) -> (lat,lng) to fit leaflet format
            var pair = boundary.slice();
            var tmp = pair[0];
            pair[0] = pair[1];
            pair[1] = tmp;
            boundaryArray.push(pair);
        }
    }
    return boundaryArray;
}

function getCurrentTime() {
    var currentdate = new Date();
    var datetime = currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    return datetime;
}

function disableResultBtn() {
    $("button.devices").attr("disabled", "disabled");
    console.log("disableResultBtn");
}

function enableResultBtn() {
    $("button.devices").removeAttr("disabled");
    console.log("enableResultBtn");
}

function numToString(number) {
    return number.toLocaleString("en-US");
}

function isL1(mapObj) {
    return (mapObj.currentRegionIso.length >= 2 /* || (getFunction() == FUNC_GAP && countryNeedToShowGAPInL1.has(mapObj.currentRegionIso[0]))*/ );
}

function disableScroll() {
    $('html, body').css({
        'overflow': 'hidden',
        'height': '100%'
    });
}

function enableScroll() {
    $('html, body').css({
        'overflow': '',
        'height': ''
    });
}

function scrollToTop() {
    $('html, body').scrollTop(0);
}

jQuery.fn.extend({
    getMaxZ: function () {
        return Math.max.apply(null, jQuery(this).map(function () {
            var z;
            return isNaN(z = parseInt(jQuery(this).css("z-index"), 10)) ? 0 : z;
        }));
    }
});

function disableSubmit() {
    $("#submit").attr("disabled", "disabled");
}

function enableSubmit() {
    $("#submit").removeAttr("disabled");
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkSSOCookie() {
    //no need to check developer's permission
    //    if (window.location.href.indexOf('localhost') >= 0 || window.location.href.indexOf('127.0.0.1') >= 0) {
    DEVMode = true;
    isVIP(function () {
        init_()
    });
    return;
    //    } else if (window.location.href.indexOf('asus.com') >= 0) {
    //        if (getCookie('SSO') == "") {
    //            window.location = "./sso/sso.html";
    //        } else {
    //            var c = getCookie('SSO').split('&');
    //            account = c[3].substring((c[3].indexOf('=') + 1));
    //            isVIP(function () {
    //                init_()
    //            });
    //            //            var accessable = isInArray(accessableList, account);
    //            //            if (!accessable)
    //            //                window.location.href = '404.html';
    //        }
    //    } else {
    //        noPermissionShow();
    //        //window.location.href = '404.html';
    //    }
}

function isVIP(callback) {
    //    if (window.location.href.indexOf('localhost') >= 0 || window.location.href.indexOf('127.0.0.1') >= 0) {
    isVip = true;
    callback();
    //    } 
    //    else {
    //        $.ajax({
    //            url: "php/_dbqueryCheckVip.php",
    //            type: "POST",
    //            data: {
    //                account: account,
    //            },
    //            dataType: 'text',
    //
    //            success: function (result) {
    //                result = JSON.parse(decodeEntities(result));
    //                //            console.log(result);
    //                isVip = (result.isvip == 1);
    //                isAdministrator = (result.isAdministrator == 1);
    //                isCFR = isAdministrator || (result.isCFR == 1);
    //
    //                console.log('isVip:' + isVip);
    //                console.log('isAdministrator:' + isAdministrator);
    //                console.log('isCFR:' + isCFR);
    //                callback();
    //            },
    //            error: function (xhr, ajaxOptions, thrownError) {
    //                alert("isVIP:" + xhr.status);
    //                alert(thrownError);
    //            }
    //        });
    //    }
}

function updateReleaseNote() {
    $('#homepage').empty();
    jQuery('<h2/>').text('Welcome').appendTo('#homepage');
    var notice = jQuery('<div/>', {
        id: 'notice'
    }).appendTo('#homepage');


    jQuery.get('releasenote.txt', function (data) {
        data = "<p>" + data;
        data = replaceAll(data, '\r\n', '　</p><p>');
        data = replaceAll(data, '\t', '    ');
        data += "</p>";
        //$('#release').text(data);
        notice.html(data);
        //console.log(data);
    });
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function filterDataNull() {
    allDevicesList = null;
    //delete allDevicesList;
    //    allLoc = null;
    //delete allLoc;
    allProduct = null;
    //delete allProduct;
    allDealerCountry = null;
    //delete allDealerCountry;
}

function getWindowHeightPercentagePx(float) {
    return ($(window).height() * float);
}

function getDocumentFullHeight() {
    return $(document).height();
}

Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
};

//degree to tile number
function deg2num(lat_deg, lon_deg, zoom) {
    var lat_rad = Math.radians(lat_deg);
    var n = Math.pow(2, zoom);
    var xtile = parseInt((lon_deg + 180.0) / 360.0 * n);
    var ytile = parseInt((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
    return [xtile, ytile];
}

function saveLog() {
    if (DEVMode || window.location.href.indexOf('localhost') >= 0 || window.location.href.indexOf('127.0.0.1') >= 0) return;
    ajaxSaveLog();
}

function cleanBranch() {
    filterRecordClean();
    allBranchObject.length = 0;
    allHighlighBranch = null;
    allBranchGap = null;
}

function rePaintCFR() {
    if (SQRegionTileLayer && isModeActive(MODE_QC_REGION)) {
        rePaintSQRegion();
    }
    if (SQMarkerTileLayer && isModeActive(MODE_QC_MARKER)) {
        rePaintSQMarker();
    }
}

function weekdayConvert(num) {
    var weekday = (num == 1) ? "Mon" :
        (num == 2) ? "Tue" :
        (num == 3) ? "Wed" :
        (num == 4) ? "Tus" :
        (num == 5) ? "Fri" :
        (num == 6) ? "Sat" :
        (num == 7) ? "Sun" : null;

    return weekday;
}

function partOfDayConvert(num) {
    var partOfDay = (num == 1) ? "10:00" :
        (num == 2) ? "14:00" :
        (num == 3) ? "18:00" :
        (num == 4) ? "22:00" : null;

    return partOfDay;
}

function optMapSize() {
    //    $('#mapContainer').css("height", '' + (window.innerHeight - $('#mapContainer').offset().top - 30) + 'px');
}

function removeBaseline(str) {
    return str.replace(/_/g, " ");
}

function getModelDisplayName(modelName) {
    return modelName + (isInArray(unpopularList, modelName) ? (' (*)') : '');
}

function isNeedToAddStarInModelName(modelName) {
    return isInArray(unpopularList, modelName);
}


//map printing

//REF: http://www.epochconverter.com/weeknumbers
Date.prototype.getWeek = function () {
    var target = new Date(this.valueOf());
    var dayNr = (this.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    var firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

    return (retVal < 10 ? '0' + retVal : retVal);
}

function getWeekNumber(d) {
    //    console.log(d);
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    //    console.log(d);
    // Get first day of year
    var yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    // Return array of year and week number
    var nd = new Date(d);
    nd.setDate(nd.getDate() + 3);
    return {
        year: d.getFullYear(),
        weekNumber: weekNo,
        lastDayOfWeek: (nd.getFullYear() + '-' + (nd.getMonth() + 1) + '-' + nd.getDate())
    };
}

function getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

function decodeEntities(encodedString) {
    // this prevents any overhead from creating the object each time
    var element = document.createElement('textarea');
    var str = encodedString;
    if (str && typeof str === 'string') {
        // strip script/html tags
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        element.innerHTML = str;
        str = element.textContent;
        element.textContent = '';
    }

    return str;
}

function removeDuplicates(originArr) {
    var arr = [];
    for (var i = 0; i < originArr.length; i++) {
        if (!isInArray(arr, originArr[i])) {
            arr.push(originArr[i]);
        }
    }
    return arr;
}

var QuickHull = {

    /*
     * @param {Object} cpt a point to be measured from the baseline
     * @param {Array} bl the baseline, as represented by a two-element
     *   array of latlng objects.
     * @returns {Number} an approximate distance measure
     */
    getDistant: function (cpt, bl) {
        var vY = bl[1].lat - bl[0].lat,
            vX = bl[0].lng - bl[1].lng;
        return (vX * (cpt.lat - bl[0].lat) + vY * (cpt.lng - bl[0].lng));
    },

    /*
     * @param {Array} baseLine a two-element array of latlng objects
     *   representing the baseline to project from
     * @param {Array} latLngs an array of latlng objects
     * @returns {Object} the maximum point and all new points to stay
     *   in consideration for the hull.
     */
    findMostDistantPointFromBaseLine: function (baseLine, latLngs) {
        var maxD = 0,
            maxPt = null,
            newPoints = [],
            i, pt, d;

        for (i = latLngs.length - 1; i >= 0; i--) {
            pt = latLngs[i];
            d = this.getDistant(pt, baseLine);

            if (d > 0) {
                newPoints.push(pt);
            } else {
                continue;
            }

            if (d > maxD) {
                maxD = d;
                maxPt = pt;
            }
        }

        return {
            maxPoint: maxPt,
            newPoints: newPoints
        };
    },


    /*
     * Given a baseline, compute the convex hull of latLngs as an array
     * of latLngs.
     *
     * @param {Array} latLngs
     * @returns {Array}
     */
    buildConvexHull: function (baseLine, latLngs) {
        var convexHullBaseLines = [],
            t = this.findMostDistantPointFromBaseLine(baseLine, latLngs);

        if (t.maxPoint) { // if there is still a point "outside" the base line
            convexHullBaseLines =
                convexHullBaseLines.concat(
                    this.buildConvexHull([baseLine[0], t.maxPoint], t.newPoints)
                );
            convexHullBaseLines =
                convexHullBaseLines.concat(
                    this.buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints)
                );
            return convexHullBaseLines;
        } else { // if there is no more point "outside" the base line, the current base line is part of the convex hull
            return [baseLine[0]];
        }
    },

    /*
     * Given an array of latlngs, compute a convex hull as an array
     * of latlngs
     *
     * @param {Array} latLngs
     * @returns {Array}
     */
    getConvexHull: function (latLngs) {
        // find first baseline
        var maxLat = false,
            minLat = false,
            maxLng = false,
            minLng = false,
            maxLatPt = null,
            minLatPt = null,
            maxLngPt = null,
            minLngPt = null,
            maxPt = null,
            minPt = null,
            i;

        for (i = latLngs.length - 1; i >= 0; i--) {
            var pt = latLngs[i];
            if (maxLat === false || pt.lat > maxLat) {
                maxLatPt = pt;
                maxLat = pt.lat;
            }
            if (minLat === false || pt.lat < minLat) {
                minLatPt = pt;
                minLat = pt.lat;
            }
            if (maxLng === false || pt.lng > maxLng) {
                maxLngPt = pt;
                maxLng = pt.lng;
            }
            if (minLng === false || pt.lng < minLng) {
                minLngPt = pt;
                minLng = pt.lng;
            }
        }

        if (minLat !== maxLat) {
            minPt = minLatPt;
            maxPt = maxLatPt;
        } else {
            minPt = minLngPt;
            maxPt = maxLngPt;
        }

        var ch = [].concat(this.buildConvexHull([minPt, maxPt], latLngs),
            this.buildConvexHull([maxPt, minPt], latLngs));
        return ch;
    }
};
