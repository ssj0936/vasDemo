"use strict";
//fetch map value with regionJson existed
function ajaxFetchMapValue() {
    var mapObj = firstMap;
    //console.log("ajaxFetchMapValue "+((isComparison)?"comparisonMap":"firstMap")+" Start:"+getCurrentTime());
    //        console.log(JSON.stringify(observeLoc));
    //        console.log(JSON.stringify(observeDistBranch));
    //        console.log(JSON.stringify(observeDistName));
    //        console.log(JSON.stringify(observeTarget));
    //        console.log(mapObj.fromFormatStr);
    //        console.log(mapObj.toFormatStr);
    //        console.log(((getFunction()==FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION));
    //        console.log(((getFunction() == FUNC_ACTIVATION || getFunction() == FUNC_DISTBRANCH) ? mapObj.currentDimension : 'null'));    
    //        
    //        console.log(JSON.stringify(observeSpec.color));
    //        console.log(JSON.stringify(observeSpec.cpu));
    //        console.log(JSON.stringify(observeSpec.rear_camera));
    //        console.log(JSON.stringify(observeSpec.front_camera));
    //        console.log(JSON.stringify(permission));
    var dimension = ((getFunction() == FUNC_ACTIVATION || getFunction() == FUNC_DISTBRANCH) ? mapObj.currentDimension : 'null');
    var URLs = "php/dimension_l2.txt";
    console.log(URLs)
    $.ajax({
        url: URLs,
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            //clone
            //            json = [];
            console.log(json);
            console.log("firstMap---JSON");
            if (getFunction() == FUNC_ACTIVATION && json.length == 0) {
                showToast("Empty Data During This Date Time Period");
                mapObj.isEmpty = true;
            } else {
                mapObj.isEmpty = false;
            }

            if (mapObj.countryMapping && mapObj.countryMapping.length != 0)
                mapObj.countryMapping.length = 0;
            mapObj.countryMapping = json.slice();

            //max count setting
            //for legend of map
            mapObj.setMaxMin();

            //geoinfo is empty at first
            //so now put data(countryMapping) into it
            mapObj.updateMapProperties();

            //map rendering
            mapObj.mapDataLoad();

            //legend & info setting
            mapObj.updateLegend();
            if (mapObj.info == null) {
                mapObj.setInfo();
            }
            mapObj.info.update();

            //mouse hover & mouse click listener
            mapObj.setHighlightFeature();

            //free
            mapObj.countryMapping = null;
            //mapObj.jsonData=null;
            //            console.log(mapObj.jsonData);
            if (needToLoadTwoModeSameTime) {
                loadingRegionFinish = true;

                if (loadingRegionFinish && loadingMarkerFinish) {
                    needToLoadTwoModeSameTime = false;
                    loadingDismiss();
                    loadingRegionFinish = false;
                    loadingMarkerFinish = false;
                }
            } else {
                loadingDismiss();
            }
            //console.log("ajaxFetchMapValue "+((isComparison)?"comparisonMap":"firstMap")+" End:"+getCurrentTime());

        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxFetchMapValue:" + xhr.status);
            alert(thrownError);
        }
    });
}

//fetch map value without regionJson existed
//need to query regionJson Data first 
//then fetch map value
function ajaxExtractMap(hasComparison, callback /*, args*/ ) {

    //method 1
    //extract from topojson file
    //REF : http://mapshaper.org/
    //http://blog.webkid.io/maps-with-leaflet-and-topojson/
    //---------------------------------------------------------------------------------------
    console.log("ajaxExtractMap Start:" + getCurrentTime());
    firstMap.cleanMap();
    firstMap.currentRegionIso = observeLoc.slice();
    //console.log(JSON.stringify(observeLoc));

    firstMap.jsonData = {
        "type": "FeatureCollection",
        "features": [],
    };

    var urls = [];
    if (getFunction() == FUNC_ACTIVATION) {
        let dimension = firstMap.currentDimension;
        switch (dimension) {
            case DIMENSION_L1:
                $.each(firstMap.currentRegionIso, function (index, loc) {
                    urls.push("php/geojson/topo/L1/" + loc.toLowerCase() + ".json");
                });
                break;
            case DIMENSION_L2:
                $.each(firstMap.currentRegionIso, function (index, loc) {
                    urls.push("php/geojson/topo/L2/" + loc.toLowerCase() + ".json");
                });
                break;
                //            case DIMENSION_BRANCH:
                //                $.each(firstMap.currentRegionIso, function (index, loc) {
                //                    urls.push("php/geojson/topo/branch/" + loc + ".json");
                //                });
                //                break;
        }
    }
    //    else if (getFunction() == FUNC_GAP) {
    //        $.each(firstMap.currentRegionIso, function (index, loc) {
    //            urls.push("php/geojson/topo/branch/" + loc + ".json");
    //        });
    //    }
    else if (!isL1(firstMap)) {
        $.each(firstMap.currentRegionIso, function (index, loc) {
            urls.push("php/geojson/topo/L2/" + loc.toLowerCase() + ".json");
        });
    } else {
        $.each(firstMap.currentRegionIso, function (index, loc) {
            urls.push("php/geojson/topo/L1/" + loc.toLowerCase() + ".json");
        });
    }

    var jxhr = [];
    $.each(urls, function (i, url) {
        console.log(url);
        jxhr.push(
            $.ajax({
                url: url,
                type: "GET",
                dataType: 'text',

                success: function (json) {
                    json = JSON.parse(decodeEntities(json));
                    console.log(json);
                    for (var key in json.objects) {
                        //console.log(topojson.feature(json, json.objects[key]).features);
                        $.each(topojson.feature(json, json.objects[key]).features, function (index, regionjson) {
                            if (regionjson.geometry) {
                                regionjson.properties["boundBox"] = boundInit(regionjson.geometry);
                                firstMap.jsonData.features.push(regionjson);
                            }
                        });
                    }
                },

                error: function (xhr, ajaxOptions, thrownError) {
                    alert("ajaxFetchMapValue:" + xhr.status);
                    alert(thrownError);
                }
            })
        );
    });

    //    console.log(firstMap.jsonData);
    $.when.apply($, jxhr).done(function () {
        if (callback) {
            callback();
        }
        console.log("ajaxExtractMap End:" + getCurrentTime());
    });
}

function ajaxExtractCountryMap(callback) {
    console.log("ajaxExtractCountryMap Start:" + getCurrentTime());

    firstMap.cleanMap();
    firstMap.currentRegionIso = observeLoc.slice();
    //    console.log(observeLoc);

    firstMap.jsonData = {
        "type": "FeatureCollection",
        "features": [],
    };

    var url = "php/geojson/topo/world.json";

    var jxhr = [];
    jxhr.push(
        $.getJSON(url, function (json) {
            for (var key in json.objects) {
                $.each(topojson.feature(json, json.objects[key]).features, function (index, regionjson) {
                    if (isInArray(observeLoc, regionjson.properties.ISO_A3)) {
                        regionjson.properties["boundBox"] = boundInit(regionjson.geometry);
                        firstMap.jsonData.features.push(regionjson);
                    }
                });
            }
        })
    );
    $.when.apply($, jxhr).done(function () {
        if (callback) {
            callback();
        }
        console.log("ajaxExtractCountryMap End:" + getCurrentTime());
    });
}

//fetch map value with regionJson existed
function ajaxFetchParallelValue() {
    var mapObj = firstMap;
    var URLs = "php/_dbqueryGetParallelValue.php";
    //    console.log(JSON.stringify(observeSpec.color));
    $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            data: JSON.stringify(observeTarget),
            permission: JSON.stringify(permission),
        },
        type: "GET",
        dataType: 'json',

        success: function (json) {
            //clone
            console.log("firstMap---JSON");
            if (json.length == 0) {
                showToast("Empty Data During This Date Time Period");
                mapObj.isEmpty = true;
            } else {
                mapObj.isEmpty = false;
            }

            if (mapObj.countryMapping && mapObj.countryMapping.length != 0)
                mapObj.countryMapping.length = 0;
            mapObj.countryMapping = json;

            mapObj.updateParallelMapProperties();
            mapObj.mapDataLoad();

            mapObj.updateLegend();
            if (mapObj.info == null) {
                mapObj.setInfo();
            }
            mapObj.info.update();
            mapObj.setHighlightFeature();

            //free
            //            mapObj.countryMapping = null;

            mapObj.zoomToSelectedLocation();
            loadingDismiss();

        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxFetchParallelValue:" + xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxExtractParallelMap(callback) {
    console.log("ajaxExtractParallelMap Start:" + getCurrentTime());

    firstMap.cleanMap();
    firstMap.currentRegionIso = observeLoc.slice();
    //    console.log(observeLoc);

    firstMap.jsonData = {
        "type": "FeatureCollection",
        "features": [],
    };

    var url = "php/geojson/topo/world.json";

    var jxhr = [];
    jxhr.push(
        $.getJSON(url, function (json) {
            for (var key in json.objects) {
                $.each(topojson.feature(json, json.objects[key]).features, function (index, regionjson) {
                    if (isInArray(observeLoc, regionjson.properties.ISO_A3)) {
                        regionjson.properties["boundBox"] = boundInit(regionjson.geometry);
                        firstMap.jsonData.features.push(regionjson);
                    }
                });
            }
        })
    );

    $.when.apply($, jxhr).done(function () {
        if (callback) {
            callback.apply(this);
        }
        console.log("ajaxExtractParallelMap End:" + getCurrentTime());
    });
}

function ajaxParallelChart(iso, exportFileType) {

    console.log(JSON.stringify(observeSpec.color));
    console.log(JSON.stringify(observeSpec.cpu));
    console.log(JSON.stringify(observeSpec.rear_camera));
    console.log(JSON.stringify(observeSpec.front_camera));
    console.log(JSON.stringify(observeTarget));
    console.log(iso);
    console.log(JSON.stringify(permission));
    console.log(exportFileType);
    var URLs = "php/_dbqueryGetParallelTrend.php";
    $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            data: JSON.stringify(observeTarget),
            iso: iso,
            permission: JSON.stringify(permission),
            exportFileType: exportFileType,
        },
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            //            console.log(json);

            //modelFlowCount / modelFlowRatio
            //special process for fucking Jonas's request
            for (var modelname in json.modelFlowCount) {
                if (isNeedToAddStarInModelName(modelname)) {
                    json.modelFlowCount[getModelDisplayName(modelname)] = json.modelFlowCount[modelname];
                    delete json.modelFlowCount[modelname];
                }
            }
            for (var modelname in json.modelFlowRatio) {
                if (isNeedToAddStarInModelName(modelname)) {
                    json.modelFlowRatio[getModelDisplayName(modelname)] = json.modelFlowRatio[modelname];
                    delete json.modelFlowRatio[modelname];
                }
            }

            trendParallel.updateParallelChart(json, iso);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxParallelExport(exportFileType) {
    var URLs = "php/_dbqueryGetParallelExport.php";
    $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            data: JSON.stringify(observeTarget),
            iso: JSON.stringify(observeLoc),
            permission: JSON.stringify(permission),
            exportFileType: exportFileType,
        },
        type: "GET",
        dataType: 'text',

        success: function (text) {
            var filename = exportFileType + "_report";
            tableExportToExcel(decodeEntities(text), filename);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxGetMarker() {
    var mapObj = firstMap;
    console.log("ajaxGetMarker Start:" + getCurrentTime());
    var URLs = "php/_dbqueryGetMarker_.php";
    $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            distBranch: JSON.stringify(observeDistBranch),
            onlineDist: JSON.stringify(observeDistName),
            data: JSON.stringify(observeTarget),
            from: mapObj.fromFormatStr,
            to: mapObj.toFormatStr,
            dataset: ((getFunction() == FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION),
            permission: JSON.stringify(permission),
        },
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            //clone
            console.log("ajaxGetMarker End:" + getCurrentTime());
            if (json.length == 0) {
                showToast("Empty Data During This Date Time Period");
                mapObj.isEmpty = true;
                //return
            } else {
                mapObj.isEmpty = false;
            }

            console.log("addLayer Start:" + getCurrentTime());
            addPruneCluster(json);
            console.log("addLayer End:" + getCurrentTime());
            mapObj.info.update();
            if (needToLoadTwoModeSameTime) {
                loadingMarkerFinish = true;

                if (loadingRegionFinish && loadingMarkerFinish) {
                    needToLoadTwoModeSameTime = false;
                    loadingDismiss();
                    loadingRegionFinish = false;
                    loadingMarkerFinish = false;
                }
            } else {
                loadingDismiss();
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetMarker:" + xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxAddBookmark(stringifyObserveTarget, stringifyObserveLoc, stringifyObserveSpec, activeMode, dataset) {
    //    console.log(dataset);
    $.ajax({
        type: 'GET',
        url: 'php/_dbqueryAddBookmark.php',
        data: {
            user: account,
            title: $('#bookmark_title').val(),
            desc: $('#bookmark_description').val(),
            stringifyObserveTarget: stringifyObserveTarget,
            stringifyObserveLoc: stringifyObserveLoc,
            stringifyObserveSpec: stringifyObserveSpec,
            activeMode: activeMode,
            dataset: ((dataset == FUNC_DISTBRANCH) ? FUNC_ACTIVATION : dataset),
        },
        dataType: 'json',
        success: function (response) {
            console.log("bookmark Saved success");
            showToast("Bookmark is saved");
            ajaxLoadBookmark();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxLoadBookmark() {
    $.ajax({
        type: 'GET',
        url: 'php/_dbqueryLoadBookmark.php',
        data: {
            user: account,
        },
        dataType: 'text',
        success: function (json) {
            if (json) {
                json = JSON.parse(decodeEntities(json));
                bookmarkList = jQuery.extend(json, {});
                //                console.log(bookmarkList);
                //createBookmarkPopup();
            }
        },
        //        error: function(jqXHR, textStatus, errorThrown) {},
    });
}

function ajaxRemoveBookmark(idOfBookmarkDel) {
    $.ajax({
        type: 'GET',
        url: 'php/_dbqueryDeleteBookmark.php',
        dataType: 'json',
        data: {
            user: account,
            index: JSON.stringify(idOfBookmarkDel),
        },
        success: function (json) {
            //            bookmarkList=[];
            ajaxLoadBookmark();
            //            console.log(bookmarkList);
            showToast("Bookmark is deleted");
        },
        error: function (jqXHR, textStatus, errorThrown) {},
    });
}

function ajaxTrendOfBranchChart(mapObj, branchName) {
    if (linechart != null) {
        linechart.destroy();
    }
    //    console.log(FUNC_ACTIVATION);
    //    console.log(JSON.stringify(observeSpec.color));
    //    console.log(JSON.stringify(observeSpec.cpu));
    //    console.log(JSON.stringify(observeSpec.rear_camera));
    //    console.log(JSON.stringify(observeSpec.front_camera));
    //    console.log(JSON.stringify(observeTarget));
    //    console.log(mapObj.fromFormatStr);
    //    console.log(mapObj.toFormatStr);
    //    console.log(branchName);
    //    console.log(JSON.stringify(observeLoc));
    //    console.log(JSON.stringify(permission));

    var URLs = "php/_dbqueryGetTrendOfBranch.php";
    $.ajax({
        url: URLs,
        data: {
            dataset: FUNC_ACTIVATION,
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            data: JSON.stringify(observeTarget),
            from: mapObj.fromFormatStr,
            to: mapObj.toFormatStr,
            branch: branchName,
            iso: JSON.stringify(observeLoc),
            permission: JSON.stringify(permission),
        },
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            console.log(json);

            //special process for fucking Jonas's request
            for (var modelname in json.groupByModelResults) {
                if (isNeedToAddStarInModelName(modelname)) {
                    json.groupByModelResults[getModelDisplayName(modelname)] = json.groupByModelResults[modelname];
                    delete json.groupByModelResults[modelname];
                }
            }
            //empty data set
            updateBranchChart(json, branchName);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxRegionChart(countryID, iso, displayname, displaynum, mapObj) {
    console.log(countryID);
    console.log(iso);
    console.log(JSON.stringify(permission));
    console.log(mapObj.currentDimension);

    if (linechart != null) {
        linechart.destroy();
    }
    //    var URLs = "php/_dbquerySingleISOCnt.php";
    var URLs = "php/_dbquerySingleISOCnt.txt";
    $.ajax({
        url: URLs,
        //        data: {
        //            dataset: ((getFunction() == FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION),
        //            color: JSON.stringify(observeSpec.color),
        //            cpu: JSON.stringify(observeSpec.cpu),
        //            rearCamera: JSON.stringify(observeSpec.rear_camera),
        //            frontCamera: JSON.stringify(observeSpec.front_camera),
        //            data: JSON.stringify(observeTarget),
        //            from: mapObj.fromFormatStr,
        //            to: mapObj.toFormatStr,
        //            countryID: countryID,
        //            //            isL1: isL1(firstMap),
        //            iso: iso,
        //            distBranch: JSON.stringify(observeDistBranch),
        //            onlineDist: JSON.stringify(observeDistName),
        //            permission: JSON.stringify(permission),
        //            dimension: mapObj.currentDimension,
        //        },
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            //            console.log(json);
            //special process for fucking Jonas's request
            for (var modelname in json.groupByModelResults) {
                if (isNeedToAddStarInModelName(modelname)) {
                    json.groupByModelResults[getModelDisplayName(modelname)] = json.groupByModelResults[modelname];
                    delete json.groupByModelResults[modelname];
                }
            }
            //empty data set
            updateRegionChart(json, displayname, displaynum);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxTrendChart(mapObj) {
    var URLs = "php/_dbqueryGetTrend.php";
    $.get(URLs, {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            distBranch: JSON.stringify(observeDistBranch),
            onlineDist: JSON.stringify(observeDistName),
            data: JSON.stringify(observeTarget),
            from: mapObj.fromFormatStr,
            to: mapObj.toFormatStr,
            dataset: ((getFunction() == FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION),
            permission: JSON.stringify(permission),
        },
        function (json) {
            json = JSON.parse(decodeEntities(json));
            console.log(json);
            //special process for fucking Jonas's request
            for (var modelname in json.groupByModelResults) {
                if (isNeedToAddStarInModelName(modelname)) {
                    json.groupByModelResults[getModelDisplayName(modelname)] = json.groupByModelResults[modelname];
                    delete json.groupByModelResults[modelname];
                }
            }
            updateTrendChart(json);
        },
        'text'
    );
}

function ajaxGetDeviceSpec(devices, checkOption) {
    if (specDeviceTmp.length == 0) {
        allSpec = {};
        checkboxSpecInit();
    } else {
        $.ajax({
            type: 'GET',
            url: 'php/_dbqueryGetDeviceSpec.php',
            dataType: 'text',
            data: {
                device_name: JSON.stringify(devices)
            },
            success: function (json) {
                json = JSON.parse(decodeEntities(json));
                allSpec = json;

                $.each(allSpec, function (name, spec) {
                    spec.sort;
                });
                checkboxSpecInit(checkOption);
            },
            error: function (jqXHR, textStatus, errorThrown) {},
        });
    }
}

function ajaxFetchTableValue(isDiff) {
    var URLs = "php/_dbqueryGetTableContent.php";
    return $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            distBranch: JSON.stringify(observeDistBranch),
            onlineDist: JSON.stringify(observeDistName),
            data: JSON.stringify(observeTarget),
            from: firstMap.fromFormatStr,
            to: firstMap.toFormatStr,
            dataset: ((getFunction() == FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION),
            permission: JSON.stringify(permission),
        },
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            for (var i in json) {
                json[i].models = getModelDisplayName(json[i].models);
            }

            createTable(isDiff, json);
            loadingDismiss();

        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxFetchTableValue:" + xhr.status);
            alert(thrownError);
        }
    });
}

//Ajax to get dealer's geoJson of select countries
function ajaxGetDealer() {
    $.ajax({
        type: 'GET',
        url: 'php/_dbqueryGetDealer.php',
        dataType: 'json',
        data: {
            country: JSON.stringify(observeLocFullName)
        },
        success: function (json) {
            allDealer = json;
            json = null;
            dealerLayer();
        },
        error: function (jqXHR, textStatus, errorThrown) {},
    });

}

//Ajax to get SC's geoJson of select countries
function ajaxGetSC() {
    $.ajax({
        type: 'GET',
        url: 'php/_dbqueryGetSC.php',
        dataType: 'json',
        data: {
            country: JSON.stringify(observeLoc),
            products: JSON.stringify(defaultProductList)
        },
        success: function (json) {
            allSC = json;
            json = null;
            scLayer();
        },
        error: function (jqXHR, textStatus, errorThrown) {},
    });

}

function ajaxLoadBranchDist() {
    $.ajax({
        type: 'GET',
        url: 'php/_dbqueryLoadDistBranch.php',
        dataType: 'text',
        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            //order by dist
            distBranch.length = 0;
            var currentDist = null;
            var branchList = [];
            var first = true;
            for (var i in json.channel) {
                var dist = json.channel[i].dist;
                var branch = json.channel[i].branch;

                if (dist != currentDist) {
                    if (!first) {
                        distBranch.push({
                            dist: currentDist,
                            branch: branchList.slice()
                        });
                        branchList.length = 0;
                        currentDist = dist;
                    } else {
                        first = false;
                        currentDist = dist;
                    }
                }

                branchList.push(branch);
            }
            //last one
            distBranch.push({
                dist: currentDist,
                branch: branchList.slice()
            });
            //            console.log(distBranch);

            //sort order by branch
            json.channel.sort(function (a, b) {
                return (a.branch > b.branch) ? 1 : ((b.branch > a.branch) ? -1 :
                    (a.dist > b.dist) ? 1 : ((b.dist > a.dist) ? -1 : 0));
            });
            var currentBranch = null;
            var DistList = [];
            var first = true;
            for (var i in json.channel) {
                var dist = json.channel[i].dist;
                var branch = json.channel[i].branch;

                if (branch != currentBranch) {
                    if (!first) {
                        branchDist.push({
                            branch: currentBranch,
                            dist: DistList.slice()
                        });
                        DistList.length = 0;
                        currentBranch = branch;
                    } else {
                        first = false;
                        currentBranch = branch;
                    }
                }

                DistList.push(dist);
            }
            //last one
            branchDist.push({
                branch: currentBranch,
                dist: DistList.slice()
            });

            //order by online dist
            onlineDist.length = 0;
            var currentOnline = null;
            var distList = [];
            var first = true;
            for (var i in json.online) {
                var online = json.online[i].online_dist;
                var dist = json.online[i].dist;

                if (online != currentOnline) {
                    if (!first) {
                        onlineDist.push({
                            online_dist: currentOnline,
                            dist: distList.slice()
                        });
                        distList.length = 0;
                        currentOnline = online;
                    } else {
                        first = false;
                        currentOnline = online;
                    }
                }

                distList.push(dist);
            }
            //last one
            onlineDist.push({
                online_dist: currentOnline,
                dist: distList.slice()
            });



            createDistBranchCheckBox();
        },
    })
}

function ajaxGetBranchObject(callback) {
    if (observeBranchName.length == 0) {
        allBranchObject = [];
        callback();
    } else {
        $.ajax({
            type: 'GET',
            url: 'php/_dbqueryGetBranchObject.php',
            async: "false",
            dataType: 'text',
            data: {
                iso: JSON.stringify(observeLoc),
                branchName: JSON.stringify(observeBranchName)
            },
            success: function (json) {
                json = JSON.parse(decodeEntities(json));
                allBranchObject = json.union;
                delete json.union;
                allHighlighBranch = json;
                json = null;
                console.log(allBranchObject);
                console.log(allHighlighBranch);
                callback();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("ajaxGetBranchObject:" + jqXHR.status);
                alert(errorThrown);
            },
        });
    }
}

function ajaxSaveLog() {
    //device filter
    var observeTargetStr = '';
    if (observeTarget.length == 1 && observeTarget[0].datatype == 'all') {
        observeTargetStr += '[all]';
    } else {
        for (var i in observeTarget) {
            var type = observeTarget[i].datatype;
            observeTargetStr += '[' + observeTarget[i][type] + ']';
        }
    }

    //model filter
    var model = getFilterModel();
    var modelStr = '';
    for (var i in model) {
        var type = model[i].datatype;
        modelStr += '[' + model[i] + ']';
    }

    //loc filter
    var observeLocStr = '';
    for (var i in observeLoc) {
        observeLocStr += '[' + observeLoc[i] + ']';
    }

    //observation time
    var dateStr = '[' + firstMap.fromFormatStr + '][' + firstMap.toFormatStr + ']';

    //filter all content
    var filter_content = {
        observeTarget: observeTarget,
        observeLoc: observeLoc,
        observeSpec: observeSpec,
    };

    if (observeDistBranch.length > 0)
        filter_content['observeDistBranch'] = observeDistBranch;

    //current time
    var date = new Date();
    var dformat = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();


    $.ajax({
        type: 'GET',
        url: 'php/_dbquerySaveLog.php',
        dataType: 'json',
        data: {
            date: dformat,
            username: account,
            filter_model: modelStr,
            filter_country: observeLocStr,
            filter_date: dateStr,
            filter_content: JSON.stringify(filter_content),
            dataset: getFunction(),
        },
        success: function (json) {
            console.log("log saved");
        }
    });
}

function ajaxGetGapData(callback) {
    //    console.log(JSON.stringify(observeSpec.color));
    //    console.log(JSON.stringify(observeSpec.cpu));
    //    console.log(JSON.stringify(observeSpec.rear_camera));
    //    console.log(JSON.stringify(observeSpec.front_camera));
    //    
    //    console.log(JSON.stringify(observeLoc));
    //    console.log(JSON.stringify(observeTarget));
    //    console.log(firstMap.fromFormatStr);
    //    console.log(firstMap.toFormatStr);
    //    console.log(((getFunction()==FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION));
    //    console.log(JSON.stringify(permission));
    $.ajax({
        type: 'GET',
        url: 'php/_dbqueryGetGap.php',
        dataType: 'json',
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            data: JSON.stringify(observeTarget),
            from: firstMap.fromFormatStr,
            to: firstMap.toFormatStr,
            dataset: FUNC_ACTIVATION,
            permission: JSON.stringify(permission),
        },
        success: function (json) {
            console.log(json);
            //            setModeOn(MODE_GAP);
            allBranchGap = json;
            if (callback)
                callback();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetGapData:" + xhr.status);
            alert(thrownError);
        }
    });

}

function ajaxGetGapExport(groupBy) {
    loading('File creating...');
    console.log(currentPointingBranch);
    console.log(isNowBranchTrend);
    $.get(
        "php/_dbqueryGetGapExport.php", {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            data: JSON.stringify(observeTarget),
            from: firstMap.fromFormatStr,
            to: firstMap.toFormatStr,
            dataset: ((getFunction() == FUNC_LIFEZONE) ? FUNC_LIFEZONE : FUNC_ACTIVATION),
            distBranch: JSON.stringify(observeDistBranch),
            groupBy: groupBy,
            branch: (isNowBranchTrend ? currentPointingBranch : null),
            permission: JSON.stringify(permission),
        },
        function (text) {
            //            console.log(text);
            var filename = '[' + observeLoc[0] + '][' + firstMap.fromFormatStr + ']-[' + firstMap.toFormatStr + '][Group By ' + groupBy + ']' + "_GapReport";
            tableExportToExcel(decodeEntities(text), filename);
        },
        'text'
    );
}

function ajaxGetHeatMap() {
    //    console.log(JSON.stringify(observeSpec.color));
    //    console.log(JSON.stringify(observeSpec.cpu));
    //    console.log(JSON.stringify(observeSpec.rear_camera));
    //    console.log(JSON.stringify(observeSpec.front_camera));
    //    
    //    console.log(JSON.stringify(observeLoc));
    //    console.log(JSON.stringify(observeDistBranch));
    //    console.log(JSON.stringify(observeDistName));
    //        console.log(JSON.stringify(lifeZoneTime));
    //    console.log(JSON.stringify(observeTarget));
    //    console.log(JSON.stringify(permission));

    loading("Data loading...");
    $.ajax({
        url: "php/_dbqueryGetLifezoneData.php",
        type: "GET",
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            distBranch: JSON.stringify(observeDistBranch),
            onlineDist: JSON.stringify(observeDistName),
            time: JSON.stringify(lifeZoneTime),
            data: JSON.stringify(observeTarget),
            permission: JSON.stringify(permission),
        },
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            //            console.log(json);

            //empty data return
            if (json[lifeZoneTime['week']][lifeZoneTime['time']].length == 0)
                showToast("Empty Data");

            if ($.isEmptyObject(heatmapLayer)) {
                addHeatMap(json);
            } else {
                changeHeatData(json);
            }
            loadingDismiss();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetHeatMap:" + xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxGetSQMarker() {
    loading("Data loading...");
    $.ajax({
        url: "php/_dbqueryGetSQDevice.php",
        type: "GET",
        data: {
            iso: JSON.stringify(observeLoc),
            data: JSON.stringify(observeTarget),
            view: currentView,
            category: 1,
            permission: JSON.stringify(permission),
        },
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            setSQMarker(json);
            json = null;
            loadingDismiss();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetHeatMap:" + xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxGetSQRegion() {
    loading("Data loading...");
    $.ajax({
        url: "php/_dbqueryGetSQRegion.php",
        type: "GET",
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            data: JSON.stringify(observeTarget),
            view: currentView,
            permission: JSON.stringify(permission),
        },
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            setSQRegion(json);
            json = null;
            loadingDismiss();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetHeatMap:" + xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxGetActivationDistribution() {
    var mapObj = firstMap;
    var URLs = "php/_dbqueryGetActivationDistribution.php";
    $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            data: JSON.stringify(observeTarget),
            from: mapObj.fromFormatStr,
            to: mapObj.toFormatStr,
            permission: JSON.stringify(permission),
            distributedBy: currentDistributedBy,
            distributedLevel: currentDistributedLevel,
        },
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            activationDistribution.showChart(json);

        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetActivationDistribution:" + xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxGetActivationTrend() {
    var mapObj = firstMap;

    //    console.log(JSON.stringify(observeSpec.color));
    //    console.log(JSON.stringify(observeSpec.cpu));
    //    console.log(JSON.stringify(observeSpec.rear_camera));
    //    console.log(JSON.stringify(observeSpec.front_camera));
    //    console.log(JSON.stringify(observeLoc));
    //    console.log(JSON.stringify(observeTarget));
    //    console.log(mapObj.fromFormatStr);
    //    console.log(mapObj.toFormatStr);
    //    console.log(JSON.stringify(permission));
    //    console.log(currentTrendBy);
    //    console.log(currentTrendLevel);
    //    console.log(currentTrendTimescale);

    var URLs = "php/_dbqueryGetActivationTrend.php";
    $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            data: JSON.stringify(observeTarget),
            from: mapObj.fromFormatStr,
            to: mapObj.toFormatStr,
            permission: JSON.stringify(permission),
            trendBy: currentTrendBy,
            trendLevel: currentTrendLevel,
            trendTime: currentTrendTimescale,
        },
        type: "GET",
        dataType: 'text',

        success: function (json) {
            json = JSON.parse(decodeEntities(json));
            activationTrend.showChart(json);
            console.log(json);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetActivationDistribution:" + xhr.status);
            alert(thrownError);
        }
    });
}

function ajaxTableDetailExport() {
    var mapObj = firstMap;
    var URLs = "php/_dbqueryGetTableDetailExport.php";
    $.ajax({
        url: URLs,
        data: {
            color: JSON.stringify(observeSpec.color),
            cpu: JSON.stringify(observeSpec.cpu),
            rearCamera: JSON.stringify(observeSpec.rear_camera),
            frontCamera: JSON.stringify(observeSpec.front_camera),
            iso: JSON.stringify(observeLoc),
            data: JSON.stringify(observeTarget),
            from: mapObj.fromFormatStr,
            to: mapObj.toFormatStr,
            permission: JSON.stringify(permission),
        },
        type: "GET",
        dataType: 'text',

        success: function (tableHTML) {
            //            console.log(tableHTML);
            var isoStr = '[' + observeLoc.join(',') + ']';
            var filename = isoStr + '_' + mapObj.fromFormatStr + '～' + mapObj.toFormatStr;
            multiSheetTableExport(decodeEntities(tableHTML), filename, sheetNameList);
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert("ajaxGetActivationDistribution:" + xhr.status);
            alert(thrownError);
        }
    });
}
