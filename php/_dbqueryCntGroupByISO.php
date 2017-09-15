<?php
    ini_set("max_execution_time", 0);
    $DIMENSION_COUNTRY = 'dimension_country';
    $DIMENSION_L1 = 'dimension_l1';
    $DIMENSION_L2 = 'dimension_l2';
    $DIMENSION_BRANCH = 'dimension_branch';
//    require_once("DBconfig.php");
//    require_once("DBclass.php");
//    require_once("function.php");
//    $results = array();
//    $db = new DB();
    

//    $now = new DateTime(null,new DateTimeZone('Asia/Taipei'));
//    echo "<br>-----------<br>".$now->format('Y-m-d H:i:s')."<br>-----------<br>";
/*
$color = '["all"]';
    $cpu = '["all"]';
    $rearCamera = '["all"]';
    $frontCamera = '["all"]';
    $dataset = 'activation';
    $from = "2016-11-02";
    $to = "2016-12-02";    
    $iso ='["IND"]';
    $data = '[{"model":"ZENFONE","devices":"ZENFONE","product":"ZENFONE","datatype":"product"}]';
    $distBranch = '[]';
    $onlineDist = '[]';
    $permission = '{}';
    $dimension = $DIMENSION_L1;
*/
//
//    $color = $_POST['color'];
//    $cpu = $_POST['cpu'];
//    $rearCamera = $_POST['rearCamera'];
//    $frontCamera = $_POST['frontCamera'];
//    $dataset = $_POST['dataset'];
//    $from = $_POST['from'];
//    $to = $_POST['to'];
//    $data = $_POST['data'];
//    $iso = $_POST['iso'];
//    $distBranch = $_POST['distBranch'];
//    $onlineDist = $_POST['onlineDist'];
//    $permission = $_POST['permission'];
    $dimension = $_POST['dimension'];
/*
    $countryArray = array();


    if($data!="[]"){
        $isoObj = json_decode($iso);
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
                $sqlLevel = getBranchLocLevelSql($isoObj[0]);

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

		$str_in='';
        
        $sqlDeviceIn = getAllTargetPartNoSql($dataObj);
        $db->query($sqlDeviceIn);
        while($row = $db->fetch_array()){
            $str_in.="('".$row['product_id']."'),";
        }
        $str_in = substr($str_in,0,-1);
        
        $declareQuery = "set nocount on;"
            ."DECLARE @str_in table (id varchar(50) primary key)insert into @str_in (id) values $str_in ";

        switch($dimension){
            case $DIMENSION_L1:
            case $DIMENSION_L2:
                $fromTableStr='';

                for($i=0;$i<count($isoObj);++$i){

                    if(!$isFullPermission){
                        $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                        if(!$result['queryable']) continue;
                    }

                    $tmpfromTableStr="SELECT map_id,count,device_model.model_name model_name"
                                ." FROM "
                                .($isColorAll ? "" : "$colorMappingTable A2,")
                                .($isCpuAll ? "" : "$cpuMappingTable A3,")
                                .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                                .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                                .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                                ."$isoObj[$i] A1,"
                                ."$deviceTable device_model"

                                ." WHERE "
                                ."date BETWEEN '".$from."' AND '".$to."'"
                                ." AND A1.device = device_model.device_name"
                                .($isAll?"":" AND A1.product_id IN(select * from @str_in)")
                                .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                                .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                                .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                                .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                                .($isDistBranch ? " AND $distBranchStr " : "")
                                .($isOnlineDist ? " AND $onlineDistStr " : "")
                                .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");

                    if(strlen($fromTableStr)==0){
                        $fromTableStr .= $tmpfromTableStr;
                    }
                    else{
                        $fromTableStr.=(" UNION ALL ".$tmpfromTableStr);
                    }
                }
                $fromTableStr ="(".$fromTableStr.")foo";
                //echo $fromTableStr."<br>";

                $queryStr = $declareQuery."SELECT map_id as name,SUM(count) AS count,model_name FROM ".$fromTableStr." GROUP BY map_id,model_name ORDER BY count DESC;";
//                echo $queryStr."<br><br><br>";

                $db->query($queryStr);
                while($row = $db->fetch_array())
                {
                    $countryArray[$row['name']]['models'][$row['model_name']] = $row['count'];
                    if (empty($countryArray[$row['name']]['count'])) {
                        $countryArray[$row['name']]['count'] = $row['count'];
                    } else {
                        $countryArray[$row['name']]['count'] += $row['count'];
                    }
                }

                foreach($countryArray as $name => $countryData) {
                    arsort($countryData['models']);
                    $results[] = array(
                            'name' => ($name),
                            'cnt' => ($countryData['count']),
                            'models' => ($countryData['models'])
                        );
                }
            break;
                
            case $DIMENSION_COUNTRY:
                $fromTableStr='';

                for($i=0;$i<count($isoObj);++$i){

                    if(!$isFullPermission){
                        $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                        if(!$result['queryable']) continue;
                    }

                    $tmpfromTableStr="SELECT '$isoObj[$i]' as name,count,device_model.model_name model_name"
                                ." FROM "
                                .($isColorAll ? "" : "$colorMappingTable A2,")
                                .($isCpuAll ? "" : "$cpuMappingTable A3,")
                                .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                                .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                                .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                                ."$isoObj[$i] A1,"
                                ."$deviceTable device_model"

                                ." WHERE "
                                ."date BETWEEN '".$from."' AND '".$to."'"
                                ." AND A1.device = device_model.device_name"
                                .($isAll?"":" AND A1.product_id IN(select * from @str_in)")
                                .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                                .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                                .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                                .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                                .($isDistBranch ? " AND $distBranchStr " : "")
                                .($isOnlineDist ? " AND $onlineDistStr " : "")
                                .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");

                    if(strlen($fromTableStr)==0){
                        $fromTableStr .= $tmpfromTableStr;
                    }
                    else{
                        $fromTableStr.=(" UNION ALL ".$tmpfromTableStr);
                    }
                }
                $fromTableStr ="(".$fromTableStr.")foo";
                //echo $fromTableStr."<br>";

                $queryStr = $declareQuery."SELECT name,SUM(count) AS count,model_name FROM ".$fromTableStr." GROUP BY name,model_name ORDER BY count DESC;";
//                echo $queryStr."<br><br><br>";

                $db->query($queryStr);
                while($row = $db->fetch_array())
                {
                    $countryArray[$row['name']]['models'][$row['model_name']] = $row['count'];
                    if (empty($countryArray[$row['name']]['count'])) {
                        $countryArray[$row['name']]['count'] = $row['count'];
                    } else {
                        $countryArray[$row['name']]['count'] += $row['count'];
                    }
                }

                foreach($countryArray as $name => $countryData) {
                    arsort($countryData['models']);
                    $results[] = array(
                            'name' => ($name),
                            'cnt' => ($countryData['count']),
                            'models' => ($countryData['models'])
                        );
                }
                break;
                
            case $DIMENSION_BRANCH:
                if($maplevel != 0){
                    $fromTableStr='';

                    for($i=0;$i<count($isoObj);++$i){

                        if(!$isFullPermission){
                            $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                            if(!$result['queryable']) continue;
                        }
                        
//                        if(!in_array($isoObj[$i],$branchSupportIISO))
//                            continue;

                        $tmpfromTableStr="SELECT (SELECT branchName FROM $regionTam where mapid = map_id)name,count,device_model.model_name model_name"
                                    ." FROM "
                                    .($isColorAll ? "" : "$colorMappingTable A2,")
                                    .($isCpuAll ? "" : "$cpuMappingTable A3,")
                                    .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                                    .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                                    ."$isoObj[$i] A1,"
                                    ."$deviceTable device_model"

                                    ." WHERE "
                                    ."date BETWEEN '".$from."' AND '".$to."'"
                                    ." AND A1.device = device_model.device_name"
                                    .($isAll?"":" AND A1.product_id IN(select * from @str_in)")
                                    .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                                    .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                                    .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                                    .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                                    .($isDistBranch ? " AND $distBranchStr " : "")
                                    .($isOnlineDist ? " AND $onlineDistStr " : "")
                                    .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");

                        if(strlen($fromTableStr)==0){
                            $fromTableStr .= $tmpfromTableStr;
                        }
                        else{
                            $fromTableStr.=(" UNION ALL ".$tmpfromTableStr);
                        }
                    }
                    $fromTableStr ="(".$fromTableStr.")foo";
                    //echo $fromTableStr."<br>";

                    $queryStr = $declareQuery."SELECT name,SUM(count) AS count,model_name FROM ".$fromTableStr." GROUP BY name,model_name ORDER BY count DESC;";
    //                echo $queryStr."<br><br><br>";

                    $db->query($queryStr);
                    while($row = $db->fetch_array())
                    {
                        $countryArray[$row['name']]['models'][$row['model_name']] = $row['count'];
                        if (empty($countryArray[$row['name']]['count'])) {
                            $countryArray[$row['name']]['count'] = $row['count'];
                        } else {
                            $countryArray[$row['name']]['count'] += $row['count'];
                        }
                    }
                }

                foreach($countryArray as $name => $countryData) {
                    arsort($countryData['models']);
                    $finalname = ($name==""?"NONE":$name);
                    $results[] = array(
                            
                            'name' => mb_convert_case($finalname, MB_CASE_UPPER, "UTF-8"),
                            'cnt' => ($countryData['count']),
                            'models' => ($countryData['models'])
                        );
                }
                break;
        }
    }
    $json = json_encode($results);
*/
//    writeToFile($json);

    switch($dimension){
        case $DIMENSION_L2:
            $json =  '[{"name":101461,"cnt":379,"models":{"MODEL1":242,"MODEL2":88,"MODEL3":48,"MODEL4":1}},{"name":100695,"cnt":261,"models":{"MODEL1":149,"MODEL2":58,"MODEL3":53,"MODEL5":1}},{"name":101287,"cnt":122,"models":{"MODEL1":76,"MODEL2":27,"MODEL3":18,"MODEL4":1}},{"name":101223,"cnt":110,"models":{"MODEL1":66,"MODEL2":23,"MODEL3":21}},{"name":101365,"cnt":77,"models":{"MODEL1":50,"MODEL2":16,"MODEL3":11}},{"name":100868,"cnt":76,"models":{"MODEL1":48,"MODEL2":17,"MODEL3":11}},{"name":101792,"cnt":84,"models":{"MODEL1":48,"MODEL2":21,"MODEL3":15}},{"name":102174,"cnt":66,"models":{"MODEL1":48,"MODEL3":13,"MODEL2":5}},{"name":100680,"cnt":68,"models":{"MODEL1":47,"MODEL2":15,"MODEL3":6}},{"name":100911,"cnt":74,"models":{"MODEL1":42,"MODEL2":23,"MODEL3":9}},{"name":100307,"cnt":53,"models":{"MODEL1":29,"MODEL3":14,"MODEL2":10}},{"name":100208,"cnt":43,"models":{"MODEL1":27,"MODEL2":11,"MODEL3":5}},{"name":102010,"cnt":62,"models":{"MODEL1":27,"MODEL2":22,"MODEL3":10,"MODEL4":3}},{"name":100161,"cnt":50,"models":{"MODEL1":26,"MODEL2":15,"MODEL3":9}},{"name":100229,"cnt":42,"models":{"MODEL1":25,"MODEL2":16,"MODEL3":1}},{"name":100812,"cnt":47,"models":{"MODEL1":24,"MODEL2":13,"MODEL3":10}},{"name":101229,"cnt":35,"models":{"MODEL1":23,"MODEL2":6,"MODEL3":6}},{"name":101256,"cnt":32,"models":{"MODEL1":22,"MODEL3":7,"MODEL2":3}},{"name":101430,"cnt":25,"models":{"MODEL1":21,"MODEL3":3,"MODEL2":1}},{"name":100894,"cnt":38,"models":{"MODEL1":21,"MODEL2":12,"MODEL3":5}},{"name":102117,"cnt":32,"models":{"MODEL1":21,"MODEL2":5,"MODEL3":4,"MODEL4":2}},{"name":102247,"cnt":31,"models":{"MODEL1":21,"MODEL3":5,"MODEL2":5}},{"name":101961,"cnt":34,"models":{"MODEL1":21,"MODEL2":7,"MODEL3":4,"MODEL4":1,"MODEL5":1}},{"name":100534,"cnt":35,"models":{"MODEL1":21,"MODEL3":7,"MODEL2":6,"MODEL4":1}},{"name":100915,"cnt":27,"models":{"MODEL1":20,"MODEL3":4,"MODEL2":3}},{"name":100889,"cnt":31,"models":{"MODEL1":19,"MODEL2":8,"MODEL3":3,"MODEL5":1}},{"name":100276,"cnt":31,"models":{"MODEL1":19,"MODEL3":7,"MODEL2":5}},{"name":100302,"cnt":30,"models":{"MODEL1":18,"MODEL3":7,"MODEL2":5}},{"name":100093,"cnt":32,"models":{"MODEL1":18,"MODEL2":11,"MODEL3":3}},{"name":100879,"cnt":21,"models":{"MODEL1":18,"MODEL3":3}},{"name":101222,"cnt":37,"models":{"MODEL1":18,"MODEL3":8,"MODEL2":7,"MODEL4":4}},{"name":101679,"cnt":30,"models":{"MODEL1":18,"MODEL2":8,"MODEL3":4}},{"name":102317,"cnt":39,"models":{"MODEL1":18,"MODEL2":14,"MODEL3":7}},{"name":101125,"cnt":26,"models":{"MODEL1":17,"MODEL3":6,"MODEL2":3}},{"name":100991,"cnt":25,"models":{"MODEL1":16,"MODEL2":5,"MODEL3":4}},{"name":100678,"cnt":26,"models":{"MODEL1":16,"MODEL2":5,"MODEL3":5}},{"name":102255,"cnt":24,"models":{"MODEL1":16,"MODEL3":5,"MODEL2":3}},{"name":102164,"cnt":23,"models":{"MODEL1":16,"MODEL3":5,"MODEL2":2}},{"name":100748,"cnt":30,"models":{"MODEL2":15,"MODEL1":15}},{"name":101299,"cnt":21,"models":{"MODEL1":15,"MODEL3":3,"MODEL2":3}},{"name":100016,"cnt":21,"models":{"MODEL1":15,"MODEL2":5,"MODEL3":1}},{"name":100295,"cnt":33,"models":{"MODEL1":15,"MODEL2":12,"MODEL3":6}},{"name":100150,"cnt":21,"models":{"MODEL1":15,"MODEL2":3,"MODEL3":3}},{"name":100511,"cnt":24,"models":{"MODEL1":14,"MODEL2":5,"MODEL3":4,"MODEL4":1}},{"name":101547,"cnt":31,"models":{"MODEL1":14,"MODEL2":12,"MODEL3":5}},{"name":101819,"cnt":34,"models":{"MODEL1":14,"MODEL2":11,"MODEL3":9}},{"name":102308,"cnt":26,"models":{"MODEL1":13,"MODEL2":8,"MODEL3":5}},{"name":102159,"cnt":14,"models":{"MODEL1":13,"MODEL3":1}},{"name":102078,"cnt":25,"models":{"MODEL1":13,"MODEL2":8,"MODEL3":4}},{"name":101440,"cnt":20,"models":{"MODEL1":13,"MODEL2":4,"MODEL3":3}},{"name":100529,"cnt":13,"models":{"MODEL1":12,"MODEL2":1}},{"name":101275,"cnt":18,"models":{"MODEL1":12,"MODEL3":3,"MODEL2":3}},{"name":100720,"cnt":14,"models":{"MODEL1":12,"MODEL2":2}},{"name":100901,"cnt":18,"models":{"MODEL1":12,"MODEL3":4,"MODEL2":2}},{"name":101797,"cnt":21,"models":{"MODEL1":12,"MODEL2":5,"MODEL3":4}},{"name":101909,"cnt":18,"models":{"MODEL1":11,"MODEL2":6,"MODEL3":1}},{"name":101450,"cnt":12,"models":{"MODEL1":11,"MODEL2":1}},{"name":101497,"cnt":17,"models":{"MODEL1":11,"MODEL2":4,"MODEL3":2}},{"name":100466,"cnt":18,"models":{"MODEL1":11,"MODEL3":5,"MODEL2":2}},{"name":101886,"cnt":22,"models":{"MODEL2":11,"MODEL1":9,"MODEL3":2}},{"name":100029,"cnt":19,"models":{"MODEL1":10,"MODEL2":7,"MODEL3":2}},{"name":101354,"cnt":11,"models":{"MODEL1":10,"MODEL2":1}},{"name":100698,"cnt":21,"models":{"MODEL1":10,"MODEL2":7,"MODEL3":4}},{"name":101835,"cnt":19,"models":{"MODEL1":10,"MODEL2":5,"MODEL3":4}},{"name":101814,"cnt":11,"models":{"MODEL1":9,"MODEL3":2}},{"name":101933,"cnt":16,"models":{"MODEL1":9,"MODEL3":4,"MODEL2":3}},{"name":102328,"cnt":25,"models":{"MODEL1":9,"MODEL2":8,"MODEL3":8}},{"name":100897,"cnt":16,"models":{"MODEL1":9,"MODEL3":4,"MODEL2":3}},{"name":100037,"cnt":14,"models":{"MODEL1":9,"MODEL2":4,"MODEL3":1}},{"name":100155,"cnt":10,"models":{"MODEL1":9,"MODEL3":1}},{"name":100483,"cnt":21,"models":{"MODEL2":9,"MODEL1":8,"MODEL3":4}},{"name":100202,"cnt":15,"models":{"MODEL1":8,"MODEL2":5,"MODEL3":2}},{"name":100047,"cnt":13,"models":{"MODEL1":8,"MODEL2":3,"MODEL3":2}},{"name":100844,"cnt":16,"models":{"MODEL1":8,"MODEL2":5,"MODEL3":3}},{"name":100861,"cnt":18,"models":{"MODEL1":8,"MODEL2":7,"MODEL3":3}},{"name":101413,"cnt":8,"models":{"MODEL1":8}},{"name":101945,"cnt":12,"models":{"MODEL1":8,"MODEL2":4}},{"name":101962,"cnt":13,"models":{"MODEL1":8,"MODEL2":3,"MODEL3":2}},{"name":102034,"cnt":12,"models":{"MODEL1":8,"MODEL2":4}},{"name":101923,"cnt":14,"models":{"MODEL1":7,"MODEL2":5,"MODEL3":2}},{"name":101862,"cnt":13,"models":{"MODEL1":7,"MODEL3":4,"MODEL2":2}},{"name":101873,"cnt":7,"models":{"MODEL1":7}},{"name":102296,"cnt":11,"models":{"MODEL1":7,"MODEL2":2,"MODEL3":2}},{"name":101562,"cnt":11,"models":{"MODEL1":7,"MODEL2":3,"MODEL3":1}},{"name":101187,"cnt":12,"models":{"MODEL1":7,"MODEL2":2,"MODEL3":2,"MODEL4":1}},{"name":100760,"cnt":14,"models":{"MODEL1":7,"MODEL3":4,"MODEL2":3}},{"name":100076,"cnt":7,"models":{"MODEL1":7}},{"name":100251,"cnt":9,"models":{"MODEL1":7,"MODEL2":2}},{"name":100172,"cnt":8,"models":{"MODEL1":7,"MODEL3":1}},{"name":100640,"cnt":11,"models":{"MODEL2":6,"MODEL1":4,"MODEL3":1}},{"name":101544,"cnt":14,"models":{"MODEL2":6,"MODEL1":6,"MODEL3":2}},{"name":101522,"cnt":13,"models":{"MODEL2":6,"MODEL1":6,"MODEL3":1}},{"name":100204,"cnt":10,"models":{"MODEL1":6,"MODEL2":3,"MODEL3":1}},{"name":100715,"cnt":8,"models":{"MODEL1":6,"MODEL2":2}},{"name":101094,"cnt":12,"models":{"MODEL1":6,"MODEL3":4,"MODEL2":2}},{"name":100951,"cnt":15,"models":{"MODEL1":6,"MODEL2":5,"MODEL3":3,"MODEL4":1}},{"name":102261,"cnt":7,"models":{"MODEL1":6,"MODEL3":1}},{"name":102272,"cnt":6,"models":{"MODEL1":6}},{"name":102283,"cnt":8,"models":{"MODEL1":6,"MODEL2":2}},{"name":101902,"cnt":11,"models":{"MODEL1":6,"MODEL2":5}},{"name":101940,"cnt":13,"models":{"MODEL1":5,"MODEL2":4,"MODEL3":4}},{"name":101846,"cnt":7,"models":{"MODEL1":5,"MODEL3":2}},{"name":101777,"cnt":7,"models":{"MODEL1":5,"MODEL2":2}},{"name":102033,"cnt":6,"models":{"MODEL1":5,"MODEL2":1}},{"name":101149,"cnt":6,"models":{"MODEL1":5,"MODEL2":1}},{"name":101328,"cnt":6,"models":{"MODEL1":5,"MODEL2":1}},{"name":101336,"cnt":7,"models":{"MODEL1":5,"MODEL2":2}},{"name":101387,"cnt":9,"models":{"MODEL1":5,"MODEL2":2,"MODEL3":2}},{"name":100875,"cnt":8,"models":{"MODEL1":5,"MODEL3":2,"MODEL2":1}},{"name":100691,"cnt":6,"models":{"MODEL1":5,"MODEL2":1}},{"name":100661,"cnt":12,"models":{"MODEL1":5,"MODEL2":5,"MODEL3":2}},{"name":100110,"cnt":7,"models":{"MODEL1":5,"MODEL2":1,"MODEL3":1}},{"name":100173,"cnt":9,"models":{"MODEL1":5,"MODEL3":4}},{"name":100171,"cnt":7,"models":{"MODEL1":5,"MODEL2":1,"MODEL3":1}},{"name":100412,"cnt":8,"models":{"MODEL1":5,"MODEL2":3}},{"name":101825,"cnt":10,"models":{"MODEL3":5,"MODEL2":3,"MODEL1":2}},{"name":101541,"cnt":8,"models":{"MODEL3":4,"MODEL1":3,"MODEL2":1}},{"name":100668,"cnt":7,"models":{"MODEL3":4,"MODEL1":3}},{"name":101381,"cnt":8,"models":{"MODEL2":4,"MODEL3":3,"MODEL1":1}},{"name":100262,"cnt":6,"models":{"MODEL1":4,"MODEL2":1,"MODEL3":1}},{"name":100546,"cnt":4,"models":{"MODEL1":4}},{"name":100579,"cnt":5,"models":{"MODEL1":4,"MODEL3":1}},{"name":100153,"cnt":5,"models":{"MODEL1":4,"MODEL3":1}},{"name":100244,"cnt":6,"models":{"MODEL1":4,"MODEL3":2}},{"name":102120,"cnt":6,"models":{"MODEL2":4,"MODEL3":1,"MODEL1":1}},{"name":102128,"cnt":5,"models":{"MODEL2":4,"MODEL1":1}},{"name":100522,"cnt":7,"models":{"MODEL1":4,"MODEL3":3}},{"name":100884,"cnt":6,"models":{"MODEL1":4,"MODEL2":2}},{"name":100834,"cnt":6,"models":{"MODEL1":4,"MODEL3":1,"MODEL2":1}},{"name":100906,"cnt":9,"models":{"MODEL1":4,"MODEL2":3,"MODEL3":2}},{"name":101112,"cnt":8,"models":{"MODEL1":4,"MODEL3":3,"MODEL2":1}},{"name":101524,"cnt":9,"models":{"MODEL1":4,"MODEL2":3,"MODEL3":2}},{"name":101721,"cnt":5,"models":{"MODEL1":4,"MODEL3":1}},{"name":101571,"cnt":5,"models":{"MODEL1":4,"MODEL3":1}},{"name":101579,"cnt":8,"models":{"MODEL1":4,"MODEL2":2,"MODEL3":2}},{"name":102298,"cnt":7,"models":{"MODEL1":4,"MODEL3":2,"MODEL2":1}},{"name":102017,"cnt":7,"models":{"MODEL1":4,"MODEL3":2,"MODEL2":1}},{"name":102259,"cnt":8,"models":{"MODEL1":4,"MODEL2":3,"MODEL3":1}},{"name":101800,"cnt":7,"models":{"MODEL1":4,"MODEL3":2,"MODEL2":1}},{"name":101850,"cnt":7,"models":{"MODEL1":4,"MODEL2":2,"MODEL3":1}},{"name":101951,"cnt":4,"models":{"MODEL1":3,"MODEL3":1}},{"name":101829,"cnt":5,"models":{"MODEL1":3,"MODEL3":1,"MODEL2":1}},{"name":101927,"cnt":8,"models":{"MODEL1":3,"MODEL3":3,"MODEL2":2}},{"name":102239,"cnt":3,"models":{"MODEL1":3}},{"name":102149,"cnt":4,"models":{"MODEL1":3,"MODEL3":1}},{"name":102169,"cnt":3,"models":{"MODEL1":3}},{"name":102106,"cnt":4,"models":{"MODEL1":3,"MODEL3":1}},{"name":102083,"cnt":3,"models":{"MODEL1":3}},{"name":102302,"cnt":3,"models":{"MODEL1":3}},{"name":102292,"cnt":3,"models":{"MODEL1":3}},{"name":102325,"cnt":6,"models":{"MODEL2":3,"MODEL1":3}},{"name":101554,"cnt":4,"models":{"MODEL1":3,"MODEL2":1}},{"name":101555,"cnt":4,"models":{"MODEL1":3,"MODEL2":1}},{"name":101710,"cnt":7,"models":{"MODEL1":3,"MODEL3":3,"MODEL2":1}},{"name":101475,"cnt":6,"models":{"MODEL1":3,"MODEL2":2,"MODEL3":1}},{"name":101433,"cnt":3,"models":{"MODEL1":3}},{"name":101452,"cnt":3,"models":{"MODEL1":3}},{"name":101033,"cnt":3,"models":{"MODEL1":3}},{"name":100920,"cnt":4,"models":{"MODEL1":3,"MODEL3":1}},{"name":100824,"cnt":4,"models":{"MODEL1":3,"MODEL3":1}},{"name":100609,"cnt":3,"models":{"MODEL1":3}},{"name":100657,"cnt":5,"models":{"MODEL1":3,"MODEL3":2}},{"name":100778,"cnt":3,"models":{"MODEL1":3}},{"name":100708,"cnt":5,"models":{"MODEL1":3,"MODEL3":1,"MODEL2":1}},{"name":100753,"cnt":5,"models":{"MODEL1":3,"MODEL3":1,"MODEL2":1}},{"name":100729,"cnt":3,"models":{"MODEL1":3}},{"name":101831,"cnt":4,"models":{"MODEL2":3,"MODEL3":1}},{"name":101841,"cnt":4,"models":{"MODEL2":3,"MODEL1":1}},{"name":101914,"cnt":7,"models":{"MODEL2":3,"MODEL1":2,"MODEL3":2}},{"name":100118,"cnt":5,"models":{"MODEL1":3,"MODEL2":2}},{"name":100058,"cnt":3,"models":{"MODEL1":3}},{"name":100192,"cnt":3,"models":{"MODEL1":3}},{"name":100212,"cnt":3,"models":{"MODEL1":3}},{"name":100181,"cnt":4,"models":{"MODEL1":3,"MODEL3":1}},{"name":100187,"cnt":5,"models":{"MODEL1":3,"MODEL2":2}},{"name":100152,"cnt":4,"models":{"MODEL1":3,"MODEL2":1}},{"name":100160,"cnt":7,"models":{"MODEL1":3,"MODEL3":2,"MODEL2":2}},{"name":100169,"cnt":4,"models":{"MODEL1":3,"MODEL3":1}},{"name":100536,"cnt":5,"models":{"MODEL1":3,"MODEL2":2}},{"name":100278,"cnt":4,"models":{"MODEL1":3,"MODEL2":1}},{"name":100325,"cnt":5,"models":{"MODEL1":3,"MODEL2":1,"MODEL3":1}},{"name":101538,"cnt":4,"models":{"MODEL2":3,"MODEL1":1}},{"name":101157,"cnt":6,"models":{"MODEL2":3,"MODEL1":2,"MODEL3":1}},{"name":100385,"cnt":6,"models":{"MODEL2":3,"MODEL1":2,"MODEL3":1}},{"name":100828,"cnt":6,"models":{"MODEL3":3,"MODEL2":2,"MODEL1":1}},{"name":101726,"cnt":2,"models":{"MODEL3":2}},{"name":101884,"cnt":3,"models":{"MODEL3":2,"MODEL2":1}},{"name":101899,"cnt":3,"models":{"MODEL3":2,"MODEL1":1}},{"name":102322,"cnt":4,"models":{"MODEL1":2,"MODEL3":2}},{"name":102288,"cnt":4,"models":{"MODEL3":2,"MODEL2":1,"MODEL1":1}},{"name":101462,"cnt":3,"models":{"MODEL3":2,"MODEL1":1}},{"name":100683,"cnt":5,"models":{"MODEL3":2,"MODEL2":2,"MODEL1":1}},{"name":100555,"cnt":5,"models":{"MODEL2":2,"MODEL1":2,"MODEL3":1}},{"name":100652,"cnt":2,"models":{"MODEL2":2}},{"name":100342,"cnt":3,"models":{"MODEL2":2,"MODEL1":1}},{"name":100350,"cnt":3,"models":{"MODEL2":2,"MODEL3":1}},{"name":100379,"cnt":3,"models":{"MODEL2":2,"MODEL1":1}},{"name":100312,"cnt":2,"models":{"MODEL2":2}},{"name":100196,"cnt":2,"models":{"MODEL2":2}},{"name":100006,"cnt":5,"models":{"MODEL2":2,"MODEL1":2,"MODEL3":1}},{"name":100596,"cnt":2,"models":{"MODEL1":2}},{"name":100162,"cnt":3,"models":{"MODEL1":2,"MODEL2":1}},{"name":100163,"cnt":2,"models":{"MODEL1":2}},{"name":100228,"cnt":2,"models":{"MODEL1":2}},{"name":100085,"cnt":2,"models":{"MODEL1":2}},{"name":102191,"cnt":4,"models":{"MODEL2":2,"MODEL3":1,"MODEL1":1}},{"name":102314,"cnt":4,"models":{"MODEL2":2,"MODEL4":1,"MODEL1":1}},{"name":101771,"cnt":3,"models":{"MODEL2":2,"MODEL1":1}},{"name":101969,"cnt":4,"models":{"MODEL1":2,"MODEL2":2}},{"name":100786,"cnt":3,"models":{"MODEL1":2,"MODEL3":1}},{"name":100796,"cnt":3,"models":{"MODEL1":2,"MODEL2":1}},{"name":100771,"cnt":3,"models":{"MODEL1":2,"MODEL3":1}},{"name":100665,"cnt":2,"models":{"MODEL1":2}},{"name":100626,"cnt":3,"models":{"MODEL1":2,"MODEL2":1}},{"name":100819,"cnt":3,"models":{"MODEL1":2,"MODEL3":1}},{"name":100882,"cnt":2,"models":{"MODEL1":2}},{"name":100936,"cnt":2,"models":{"MODEL1":2}},{"name":100944,"cnt":2,"models":{"MODEL1":2}},{"name":101106,"cnt":2,"models":{"MODEL1":2}},{"name":100995,"cnt":2,"models":{"MODEL1":2}},{"name":101437,"cnt":2,"models":{"MODEL1":2}},{"name":101406,"cnt":2,"models":{"MODEL1":2}},{"name":101075,"cnt":2,"models":{"MODEL1":2}},{"name":101141,"cnt":2,"models":{"MODEL1":2}},{"name":101205,"cnt":3,"models":{"MODEL1":2,"MODEL2":1}},{"name":101217,"cnt":3,"models":{"MODEL1":2,"MODEL3":1}},{"name":101483,"cnt":4,"models":{"MODEL1":2,"MODEL3":1,"MODEL2":1}},{"name":101527,"cnt":4,"models":{"MODEL1":2,"MODEL3":1,"MODEL2":1}},{"name":101766,"cnt":2,"models":{"MODEL1":2}},{"name":101567,"cnt":3,"models":{"MODEL1":2,"MODEL3":1}},{"name":100563,"cnt":2,"models":{"MODEL3":2}},{"name":102280,"cnt":2,"models":{"MODEL1":2}},{"name":100167,"cnt":3,"models":{"MODEL3":2,"MODEL1":1}},{"name":102095,"cnt":2,"models":{"MODEL1":2}},{"name":102099,"cnt":2,"models":{"MODEL1":2}},{"name":102133,"cnt":2,"models":{"MODEL1":2}},{"name":102194,"cnt":3,"models":{"MODEL1":2,"MODEL3":1}},{"name":102241,"cnt":4,"models":{"MODEL1":2,"MODEL3":1,"MODEL2":1}},{"name":102217,"cnt":2,"models":{"MODEL1":2}},{"name":101976,"cnt":2,"models":{"MODEL1":2}},{"name":101856,"cnt":2,"models":{"MODEL1":2}},{"name":101808,"cnt":2,"models":{"MODEL3":1,"MODEL1":1}},{"name":101849,"cnt":2,"models":{"MODEL3":1,"MODEL1":1}},{"name":101988,"cnt":3,"models":{"MODEL3":1,"MODEL2":1,"MODEL1":1}},{"name":102224,"cnt":1,"models":{"MODEL1":1}},{"name":102235,"cnt":1,"models":{"MODEL1":1}},{"name":102243,"cnt":1,"models":{"MODEL1":1}},{"name":102248,"cnt":1,"models":{"MODEL1":1}},{"name":102196,"cnt":1,"models":{"MODEL1":1}},{"name":102208,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":102135,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":102039,"cnt":1,"models":{"MODEL1":1}},{"name":102044,"cnt":1,"models":{"MODEL1":1}},{"name":102049,"cnt":1,"models":{"MODEL1":1}},{"name":102064,"cnt":1,"models":{"MODEL1":1}},{"name":100154,"cnt":2,"models":{"MODEL1":1,"MODEL3":1}},{"name":100158,"cnt":1,"models":{"MODEL3":1}},{"name":102309,"cnt":1,"models":{"MODEL1":1}},{"name":99996,"cnt":3,"models":{"MODEL2":1,"MODEL1":1,"MODEL3":1}},{"name":100217,"cnt":1,"models":{"MODEL3":1}},{"name":100223,"cnt":1,"models":{"MODEL3":1}},{"name":100497,"cnt":1,"models":{"MODEL3":1}},{"name":100450,"cnt":1,"models":{"MODEL3":1}},{"name":100455,"cnt":2,"models":{"MODEL1":1,"MODEL3":1}},{"name":100566,"cnt":2,"models":{"MODEL1":1,"MODEL3":1}},{"name":100679,"cnt":2,"models":{"MODEL1":1,"MODEL3":1}},{"name":100518,"cnt":2,"models":{"MODEL1":1,"MODEL3":1}},{"name":100548,"cnt":1,"models":{"MODEL3":1}},{"name":100556,"cnt":2,"models":{"MODEL1":1,"MODEL3":1}},{"name":101616,"cnt":1,"models":{"MODEL1":1}},{"name":101627,"cnt":3,"models":{"MODEL3":1,"MODEL2":1,"MODEL1":1}},{"name":101644,"cnt":2,"models":{"MODEL3":1,"MODEL1":1}},{"name":101734,"cnt":1,"models":{"MODEL1":1}},{"name":101761,"cnt":1,"models":{"MODEL1":1}},{"name":101699,"cnt":1,"models":{"MODEL1":1}},{"name":101705,"cnt":2,"models":{"MODEL3":1,"MODEL1":1}},{"name":101531,"cnt":1,"models":{"MODEL1":1}},{"name":101553,"cnt":1,"models":{"MODEL1":1}},{"name":101487,"cnt":2,"models":{"MODEL3":1,"MODEL1":1}},{"name":101479,"cnt":1,"models":{"MODEL1":1}},{"name":101502,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":101509,"cnt":1,"models":{"MODEL1":1}},{"name":101513,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":101517,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":101521,"cnt":1,"models":{"MODEL1":1}},{"name":101347,"cnt":3,"models":{"MODEL3":1,"MODEL2":1,"MODEL1":1}},{"name":101319,"cnt":1,"models":{"MODEL1":1}},{"name":101411,"cnt":1,"models":{"MODEL1":1}},{"name":101373,"cnt":1,"models":{"MODEL1":1}},{"name":101454,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":101457,"cnt":1,"models":{"MODEL1":1}},{"name":101445,"cnt":1,"models":{"MODEL1":1}},{"name":101000,"cnt":1,"models":{"MODEL1":1}},{"name":101041,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":101064,"cnt":1,"models":{"MODEL1":1}},{"name":100954,"cnt":1,"models":{"MODEL1":1}},{"name":100966,"cnt":1,"models":{"MODEL1":1}},{"name":100971,"cnt":1,"models":{"MODEL1":1}},{"name":100982,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":100985,"cnt":2,"models":{"MODEL3":1,"MODEL1":1}},{"name":100847,"cnt":3,"models":{"MODEL3":1,"MODEL2":1,"MODEL1":1}},{"name":100641,"cnt":1,"models":{"MODEL1":1}},{"name":100667,"cnt":1,"models":{"MODEL1":1}},{"name":100660,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":100670,"cnt":1,"models":{"MODEL1":1}},{"name":100676,"cnt":1,"models":{"MODEL1":1}},{"name":100766,"cnt":1,"models":{"MODEL1":1}},{"name":100801,"cnt":1,"models":{"MODEL1":1}},{"name":100793,"cnt":1,"models":{"MODEL1":1}},{"name":100735,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":100725,"cnt":1,"models":{"MODEL1":1}},{"name":102071,"cnt":1,"models":{"MODEL2":1}},{"name":101880,"cnt":2,"models":{"MODEL3":1,"MODEL2":1}},{"name":102089,"cnt":1,"models":{"MODEL2":1}},{"name":102212,"cnt":2,"models":{"MODEL3":1,"MODEL2":1}},{"name":102281,"cnt":1,"models":{"MODEL2":1}},{"name":100149,"cnt":1,"models":{"MODEL1":1}},{"name":102327,"cnt":1,"models":{"MODEL2":1}},{"name":100252,"cnt":1,"models":{"MODEL1":1}},{"name":100191,"cnt":1,"models":{"MODEL1":1}},{"name":100183,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":100214,"cnt":1,"models":{"MODEL1":1}},{"name":100220,"cnt":1,"models":{"MODEL1":1}},{"name":100170,"cnt":1,"models":{"MODEL1":1}},{"name":100156,"cnt":1,"models":{"MODEL1":1}},{"name":100159,"cnt":1,"models":{"MODEL1":1}},{"name":100178,"cnt":1,"models":{"MODEL1":1}},{"name":100575,"cnt":1,"models":{"MODEL1":1}},{"name":100602,"cnt":1,"models":{"MODEL1":1}},{"name":100590,"cnt":1,"models":{"MODEL1":1}},{"name":100541,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":100530,"cnt":1,"models":{"MODEL1":1}},{"name":100505,"cnt":1,"models":{"MODEL1":1}},{"name":100510,"cnt":1,"models":{"MODEL1":1}},{"name":100478,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":100425,"cnt":2,"models":{"MODEL2":1,"MODEL1":1}},{"name":100431,"cnt":1,"models":{"MODEL1":1}},{"name":100443,"cnt":1,"models":{"MODEL1":1}},{"name":100446,"cnt":1,"models":{"MODEL1":1}},{"name":100463,"cnt":1,"models":{"MODEL1":1}},{"name":100329,"cnt":1,"models":{"MODEL1":1}},{"name":100333,"cnt":1,"models":{"MODEL1":1}},{"name":100371,"cnt":1,"models":{"MODEL1":1}},{"name":100285,"cnt":1,"models":{"MODEL1":1}},{"name":101469,"cnt":1,"models":{"MODEL2":1}},{"name":101536,"cnt":2,"models":{"MODEL3":1,"MODEL2":1}},{"name":101672,"cnt":1,"models":{"MODEL2":1}},{"name":101749,"cnt":1,"models":{"MODEL2":1}},{"name":101488,"cnt":1,"models":{"MODEL2":1}},{"name":101560,"cnt":1,"models":{"MODEL2":1}},{"name":101167,"cnt":1,"models":{"MODEL2":1}},{"name":100293,"cnt":1,"models":{"MODEL2":1}},{"name":100653,"cnt":1,"models":{"MODEL2":1}},{"name":100557,"cnt":1,"models":{"MODEL2":1}},{"name":100636,"cnt":1,"models":{"MODEL2":1}},{"name":100742,"cnt":2,"models":{"MODEL3":1,"MODEL2":1}},{"name":100684,"cnt":1,"models":{"MODEL2":1}},{"name":100685,"cnt":1,"models":{"MODEL2":1}},{"name":101072,"cnt":1,"models":{"MODEL3":1}},{"name":101086,"cnt":1,"models":{"MODEL3":1}},{"name":101594,"cnt":1,"models":{"MODEL3":1}},{"name":101486,"cnt":1,"models":{"MODEL3":1}},{"name":102225,"cnt":1,"models":{"MODEL3":1}},{"name":101867,"cnt":1,"models":{"MODEL3":1}},{"name":101996,"cnt":1,"models":{"MODEL3":1}},{"name":101741,"cnt":1,"models":{"MODEL3":1}},{"name":101790,"cnt":1,"models":{"MODEL3":1}}]';
            break;
            
            case $DIMENSION_L1:
            $json = '[{"name":101094,"cnt":579,"models":{"MODEL1":360,"MODEL2":113,"MODEL3":100,"MODEL4":6}},{"name":100685,"cnt":473,"models":{"MODEL1":270,"MODEL2":116,"MODEL3":86,"MODEL5":1}},{"name":101461,"cnt":379,"models":{"MODEL1":242,"MODEL2":88,"MODEL3":48,"MODEL4":1}},{"name":100861,"cnt":348,"models":{"MODEL1":215,"MODEL2":81,"MODEL3":51,"MODEL5":1}},{"name":101790,"cnt":370,"models":{"MODEL1":191,"MODEL2":102,"MODEL3":77}},{"name":102034,"cnt":267,"models":{"MODEL1":180,"MODEL2":45,"MODEL3":40,"MODEL4":2}},{"name":100145,"cnt":140,"models":{"MODEL1":90,"MODEL3":27,"MODEL2":23}},{"name":100307,"cnt":165,"models":{"MODEL1":87,"MODEL2":43,"MODEL3":34,"MODEL4":1}},{"name":99996,"cnt":131,"models":{"MODEL1":83,"MODEL2":36,"MODEL3":12}},{"name":100657,"cnt":133,"models":{"MODEL1":82,"MODEL2":29,"MODEL3":22}},{"name":102280,"cnt":145,"models":{"MODEL1":73,"MODEL2":43,"MODEL3":28,"MODEL4":1}},{"name":101951,"cnt":130,"models":{"MODEL1":68,"MODEL2":36,"MODEL3":21,"MODEL4":4,"MODEL5":1}},{"name":100176,"cnt":95,"models":{"MODEL1":60,"MODEL2":24,"MODEL3":11}},{"name":100522,"cnt":80,"models":{"MODEL1":50,"MODEL3":16,"MODEL2":13,"MODEL4":1}},{"name":101571,"cnt":84,"models":{"MODEL1":48,"MODEL2":18,"MODEL3":18}},{"name":101524,"cnt":97,"models":{"MODEL1":47,"MODEL2":33,"MODEL3":17}},{"name":100928,"cnt":64,"models":{"MODEL1":41,"MODEL2":12,"MODEL3":10,"MODEL4":1}},{"name":100230,"cnt":58,"models":{"MODEL1":39,"MODEL3":10,"MODEL2":9}},{"name":102248,"cnt":46,"models":{"MODEL1":33,"MODEL3":7,"MODEL2":6}},{"name":100295,"cnt":63,"models":{"MODEL1":33,"MODEL2":17,"MODEL3":13}},{"name":101429,"cnt":30,"models":{"MODEL1":26,"MODEL3":3,"MODEL2":1}},{"name":100229,"cnt":42,"models":{"MODEL1":25,"MODEL2":16,"MODEL3":1}},{"name":101462,"cnt":43,"models":{"MODEL1":23,"MODEL2":12,"MODEL3":8}},{"name":101450,"cnt":18,"models":{"MODEL1":16,"MODEL2":2}},{"name":101440,"cnt":21,"models":{"MODEL1":14,"MODEL2":4,"MODEL3":3}},{"name":100567,"cnt":16,"models":{"MODEL1":14,"MODEL3":1,"MODEL2":1}},{"name":101401,"cnt":11,"models":{"MODEL1":11}},{"name":100633,"cnt":16,"models":{"MODEL2":10,"MODEL1":5,"MODEL3":1}},{"name":101520,"cnt":14,"models":{"MODEL1":7,"MODEL2":6,"MODEL3":1}},{"name":102023,"cnt":6,"models":{"MODEL1":5,"MODEL2":1}},{"name":100293,"cnt":1,"models":{"MODEL2":1}}]';
            break;
            
            case $DIMENSION_COUNTRY:
            $json = '[{"name":"IND","cnt":4065,"models":{"MODEL1":2438,"MODEL2":941,"MODEL3":666,"MODEL4":17,"MODEL5":3}}]';
            break;
            
            case $DIMENSION_BRANCH:
            $json = '[{"name":"DELHI","cnt":459,"models":{"MODEL1":292,"MODEL2":101,"MODEL3":64,"MODEL4":2}},{"name":"KARNATAKA","cnt":473,"models":{"MODEL1":270,"MODEL2":116,"MODEL3":86,"MODEL5":1}},{"name":"KERALA","cnt":349,"models":{"MODEL1":216,"MODEL2":81,"MODEL3":51,"MODEL5":1}},{"name":"UP_UTTARANCHAL","cnt":313,"models":{"MODEL1":213,"MODEL2":51,"MODEL3":47,"MODEL4":2}},{"name":"TAMIL_NADU","cnt":383,"models":{"MODEL1":197,"MODEL2":108,"MODEL3":78}},{"name":"PUNE","cnt":304,"models":{"MODEL1":189,"MODEL2":61,"MODEL3":52,"MODEL4":2}},{"name":"JOB","cnt":271,"models":{"MODEL1":165,"MODEL2":65,"MODEL3":41}},{"name":"NORTH_EAST","cnt":226,"models":{"MODEL1":162,"MODEL3":33,"MODEL2":31}},{"name":"ANDHRA_PRADESH","cnt":261,"models":{"MODEL1":151,"MODEL2":72,"MODEL3":33,"MODEL4":4,"MODEL5":1}},{"name":"MUMBAI","cnt":245,"models":{"MODEL1":149,"MODEL2":49,"MODEL3":43,"MODEL4":4}},{"name":"PUNJAB","cnt":171,"models":{"MODEL1":91,"MODEL2":60,"MODEL3":20}},{"name":"GUJARAT","cnt":166,"models":{"MODEL1":87,"MODEL2":44,"MODEL3":34,"MODEL4":1}},{"name":"NAGPUR_RAIPUR","cnt":132,"models":{"MODEL1":81,"MODEL2":26,"MODEL3":25}},{"name":"WEST_BENGAL","cnt":145,"models":{"MODEL1":73,"MODEL2":43,"MODEL3":28,"MODEL4":1}},{"name":"RAJASTHAN","cnt":84,"models":{"MODEL1":48,"MODEL2":18,"MODEL3":18}},{"name":"MADHYA_PRADESH","cnt":64,"models":{"MODEL1":41,"MODEL2":12,"MODEL3":10,"MODEL4":1}},{"name":"NONE","cnt":19,"models":{"MODEL1":13,"MODEL3":3,"MODEL2":3}}]';
            break;
    }

    echo $json;

//     $now = new DateTime(null,new DateTimeZone('Asia/Taipei'));
//     echo "<br>-----------<br>".$now->format('Y-m-d H:i:s')."<br>-----------<br>";

?>
