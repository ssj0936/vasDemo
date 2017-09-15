var token = "pk.eyJ1Ijoic3NqMDkzNiIsImEiOiJjaWxsdmxrYXc2MnJwdmFtY3c4cjQ3dnI4In0.0eeAJAshcFS38dShzNJtcA";

var firstMap = new MapObject('firstMap');
var comparisonMap = new MapObject('comparisonMap');
var tileOptions = {
    maxZoom: 22, // max zoom to preserve detail on
    tolerance: 10, // 5 simplification tolerance (higher means simpler)
    extent: 4096, //4096, // 4096 tile extent (both width and height)
    buffer: 64, // 64 default 64tile buffer on each side
    debug: 0, // logging level (0 to disable, 1 or 2)
    indexMaxZoom: 0, // 0 max zoom in the initial tile index
    indexMaxPoints: 100000, // 100000 max number of points per tile in the index
};

//---flag-------------------------
var isRegionOn = false;
var isMarkerOn = false;
var isComparisonOn = false;
var isQcRegionOn = false;
var isQcMarkerOn = false;
var isParallelImportOn = false;
var isParallelExportOn = false;
//var isLifeZoneOn = false;

var needToLoadTwoModeSameTime = false;
var loadingRegionFinish = false;
var loadingMarkerFinish = false;

var activeFunction,
    activeFunctionTmp;
var FUNC_ACTIVATION = "activation",
    FUNC_LIFEZONE = "lifezone",
    FUNC_ACTIVATION_TABLE = "activationTable",
    FUNC_GAP = "gap",
    FUNC_DISTBRANCH = "distBranch",
    FUNC_QC = "qc",
    FUNC_PARALLEL = "parallel",
    FUNC_ACTIVATION_TREND = "activationTrend",
    FUNC_ACTIVATION_DISTRIBUTION = "activationDistribution",
    FUNCTION_DEFAULT = FUNC_ACTIVATION;
//*******************************************
var FUNC_COMPOSE = "compose";
var FUNC_MOBILE = "mobile";
//*******************************************

var updateTime = {
    activation: undefined,
    lifezone: undefined,
}
var linechart = null;

var forcingName1List = ['BHR', 'SGP', 'ARE', 'HKG', 'ISR'];
var forcingName2List = ['TWN'];
//var account=undefined;
var account = "";

var device, model, datatype;
//map
var allDevicesList = [];
var allLoc = [];
var unpopularList = [];
var allSpec = {};
var isNeedToHideGap = false;
var gapLoc = [];
var isNeedToHideDistBranch = false;
var distBranchLoc = [];

//service filter
var allProduct = [];
var allDealerCountry = [];
var specDeviceTmp = [];
var allBranchObject = [];
var allHighlighBranch;
var allBranchGap;
var cartoServiceLayer, cartoDealerLayer;
var isServiceLayerShowing = false;
var serviceLayerInit = false;
var isDealerLayerShowing = false;
var dealerLayerInit = false;
var isMapModified = false;
var bookmarkList;
var isGapOn = false;
var needToForceExtractMap = false;


//dealer 
var allDealer = [];
var allSC = [];
var dealerTileIndex;
var scTileIndex;
var dealerTileLayer;
var pointTileLayer;
var canvasArray = [];
var isPointPopup = false;

var pruneCluster;
var showing_polygon;
var previousMapID;
var previousISO;

var observeTarget = [];
var observeTargetTmp = [];
var observeTargetDeviceOnly = [];
var observeTargetDeviceOnlyTmp = [];
var observeLoc = [];
var observeLocTmp = [];
var observeSpec = {};
var observeSpecTmp = {};
//var observeLocLast=[];
var observeLocFullName = [];
var observeLocFullNameTmp = [];
var observeBranchName = [];
var observeDistName = [];
var isDistBranchFilterShowing = false;
var distBranch = [];
var branchDist = [];
var onlineDist = [];
var observeDistBranch = [];
//var isDistBranchCountrySelected = false;
var isDistBranchSelected = false;
var isGapButtonCanShow = false;

var isNowBranchTrend = false;

var activeMode;
var MODE_REGION = "region";
var MODE_MARKER = "marker";
var MODE_COMPARISION = "comparision";
var MODE_QC_REGION = "qcRegion";
var MODE_QC_MARKER = "qcMarker";
var MODE_PARALLEL_IMPORT = "parallelImport";
var MODE_PARALLEL_EXPORT = "parallelExport";

//activation trend by
/****************************************************************/
var MODE_ACTIVATION_TREND_BY_MODEL = "activationTrendByModel";
var MODE_ACTIVATION_TREND_BY_DEVICE = "activationTrendByDevice";
var MODE_ACTIVATION_TREND_BY_REGION = "activationTrendByRegion";
var MODE_ACTIVATION_TREND_BY = [MODE_ACTIVATION_TREND_BY_MODEL
                                , MODE_ACTIVATION_TREND_BY_DEVICE
                                , MODE_ACTIVATION_TREND_BY_REGION];
var defaultTrendBy = MODE_ACTIVATION_TREND_BY[0];
var currentTrendBy = defaultTrendBy;

var MODE_ACTIVATION_TREND_LEVEL_COUNTRY = "activationTrendLevelCountry";
var MODE_ACTIVATION_TREND_LEVEL_BRANCH = "activationTrendLevelBranch";
var MODE_ACTIVATION_TREND_LEVEL_L1 = "activationTrendLevelL1";
var MODE_ACTIVATION_TREND_LEVEL_L2 = "activationTrendLevelL2";
var MODE_ACTIVATION_TREND_LEVEL = [MODE_ACTIVATION_TREND_LEVEL_COUNTRY
                                , MODE_ACTIVATION_TREND_LEVEL_BRANCH
                                , MODE_ACTIVATION_TREND_LEVEL_L1
                                , MODE_ACTIVATION_TREND_LEVEL_L2];
var defaultTrendLevel = MODE_ACTIVATION_TREND_LEVEL[0];
var currentTrendLevel = defaultTrendLevel;

var MODE_ACTIVATION_TREND_TIMESCALE_DAY = "activationTrendTimescaleDay";
var MODE_ACTIVATION_TREND_TIMESCALE_WEEK = "activationTrendTimescaleWeek";
var MODE_ACTIVATION_TREND_TIMESCALE_MONTH = "activationTrendTimescaleMonth";
var MODE_ACTIVATION_TREND_TIMESCALE = [MODE_ACTIVATION_TREND_TIMESCALE_DAY
                                , MODE_ACTIVATION_TREND_TIMESCALE_WEEK
                                , MODE_ACTIVATION_TREND_TIMESCALE_MONTH];
var defaultTrendTimescale = MODE_ACTIVATION_TREND_TIMESCALE[0];
var currentTrendTimescale = defaultTrendTimescale;

//activation distribute by
/****************************************************************/
var MODE_ACTIVATION_DISTRIBUTED_BY_MODEL = "activationDistributedByModel";
var MODE_ACTIVATION_DISTRIBUTED_BY_DEVICE = "activationDistributedByDevice";
var MODE_ACTIVATION_DISTRIBUTED_BY_REGION = "activationDistributedByRegion";
var MODE_ACTIVATION_DISTRIBUTED_BY = [MODE_ACTIVATION_DISTRIBUTED_BY_MODEL
                                , MODE_ACTIVATION_DISTRIBUTED_BY_DEVICE
                                , MODE_ACTIVATION_DISTRIBUTED_BY_REGION];
var defaultDistributedBy = MODE_ACTIVATION_DISTRIBUTED_BY[0];
var currentDistributedBy = defaultDistributedBy;

var MODE_ACTIVATION_DISTRIBUTED_LEVEL_COUNTRY = "activationDistributedLevelCountry";
var MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH = "activationDistributedLevelBranch";
var MODE_ACTIVATION_DISTRIBUTED_LEVEL_L1 = "activationDistributedLevelL1";
var MODE_ACTIVATION_DISTRIBUTED_LEVEL_L2 = "activationDistributedLevelL2";
var MODE_ACTIVATION_DISTRIBUTED_LEVEL = [MODE_ACTIVATION_DISTRIBUTED_LEVEL_COUNTRY
                                , MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH
                                , MODE_ACTIVATION_DISTRIBUTED_LEVEL_L1
                                , MODE_ACTIVATION_DISTRIBUTED_LEVEL_L2];
var defaultDistributedLevel = MODE_ACTIVATION_DISTRIBUTED_LEVEL[0];
var currentDistributedLevel = defaultDistributedLevel;

/****************************************************************/
var VIEW_LMD = "lmd";
var VIEW_MUC = "muc";
var DEFAULT_VIEW = VIEW_MUC;
var currentView = DEFAULT_VIEW;
//var MODE_GAP = "gap";
//var MODE_LIFEZONE = "lifezone";

var clickFromFilterResult = false;

var sessionChecked = false;

var trendObj = null;
var trendObjOriginal = null;

//heatmap
var gradientCfg;
var legendCanvas;
var heatmapLayer;
var zoomRadius = 10;

var heatData = {
    data: []
};
var currentTime = {};
var lifeZoneTime = {
    'week': 1,
    'time': 1
};

var lifeZoneTimeDefault = {
    'week': 1,
    'time': 1
};

//use for filter in trend chart
var FilterList = ['Device', 'Country', 'CPU', 'Color', 'RearCamera', 'FrontCamera'];

//for gap function
var currentPointingBranch = null;

var permission = null;
var isVip;
var isAdministrator = false;
var isCFR = false;
var productTopProductIDList = [];
var DEVMode = false;

//for CRF map
var DEFAULT_CATEGORY = 'ALL',
    currentCategory;

//for activation table
var sheetNameList = ['By Branch or 1st-level division', 'By 1st or 2nd level division', 'By model'];

var BROWSER_IE = 'b_ie';
var BROWSER_CHROME = 'b_chrome';
var BROBSER_SAFARI = 'b_safari';

var DIMENSION_COUNTRY = 'dimension_country',
    DIMENSION_L1 = 'dimension_l1',
    DIMENSION_L2 = 'dimension_l2',
    DIMENSION_BRANCH = 'dimension_branch';
var isDimensionChanged = false;

var FILE_EXPORT_TYPE_IMPORT = 'Import',
    FILE_EXPORT_TYPE_EXPORT = 'Export';

var datepickerInit = false;
