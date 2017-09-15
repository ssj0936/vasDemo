<?php
	ini_set('display_errors', 1); 
	error_reporting(E_ALL);


    ini_set("max_execution_time", 0);
	//echo "123";
//    require_once("DBconfig.php");
//    require_once("DBclass.php");
/*
    $permissionExpireLimit = 2;
    $tablenameLoc = $countryDataOnMap;
    $tablenameProduct="product_list";
	$tablenameDealerCountry="dealer_country";
    $db = new DB();
    $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['dbnameService']);
    
//    $account = $_GET['account'];
//    $isVIP = (($_GET['isVIP']=='true')?true:false);
//    $isCFR = (($_GET['isCFR']=='true')?true:false);
    
    $account = 'Timothy_Chung';
    $isVIP = true;
    $isCFR = true;

    $permission;
    $permissionProductId = array();
    $permissionLoc = array();
    $permissionPair = array();
    $permissionProductIdStr;
    $permissionLocStr;
    $permissionResult = array();
    $productToProductID = array();

    $originalIsVIP = $isVIP;
    $isVIP = $isVIP || $isCFR;

    $isPass = false;
    if(!$isVIP){
        $db->query("SELECT * FROM $accessPermission WHERE account = '$account'");
        $row = $db->fetch_array();
        
        $dStart = new DateTime($row['recordDate']);
        $dEnd  = new DateTime();
        $dDiff = $dStart->diff($dEnd)->days;
        
        //means cache has data
        if(isset($row['account']) && $dDiff < $permissionExpireLimit){
            $isPass = true;
            $permissionResultObj = json_decode($row['permission']);
            
//            print_r($permissionResultObj);
            foreach($permissionResultObj as $loc=>$val){
                $index = (($loc=='_empty_') ? '' : $loc);
                $permissionResult[$index] = $val;
                
                foreach($val as $product){
                    $permissionProductId[] = $product;
                }
                $permissionLoc[] = $index;
                
                if($loc=='_empty_' && in_array('',$val))
                    $isVIP = true;
            }
            $permissionProductId = array_unique($permissionProductId);
            $permissionLoc = array_unique($permissionLoc);
            $permissionProductIdStr = "'".implode("','",$permissionProductId)."'";
            $permissionLocStr_ = '';
            foreach($permissionResult as $key=>$arr){
                $permissionLocStr_ .= "'$key',";
            }
            $permissionLocStr_ = substr($permissionLocStr_, 0, -1);
            $permissionLocStr = $permissionLocStr_;
        }
        else{
            //account permission
            $context = stream_context_create(array('ssl' => array('verify_peer' => false, 'allow_self_signed' => true)));
            try{
                $client = new SoapClient($soapUrl,array('stream_context' => $context, 'trace'=>true,'exceptions'=>true));
                $permission = $client->getBISReportPermission(
                    array("objRequest" => 
                        array('Account' => $Account,
                             'Password' => $Password,
                             'SendID' => $SendID,
                             'ReceiveID' => $ReceiveID,
                             'Report_ID' => $Report_ID,
                             'AD_Account' => $account)
                    )
                );
                //permission allow
                if($permission -> getBISReportPermissionResult -> ReturnCode == '0.0'
                  && isset($permission -> getBISReportPermissionResult -> OutputDataList -> OutputData)
                  && count($permission -> getBISReportPermissionResult -> OutputDataList -> OutputData)!=0){
                    $isPass = true;

                    //different format of permission data
                    //1.array 
                    if(is_array($permission -> getBISReportPermissionResult -> OutputDataList -> OutputData)){
                        foreach($permission -> getBISReportPermissionResult -> OutputDataList -> OutputData as $value){
                            $permissionProductId[] = $value->Product_ID;
                            $permissionLoc[] = $value->Country;
                            $permissionPair[] = ['country' => $value->Country, 'productID' => $value->Product_ID];

                            if(!isset($permissionResult[$value->Country]) || !in_array($value->Product_ID,$permissionResult[$value->Country]))
                                $permissionResult[$value->Country][] = $value->Product_ID;
                        }
                    }
                    //2.single object
                    else{
                        $value = $permission -> getBISReportPermissionResult -> OutputDataList -> OutputData;
                        $permissionProductId[] = $value->Product_ID;
                        $permissionLoc[] = $value->Country;
                        $permissionPair[] = ['country' => $value->Country, 'productID' => $value->Product_ID];

                        if(!isset($permissionResult[$value->Country]) || !in_array($value->Product_ID,$permissionResult[$value->Country]))
                            $permissionResult[$value->Country][] = $value->Product_ID;
                    }

                    //equal VIP
                    if(in_array(['country' => '', 'productID' => '' ],$permissionPair)){
                        $isVIP = true;
                    }
                    else{
                        $permissionProductId = array_unique($permissionProductId);
                        $permissionLoc = array_unique($permissionLoc);
                        $permissionProductIdStr = "'".implode("','",$permissionProductId)."'";
                        $permissionLocStr = "'".implode("','",$permissionLoc)."'";
                        //get isoA2 from permission api,but we need to switch it to isoA3
                        if($permissionLocStr != "''"){
                            $query = "SELECT iso,isoa2
                                        FROM $tablenameLoc
                                        WHERE isoa2 IN($permissionLocStr)";
//                            echo $query;
                            $db->query($query);
                            while($row = $db->fetch_array()){
                                $permissionResult[$row['iso']] = $permissionResult[$row['isoa2']];
                                unset($permissionResult[$row['isoa2']]);
                            }
                            //delete un-converted item
                        }
                    }

                    foreach($permissionResult as $key => $val){
                        if(strlen($key) == 2)
                            unset($permissionResult[$key]);
                        else
                            sort($permissionResult[$key]);
                    }
                    $permissionLocStr_ = '';
                    foreach($permissionResult as $key=>$arr){
                        $permissionLocStr_ .= "'$key',";
                    }
                    $permissionLocStr_ = substr($permissionLocStr_, 0, -1);
                    $permissionLocStr = $permissionLocStr_;
                    //save permisson result to DB
                    $query = "INSERT INTO $accessPermission ([account],[permission],[recordDate]) VALUES('$account','".json_encode($permissionResult)."','".date('Y-m-d')."')";
                    $db->query($query);
                }
            }
            catch (Exception $e) 
            {
                $isPass = false;
            }
        }
    }
    $allDevices = array();
    $allLoc = array();
    $allCategory = array();
    
    if(!$isPass && !$isVIP){
    }
    else{    
        $currentSeries = '';
        $currentProduct = '';
        
        $query = '';
        //device
        
        $query = "SELECT distinct A1.product_ID,A4.model_description device_name,A2.model_name,PRODUCT product
                    FROM (SELECT distinct product_ID,model_name FROM $productIdMapping) A1,$deviceTable A2,$productNameModelMapping A3,$productDescriptionMapping A4
                    where A2.model_name = A3.MODEL
                    and A1.model_name = A2.model_name
                    and A2.device_name = A4.device_name"
                    .((in_array('',$permissionProductId) || $isVIP) ? '' :" and A1.product_ID IN ($permissionProductIdStr)")
                    ." ORDER BY PRODUCT,A2.model_name,device_name;";

        $db->query($query);

        while($row = $db->fetch_array()){
            //device part
            if($currentProduct=='' || $currentProduct != $row['product']){
                $currentProduct = $row['product'];
                $allDevices[$currentProduct] = array();
            }

            if($currentSeries=='' || $currentSeries != $row['model_name']){
                $currentSeries = $row['model_name'];
                $allDevices[$currentProduct][$currentSeries]=array();
            }
            $allDevices[$currentProduct][$currentSeries][] = $row['device_name'];
            
            //product -> productID mapping
            if(!isset($productToProductID[$currentProduct]))
                $productToProductID[$currentProduct] = $row['product_ID'];
        }

        //loc
        if($isVIP){
            $query = "SELECT DISTINCT * 
                    FROM $tablenameLoc 
                    ORDER BY Terrority,NAME_0;";
        }else if($isPass && !$isVIP){
            $query = "SELECT DISTINCT *
                FROM $tablenameLoc "
                .(in_array('',$permissionLoc) ? '' :" WHERE iso IN($permissionLocStr) ")
                ." ORDER BY Terrority,NAME_0;";
        }
//        echo $query;
        $db->query($query);
        while($row = $db->fetch_array()){
            $countryName = $row['NAME_0'];
            $terrority = $row['Terrority'];
            $allLoc[$terrority][$countryName][] = $row['iso'];
        }

    }

    $allEmpty = true;
    foreach($permissionResult as &$productArr){
//        for($i=0;$i<count($productArr);++$i){
        for($i=count($productArr)-1;$i>=0;--$i){
            if(!in_array($productArr[$i],$productToProductID) && $productArr[$i] != ''){
                unset($productArr[$i]);
            }
        }
        $productArr = array_values($productArr);
        
        if(count($productArr) != 0)
            $allEmpty = false;
    }
//    echo '<br><br>';
//    print_r($permissionResult);

    //get unpopular model
    $query = "SELECT observed_model FROM $unpopularModel";
    $unpopularModelList = array();
    $db->query($query);
    while($row = $db->fetch_array()){
        $unpopularModelList[] = $row['observed_model'];
    }

    $result['allDevices']=$allDevices;
    $result['allLoc']=$allLoc;
    $result['unpopularModel']=$unpopularModelList;
    $result['activationUpdateTime']=$_DB['activation']['updatetime'];
    $result['lifezoneUpdateTime']=$_DB['lifezone']['updatetime'];
    $result['isPass']= ($allEmpty ||(!$isPass && !$originalIsVIP))? false :true ;
    $result['isVIP']= $originalIsVIP;
    $result['accountPermission']= $permissionResult ;
    $result['productToProductID']= $productToProductID ;

    $json = json_encode($result);
*/
    $json = '{"allDevices":{"Product1":{"Model1":["Model1(2G\/32G)","Model1(4G\/32G)","Model1(4G\/64G)","Model1(unknown)"],"Model2":["Model2(2G\/16G)","Model2(3G\/32G)","Model2(4G\/32G)","Model2(4G\/64G)","Model2(unknown)"],"Model3":["Model3(3G\/32G)","Model3(4G\/64G)","Model3(unknown)"],"Model4":["Model4(3G\/32G)","Model4(4G\/64G)","Model4(unknown)"],"Model4":["Model4(4G\/64G)","Model4(unknown)"],"Model5":["Model5(4G\/32G)","Model5(6G\/128G)","Model5(6G\/256G)","Model5(6G\/64G)","Model5(unknown)"]},"Product2":{"Model6":["Model6(1G\/8G)"],"Model7":["Model7(2G\/16G)","Model7(unknown)"],"Model8":["Model8(2G\/16G)","Model8(2G\/32G)","Model8(unknown)"],"Model8":["Model8(2G\/16G)","Model8(2G\/32G)","Model8(3G\/32G)","Model8(unknown)"],"Model9":["Model9(3G\/32G)","Model9(unknown)"],"Model10":["Model10(2G\/32G)","Model10(3G\/32G)","Model10(unknown)"]}},"allLoc":{"AMERICAS":{"Brazil":["BRA"],"Canada":["CAN"],"Colombia":["COL"],"United States":["USA"]},"APAC":{"Bangladesh":["BGD"],"Cambodia":["KHM"],"Hong Kong":["HKG"],"India":["IND"],"Indonesia":["IDN"],"Japan":["JPN"],"Malaysia":["MYS"],"Myanmar":["MMR"],"Philippines":["PHL"],"Singapore":["SGP"],"South Korea":["KOR"],"Thailand":["THA"],"Vietnam":["VNM"]},"CHINA":{"China":["CHN"]},"EMEA":{"Albania":["ALB"],"Bahrain":["BHR"],"Bulgaria":["BGR"],"Czech Republic":["CZE"],"Egypt":["EGY"],"France":["FRA"],"Germany":["DEU"],"Hungary":["HUN"],"Israel":["ISR"],"Italy":["ITA"],"Kazakhstan":["KAZ"],"Lithuania":["LTU"],"Netherlands":["NLD"],"Norway":["NOR"],"Poland":["POL"],"Portugal":["PRT"],"Romania":["ROU"],"Russia":["RUS"],"Serbia":["SRB"],"Slovakia":["SVK"],"Slovenia":["SVN"],"Spain":["ESP"],"Sweden":["SWE"],"Turkey":["TUR"],"Ukraine":["UKR"],"United Arab Emirates":["ARE"],"United Kingdom":["GBR"]},"TAIWAN":{"Taiwan":["TWN"]}},"unpopularModel":["ZB501KL","ZD552KL","Z301ML","ZB500TL","ZS571KL"],"activationUpdateTime":"2017-06-08","lifezoneUpdateTime":"2017-06-23","isPass":false,"isVIP":true,"accountPermission":[],"productToProductID":{"ZENFONE":"AZ","ZENFONE-D":"AX","ZENFONE-P":"AK","ZENPAD":"NP"}}';
    echo htmlspecialchars($json);

?>