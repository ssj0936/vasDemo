<?php
    ini_set("max_execution_time", 0);

//    require_once("DBconfig.php");
//    require_once("DBclass.php");
//    require_once("function.php");
//    $db = new DB();
/*
    //$db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['dbname']);
    $results = array();
    $resultsGroupByRegion = array();
    $resultsGroupByModel = array();
    $resultsGroupByDevice = array();
    $resultsGroupByDist = array();
    $resultsGroupByBranch = array();

//    $color = $_POST['color'];
//    $cpu = $_POST['cpu'];
//    $rearCamera = $_POST['rearCamera'];
//    $frontCamera = $_POST['frontCamera'];
//    $dataset = $_POST['dataset'];
//    $countryID = $_POST['countryID'];
//    $from = $_POST['from'];
//    $to = $_POST['to'];
//    $data = $_POST['data'];
//    $iso = $_POST['iso'];
//    $distBranch = $_POST['distBranch'];
//    $onlineDist = $_POST['onlineDist'];
//    $permission = $_POST['permission'];
//    $dimension = $_POST['dimension'];

//    
    $color = '["all"]';
    $cpu = '["all"]';
    $rearCamera = '["all"]';
    $frontCamera = '["all"]';
    $dataset = 'activation';
    $from = "2016-11-02";
    $to = "2016-12-02";   
    $countryID = 101094;
//    $iso = 'TWN';
    $data = '[{"model":"ZENFONE","devices":"ZENFONE","product":"ZENFONE","datatype":"product"}]';
    $distBranch = '[]';
    $onlineDist = '[]';
    $permission = '{}';
    $dimension = $DIMENSION_L1;
//    $countryID = 'delhi';
    $iso = 'IND';
    
    $dataObj = json_decode($data);
    $colorObj = json_decode($color);
    $cpuObj = json_decode($cpu);
    $rearCameraObj = json_decode($rearCamera);
    $frontCameraObj = json_decode($frontCamera);
    $distBranchObj = json_decode($distBranch);
    $onlineDistObj = json_decode($onlineDist);
    $permissionObj = json_decode($permission);
        
    $isDistBranch = (count($distBranchObj)!=0);
    $isOnlineDist = (count($onlineDistObj)!=0);
    $isFullPermission = (empty((array)$permissionObj));
    $distBranchStr = getSQLDistBranchStr($distBranchObj,false);
    $onlineDistStr = getSQLOnlineDistStr($onlineDistObj,false);
    
    $isAll = isAll($dataObj);

    //color
    $isColorAll=isAll($colorObj);
    $color_in=getSQLInStr($colorObj);

    //CPU
    $isCpuAll=isAll($cpuObj);
    $cpu_in=getSQLInStr($cpuObj);

    //FrontCamera
    $isFrontCameraAll=isAll($frontCameraObj);
    $frontCamera_in=getSQLInStr($frontCameraObj);

    //RearCamera
    $isRearCameraAll=isAll($rearCameraObj);
    $rearCamera_in=getSQLInStr($rearCameraObj);

    switch($dimension){
        case $DIMENSION_L2:
            $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB[$dataset]['dbnameRegionL2']);
            break;
        case $DIMENSION_L1:
        case $DIMENSION_COUNTRY:
            $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB[$dataset]['dbnameRegionL1']);
            break;
        case $DIMENSION_BRANCH:
            $db->connect_db($_DB['host'], $_DB['username'], $_DB['password']);
            $sqlLevel = getBranchLocLevelSql($iso);

            $db->query($sqlLevel);
            $row = $db->fetch_array();
            $maplevel = intval($row['loc_level']);
            //means not support branch
            if($maplevel != 0){
                $present = $row['tam_spec'];
                $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB[$dataset]['dbnameRegionL'.$maplevel]);
            }
            break;
        default:
            $db->connect_db($_DB['host'], $_DB['username'], $_DB['password']);
            break;
    }


//    $DB='';
//    if($isL1=="true"){
//        $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB[$dataset]['dbnameRegionL1']);
//    }else if($isL1=="false"){
//        $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB[$dataset]['dbnameRegionL2']);
//    }
    
    $str_in='';
        
    $sqlDeviceIn = getAllTargetPartNoSql($dataObj);

    $db->query($sqlDeviceIn);
    while($row = $db->fetch_array()){
        $str_in.="'".$row['product_id']."',";
    }
    $str_in = substr($str_in,0,-1);
    
    if(!$isFullPermission){
        $result = permissionCheck($isFullPermission,$permissionObj,$iso);
//        if(!$result['queryable']) continue;
    }
    switch($dimension){
        case $DIMENSION_L1:
        case $DIMENSION_L2:
            //Group by region
            $queryStr="SELECT date,SUM(count) AS count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    ." AND map_id='$countryID'"
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                    ." GROUP BY date ORDER BY date";
            $first = true;
            $start_date = null;
            $end_date = null;
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
               $resultsGroupByRegion[] = array(
                  'date' => ($row['date']),
                  'count' => ($row['count']),
               );

                if($first){
                    $start_date = $row['date'];
                    $first=false;
                }
                $end_date = $row['date'];
            }

            //Group by Model
            $queryStr="SELECT device_model.model_name model_name,date,SUM(count) AS count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    ." AND map_id='$countryID'"
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                    ." GROUP BY date, device_model.model_name ORDER BY date,device_model.model_name";
        //    echo "2:".$queryStr."<br>";
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByModel[$row['model_name']][] = array(
                    //'model' => ($row['model_name']),
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }

            //Group by Device
            $queryStr="SELECT part_device.model_description as device,date,SUM(count) AS count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model,"
                    ."$productDescriptionMapping part_device"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    ." AND A1.product_id = part_device.product_id"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    ." AND map_id='$countryID'"
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                    ." GROUP BY date, part_device.model_description ORDER BY date,part_device.model_description";
        //    echo "3:".$queryStr."<br>";
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByDevice[$row['device']][] = array(
                    //'model' => ($row['model_name']),
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }

            if($isDistBranch){
                //Group by Dist
                $queryStr="SELECT date,SUM(count) AS count,disti"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$iso A1,"
                        ."$deviceTable device_model"

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        ." AND map_id='$countryID'"
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                        .($isDistBranch ? " AND $distBranchStr " : "")
                        .($isOnlineDist ? " AND $onlineDistStr " : "")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." GROUP BY date,disti ORDER BY date,disti;";

                $db->query($queryStr);
                while($row = $db->fetch_array())
                {
                   $resultsGroupByDist[$row['disti']][] = array(
                      'date' => ($row['date']),
                      'count' => ($row['count']),
                   );
                }

                //Group by Branch
                $queryStr="SELECT date,SUM(count) AS count,branch"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$iso A1,"
                        ."$deviceTable device_model"

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        ." AND map_id='$countryID'"
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                        .($isDistBranch ? " AND $distBranchStr " : "")
                        .($isOnlineDist ? " AND $onlineDistStr " : "")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." GROUP BY date,branch ORDER BY date,branch;";

                $db->query($queryStr);
                while($row = $db->fetch_array())
                {
                   $resultsGroupByBranch[$row['branch']][] = array(
                      'date' => ($row['date']),
                      'count' => ($row['count']),
                   );
                }
            }
            break;
            
        case $DIMENSION_COUNTRY:
            //Group by region
            $queryStr="SELECT date,SUM(count) AS count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                    ." GROUP BY date ORDER BY date";
            $first = true;
            $start_date = null;
            $end_date = null;
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
               $resultsGroupByRegion[] = array(
                  'date' => ($row['date']),
                  'count' => ($row['count']),
               );

                if($first){
                    $start_date = $row['date'];
                    $first=false;
                }
                $end_date = $row['date'];
            }

            //Group by Model
            $queryStr="SELECT device_model.model_name model_name,date,SUM(count) AS count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                    ." GROUP BY date, device_model.model_name ORDER BY date,device_model.model_name";
        //    echo "2:".$queryStr."<br>";
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByModel[$row['model_name']][] = array(
                    //'model' => ($row['model_name']),
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }

            //Group by Device
            $queryStr="SELECT part_device.model_description as device,date,SUM(count) AS count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model,"
                    ."$productDescriptionMapping part_device"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    ." AND A1.product_id = part_device.product_id"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                    ." GROUP BY date, part_device.model_description ORDER BY date,part_device.model_description";
        //    echo "3:".$queryStr."<br>";
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByDevice[$row['device']][] = array(
                    //'model' => ($row['model_name']),
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }
            break;
            
        case $DIMENSION_BRANCH:
            
            $branchName = $countryID;
            
            //Group by region
            $queryStr="SELECT (SELECT branchName FROM $regionTam where mapid = map_id)name,date,SUM(count) AS count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                    ." GROUP BY date,map_id ";

            $queryStr = "SELECT date,SUM(count) AS count FROM ($queryStr)foo WHERE name = '$branchName' GROUP BY date ORDER BY date";
            $first = true;
            $start_date = null;
            $end_date = null;
            $db->query($queryStr);
//            echo $queryStr."<br>";
            while($row = $db->fetch_array())
            {
               $resultsGroupByRegion[] = array(
                  'date' => ($row['date']),
                  'count' => ($row['count']),
               );

                if($first){
                    $start_date = $row['date'];
                    $first=false;
                }
                $end_date = $row['date'];
            }

            //Group by Model
            $queryStr="SELECT (SELECT branchName FROM $regionTam where mapid = map_id)name,*"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");
            
            $queryStr = "SELECT model_name model_name,date,SUM(count) AS count
                            FROM($queryStr)foo
                            WHERE name = '$branchName'
                            GROUP BY date, model_name 
                            ORDER BY date,model_name;";
                
//                echo "2:".$queryStr."<br>";
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByModel[$row['model_name']][] = array(
                    //'model' => ($row['model_name']),
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }

            //Group by Device
            $queryStr="SELECT (SELECT branchName FROM $regionTam where mapid = map_id)name,model_description,date,count"
                    ." FROM "
                    .($isColorAll ? "" : "$colorMappingTable A2,")
                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                    ."$iso A1,"
                    ."$deviceTable device_model,"
                    ."$productDescriptionMapping part_device"

                    ." WHERE "
                    ."date BETWEEN '".$from."' AND '".$to."'"
                    ." AND A1.device = device_model.device_name"
                    ." AND A1.product_id = part_device.product_id"
                    .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN($color_in)")
                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN($cpu_in)")
                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN($frontCamera_in)")
                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN($rearCamera_in)")
                    .($isDistBranch ? " AND $distBranchStr " : "")
                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");
                    
            $queryStr = "SELECT model_description as device,date,SUM(count) AS count 
                        FROM($queryStr)foo
                        WHERE name = '$branchName'
                        GROUP BY date, model_description 
                        ORDER BY date,model_description";
//            echo "3:".$queryStr."<br>";
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByDevice[$row['device']][] = array(
                    //'model' => ($row['model_name']),
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }
            break;
            break;
    }
    $results['groupByRegionResults'] = $resultsGroupByRegion;
    $results['groupByModelResults'] = $resultsGroupByModel;
    $results['groupByDeviceResults'] = $resultsGroupByDevice;
    $results['groupByDistResults'] = $resultsGroupByDist;
    $results['groupByBranchResults'] = $resultsGroupByBranch;
    $results['start_time'] = $start_date;
    $results['end_time'] = $end_date;
    $json = json_encode($results);*/
$json = '{"groupByRegionResults":[{"date":"2016-11-02","count":27},{"date":"2016-11-03","count":21},{"date":"2016-11-04","count":25},{"date":"2016-11-05","count":28},{"date":"2016-11-06","count":27},{"date":"2016-11-07","count":13},{"date":"2016-11-08","count":18},{"date":"2016-11-09","count":21},{"date":"2016-11-10","count":18},{"date":"2016-11-11","count":18},{"date":"2016-11-12","count":13},{"date":"2016-11-13","count":19},{"date":"2016-11-14","count":14},{"date":"2016-11-15","count":18},{"date":"2016-11-16","count":8},{"date":"2016-11-17","count":18},{"date":"2016-11-18","count":10},{"date":"2016-11-19","count":17},{"date":"2016-11-20","count":25},{"date":"2016-11-21","count":16},{"date":"2016-11-22","count":12},{"date":"2016-11-23","count":19},{"date":"2016-11-24","count":23},{"date":"2016-11-25","count":19},{"date":"2016-11-26","count":24},{"date":"2016-11-27","count":16},{"date":"2016-11-28","count":16},{"date":"2016-11-29","count":18},{"date":"2016-11-30","count":21},{"date":"2016-12-01","count":19},{"date":"2016-12-02","count":18}],"groupByModelResults":{"MODEL2":[{"count":4,"date":"2016-11-02"},{"count":3,"date":"2016-11-03"},{"count":3,"date":"2016-11-04"},{"count":5,"date":"2016-11-05"},{"count":2,"date":"2016-11-06"},{"count":3,"date":"2016-11-07"},{"count":5,"date":"2016-11-08"},{"count":6,"date":"2016-11-09"},{"count":4,"date":"2016-11-10"},{"count":4,"date":"2016-11-11"},{"count":3,"date":"2016-11-12"},{"count":1,"date":"2016-11-14"},{"count":5,"date":"2016-11-15"},{"count":1,"date":"2016-11-16"},{"count":4,"date":"2016-11-17"},{"count":2,"date":"2016-11-18"},{"count":1,"date":"2016-11-19"},{"count":1,"date":"2016-11-20"},{"count":3,"date":"2016-11-21"},{"count":3,"date":"2016-11-22"},{"count":6,"date":"2016-11-23"},{"count":7,"date":"2016-11-24"},{"count":5,"date":"2016-11-25"},{"count":6,"date":"2016-11-26"},{"count":4,"date":"2016-11-27"},{"count":6,"date":"2016-11-28"},{"count":6,"date":"2016-11-29"},{"count":5,"date":"2016-11-30"},{"count":3,"date":"2016-12-01"},{"count":2,"date":"2016-12-02"}],"MODEL1":[{"count":17,"date":"2016-11-02"},{"count":14,"date":"2016-11-03"},{"count":17,"date":"2016-11-04"},{"count":14,"date":"2016-11-05"},{"count":20,"date":"2016-11-06"},{"count":7,"date":"2016-11-07"},{"count":11,"date":"2016-11-08"},{"count":10,"date":"2016-11-09"},{"count":9,"date":"2016-11-10"},{"count":11,"date":"2016-11-11"},{"count":9,"date":"2016-11-12"},{"count":14,"date":"2016-11-13"},{"count":12,"date":"2016-11-14"},{"count":10,"date":"2016-11-15"},{"count":4,"date":"2016-11-16"},{"count":11,"date":"2016-11-17"},{"count":5,"date":"2016-11-18"},{"count":13,"date":"2016-11-19"},{"count":20,"date":"2016-11-20"},{"count":12,"date":"2016-11-21"},{"count":7,"date":"2016-11-22"},{"count":10,"date":"2016-11-23"},{"count":13,"date":"2016-11-24"},{"count":13,"date":"2016-11-25"},{"count":16,"date":"2016-11-26"},{"count":6,"date":"2016-11-27"},{"count":10,"date":"2016-11-28"},{"count":9,"date":"2016-11-29"},{"count":11,"date":"2016-11-30"},{"count":12,"date":"2016-12-01"},{"count":13,"date":"2016-12-02"}],"MODEL3":[{"count":6,"date":"2016-11-02"},{"count":4,"date":"2016-11-03"},{"count":5,"date":"2016-11-04"},{"count":9,"date":"2016-11-05"},{"count":5,"date":"2016-11-06"},{"count":3,"date":"2016-11-07"},{"count":2,"date":"2016-11-08"},{"count":5,"date":"2016-11-09"},{"count":5,"date":"2016-11-10"},{"count":3,"date":"2016-11-11"},{"count":1,"date":"2016-11-12"},{"count":5,"date":"2016-11-13"},{"count":1,"date":"2016-11-14"},{"count":3,"date":"2016-11-15"},{"count":3,"date":"2016-11-16"},{"count":3,"date":"2016-11-17"},{"count":2,"date":"2016-11-18"},{"count":2,"date":"2016-11-19"},{"count":3,"date":"2016-11-20"},{"count":1,"date":"2016-11-21"},{"count":2,"date":"2016-11-22"},{"count":3,"date":"2016-11-23"},{"count":3,"date":"2016-11-24"},{"count":1,"date":"2016-11-25"},{"count":2,"date":"2016-11-26"},{"count":5,"date":"2016-11-27"},{"count":3,"date":"2016-11-29"},{"count":4,"date":"2016-11-30"},{"count":4,"date":"2016-12-01"},{"count":2,"date":"2016-12-02"}],"MODEL4":[{"count":1,"date":"2016-11-18"},{"count":1,"date":"2016-11-19"},{"count":1,"date":"2016-11-20"},{"count":1,"date":"2016-11-27"},{"count":1,"date":"2016-11-30"},{"count":1,"date":"2016-12-02"}]},"groupByDeviceResults":{"MODEL2(4G\/32G)":[{"count":4,"date":"2016-11-02"},{"count":3,"date":"2016-11-03"},{"count":3,"date":"2016-11-04"},{"count":5,"date":"2016-11-05"},{"count":2,"date":"2016-11-06"},{"count":3,"date":"2016-11-07"},{"count":5,"date":"2016-11-08"},{"count":6,"date":"2016-11-09"},{"count":4,"date":"2016-11-10"},{"count":4,"date":"2016-11-11"},{"count":3,"date":"2016-11-12"},{"count":1,"date":"2016-11-14"},{"count":5,"date":"2016-11-15"},{"count":1,"date":"2016-11-16"},{"count":4,"date":"2016-11-17"},{"count":2,"date":"2016-11-18"},{"count":1,"date":"2016-11-19"},{"count":1,"date":"2016-11-20"},{"count":3,"date":"2016-11-21"},{"count":3,"date":"2016-11-22"},{"count":6,"date":"2016-11-23"},{"count":7,"date":"2016-11-24"},{"count":5,"date":"2016-11-25"},{"count":5,"date":"2016-11-26"},{"count":4,"date":"2016-11-27"},{"count":6,"date":"2016-11-28"},{"count":6,"date":"2016-11-29"},{"count":5,"date":"2016-11-30"},{"count":3,"date":"2016-12-01"},{"count":2,"date":"2016-12-02"}],"MODEL1(3G\/32G)":[{"count":17,"date":"2016-11-02"},{"count":14,"date":"2016-11-03"},{"count":17,"date":"2016-11-04"},{"count":14,"date":"2016-11-05"},{"count":20,"date":"2016-11-06"},{"count":7,"date":"2016-11-07"},{"count":11,"date":"2016-11-08"},{"count":10,"date":"2016-11-09"},{"count":9,"date":"2016-11-10"},{"count":11,"date":"2016-11-11"},{"count":9,"date":"2016-11-12"},{"count":14,"date":"2016-11-13"},{"count":12,"date":"2016-11-14"},{"count":10,"date":"2016-11-15"},{"count":4,"date":"2016-11-16"},{"count":11,"date":"2016-11-17"},{"count":5,"date":"2016-11-18"},{"count":13,"date":"2016-11-19"},{"count":20,"date":"2016-11-20"},{"count":12,"date":"2016-11-21"},{"count":7,"date":"2016-11-22"},{"count":10,"date":"2016-11-23"},{"count":13,"date":"2016-11-24"},{"count":13,"date":"2016-11-25"},{"count":15,"date":"2016-11-26"},{"count":6,"date":"2016-11-27"},{"count":10,"date":"2016-11-28"},{"count":9,"date":"2016-11-29"},{"count":11,"date":"2016-11-30"},{"count":12,"date":"2016-12-01"},{"count":13,"date":"2016-12-02"}],"MODEL3(4G\/64G)":[{"count":6,"date":"2016-11-02"},{"count":4,"date":"2016-11-03"},{"count":5,"date":"2016-11-04"},{"count":9,"date":"2016-11-05"},{"count":5,"date":"2016-11-06"},{"count":3,"date":"2016-11-07"},{"count":2,"date":"2016-11-08"},{"count":5,"date":"2016-11-09"},{"count":5,"date":"2016-11-10"},{"count":3,"date":"2016-11-11"},{"count":1,"date":"2016-11-12"},{"count":5,"date":"2016-11-13"},{"count":1,"date":"2016-11-14"},{"count":3,"date":"2016-11-15"},{"count":3,"date":"2016-11-16"},{"count":3,"date":"2016-11-17"},{"count":2,"date":"2016-11-18"},{"count":2,"date":"2016-11-19"},{"count":3,"date":"2016-11-20"},{"count":1,"date":"2016-11-21"},{"count":2,"date":"2016-11-22"},{"count":3,"date":"2016-11-23"},{"count":3,"date":"2016-11-24"},{"count":1,"date":"2016-11-25"},{"count":2,"date":"2016-11-26"},{"count":5,"date":"2016-11-27"},{"count":3,"date":"2016-11-29"},{"count":4,"date":"2016-11-30"},{"count":4,"date":"2016-12-01"},{"count":2,"date":"2016-12-02"}],"MODEL4(6G\/64G)":[{"count":1,"date":"2016-11-18"},{"count":1,"date":"2016-11-19"},{"count":1,"date":"2016-11-20"},{"count":1,"date":"2016-11-27"},{"count":1,"date":"2016-11-30"}],"MODEL2(2G\/32G)":[{"count":1,"date":"2016-11-26"}],"MODEL1(4G\/64G)":[{"count":1,"date":"2016-11-26"}],"MODEL4(6G\/256G)":[{"count":1,"date":"2016-12-02"}]},"groupByDistResults":[],"groupByBranchResults":[],"start_time":"2016-11-02","end_time":"2016-12-02"}';
    echo htmlspecialchars($json);
    //echo $cnt;
?>
