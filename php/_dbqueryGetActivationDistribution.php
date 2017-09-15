<?php
    ini_set("max_execution_time", 0);

//    require_once("DBconfig.php");
//    require_once("DBclass.php");
//    require_once("function.php");
//    $results = array();
//    $distributedByModel = array();
//    $distributedByDevice = array();
//    $distributedByRegion = array();
    
//    $db = new DB();

    $MODE_ACTIVATION_DISTRIBUTED_BY_MODEL = "activationDistributedByModel";
    $MODE_ACTIVATION_DISTRIBUTED_BY_DEVICE = "activationDistributedByDevice";
    $MODE_ACTIVATION_DISTRIBUTED_BY_REGION = "activationDistributedByRegion";

    $MODE_ACTIVATION_DISTRIBUTED_LEVEL_COUNTRY = "activationDistributedLevelCountry";
    $MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH = "activationDistributedLevelBranch";
    $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L1 = "activationDistributedLevelL1";
    $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L2 = "activationDistributedLevelL2";

//    $color = '["all"]';
//    $cpu = '["all"]';
//    $rearCamera = '["all"]';
//    $frontCamera = '["all"]';
//    $from = "2016-12-19";
//    $to = "2017-1-18";    
//    $iso ='["IND"]';
//    $data = '[{"model":"ZENFONE","devices":"ZENFONE","product":"ZENFONE","datatype":"product"}]';
//    $permission = '{"":["AK","AT","AZ"],"HKG":["AK","AT","AX","AZ"],"IND":["AK","AT","AX","AZ"],"IDN":["AK","AT","AX","AZ"],"JPN":["AK","AT","AX","AZ"],"MYS":["AK","AT","AX","AZ"],"PHL":["AK","AT","AX","AZ"],"SGP":["AK","AT","AX","AZ"],"THA":["AK","AT","AX","AZ"],"VNM":["AK","AT","AX","AZ"],"BGD":["AK","AT","AX","AZ"],"MMR":["AK","AT","AX","AZ"],"KOR":["AK","AT","AX","AZ"],"KHM":["AK","AT","AX","AZ"]}';
//    $permission = '{}';
//    $distributedBy = $MODE_ACTIVATION_DISTRIBUTED_BY_REGION;
//    $distributedLevel = $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L2;


//    $color = $_POST['color'];
//    $cpu = $_POST['cpu'];
//    $rearCamera = $_POST['rearCamera'];
//    $frontCamera = $_POST['frontCamera'];
//    $from = $_POST['from'];
//    $to = $_POST['to'];
//    $data = $_POST['data'];
//    $iso = $_POST['iso'];
//    $permission = $_POST['permission'];
    $distributedBy = $_POST['distributedBy'];
    $distributedLevel = $_POST['distributedLevel'];
/*
    if($data!="[]"){
        $isoObj = json_decode($iso);
        $dataObj = json_decode($data);
        $colorObj = json_decode($color);
        $cpuObj = json_decode($cpu);
        $rearCameraObj = json_decode($rearCamera);
        $frontCameraObj = json_decode($frontCamera);
        $permissionObj = json_decode($permission);

        $isFullPermission = (empty((array)$permissionObj));

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
    
        $db->connect_db($_DB['host'], $_DB['username'], $_DB['password']);
		$str_in='';
        
        $sqlDeviceIn = getAllTargetPartNoSql($dataObj);

        $db->query($sqlDeviceIn);
        while($row = $db->fetch_array()){
            $str_in.="'".$row['product_id']."',";
        }
        $str_in = substr($str_in,0,-1);
//        echo $str_in."<br>";
        switch($distributedBy){
            case $MODE_ACTIVATION_DISTRIBUTED_BY_MODEL:
            case $MODE_ACTIVATION_DISTRIBUTED_BY_DEVICE:
                
                if($distributedBy == $MODE_ACTIVATION_DISTRIBUTED_BY_MODEL)
                    $selectColumn = 'device_model.model_name';
                else if($distributedBy == $MODE_ACTIVATION_DISTRIBUTED_BY_DEVICE)
                    $selectColumn = 'part_device.model_description device';
                
                $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['activation']['dbnameRegionL1']);
                $fromTableStr='';
                $declareQuery = "set nocount on;DECLARE @result TABLE (name nvarchar(50),count int);INSERT INTO @result ";
                for($i=0;$i<count($isoObj);++$i){

                    if(!$isFullPermission){
                        $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                        if(!$result['queryable']) continue;
                    }

                    $tmpfromTableStr="SELECT $selectColumn,count"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$isoObj[$i] A1,"
                        ."$deviceTable device_model,"
                        ."$productDescriptionMapping part_device"

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        ." AND A1.product_id = part_device.product_id"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");

                    if(strlen($fromTableStr)==0){
                        $fromTableStr .= $tmpfromTableStr;
                    }
                    else{
                        $fromTableStr.=(" UNION ALL ".$tmpfromTableStr);
                    }
                }
                $declareQuery =$declareQuery . $fromTableStr;

                $queryStr = $declareQuery
                    ."SELECT name,count,FORMAT(((CAST(count AS DECIMAL(18,2))) / (CAST(total AS DECIMAL(18,2))))*100,'N2')percentage 
                    FROM(
                        SELECT name
                            ,sum(count)count
                            ,(select sum(count) from @result)total 
                        FROM @result 
                        GROUP BY name
                    )goo 
                    ORDER BY count DESC;";
//                echo $queryStr;
                break;

            case $MODE_ACTIVATION_DISTRIBUTED_BY_REGION:

                switch($distributedLevel){
                    //multi country
                    case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_COUNTRY:
                        $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['activation']['dbnameRegionL1']);
                        $fromTableStr='';
                        $declareQuery = "set nocount on;DECLARE @result TABLE (name nvarchar(50),count int);INSERT INTO @result ";
                        for($i=0;$i<count($isoObj);++$i){

                            if(!$isFullPermission){
                                $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                                if(!$result['queryable']) continue;
                            }

                            $tmpfromTableStr="SELECT country=(SELECT NAME_0 FROM $countryDataOnMap WHERE iso = '$isoObj[$i]'),count"
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
                                .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                                .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                                .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                                .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                                .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                                .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");

                            if(strlen($fromTableStr)==0){
                                $fromTableStr .= $tmpfromTableStr;
                            }
                            else{
                                $fromTableStr.=(" UNION ALL ".$tmpfromTableStr);
                            }
                        }
                        $declareQuery =$declareQuery . $fromTableStr;

                        $queryStr = $declareQuery
                            ."SELECT name,count,FORMAT(((CAST(count AS DECIMAL(18,2))) / (CAST(total AS DECIMAL(18,2))))*100,'N2')percentage 
                            FROM(
                                SELECT name
                                    ,sum(count)count
                                    ,(select sum(count) from @result)total 
                                FROM @result 
                                GROUP BY name
                            )goo 
                            ORDER BY count DESC;";
                        break;
                        
                    case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L1:
                    case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L2:
                        
                        if($distributedLevel == $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L1){
                            $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['activation']['dbnameRegionL1']);
                            $selectColumn = "(SELECT name FROM $nameToMapidL1 where mapid = map_id)";
                        }
                        else if($distributedLevel == $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L2){
                            $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['activation']['dbnameRegionL2']);
                            $selectColumn = "(SELECT name FROM $nameToMapidL2 where mapid = map_id)";
                        }
                        else if($distributedLevel == $MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH){
                            $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['activation']['dbnameRegionL2']);
                            $selectColumn = 'branch';
                        }
//                        echo $selectColumn;
                        $fromTableStr='';
                        $declareQuery = "set nocount on;DECLARE @result TABLE (name nvarchar(50),count int);INSERT INTO @result ";
                        for($i=0;$i<count($isoObj);++$i){

                            if(!$isFullPermission){
                                $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                                if(!$result['queryable']) continue;
                            }

                            $tmpfromTableStr="SELECT $selectColumn,count"
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
                                .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                                .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                                .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                                .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                                .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                                .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");

                            if(strlen($fromTableStr)==0){
                                $fromTableStr .= $tmpfromTableStr;
                            }
                            else{
                                $fromTableStr.=(" UNION ALL ".$tmpfromTableStr);
                            }
                        }
                        $declareQuery =$declareQuery . $fromTableStr;

                        $queryStr = $declareQuery
                            ."SELECT name,count,FORMAT(((CAST(count AS DECIMAL(18,2))) / (CAST(total AS DECIMAL(18,2))))*100,'N2')percentage 
                            FROM(
                                SELECT name
                                    ,sum(count)count
                                    ,(select sum(count) from @result)total 
                                FROM @result 
                                GROUP BY name
                            )goo 
                            ORDER BY count DESC;";
//                        echo $queryStr;
                        break;

                    case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH:

                        //need to get loc groupby level first
                        $db->connect_db($_DB['host'], $_DB['username'], $_DB['password']);
                        $sqlLevel = getBranchLocLevelSql($isoObj[0]);

                        $db->query($sqlLevel);
                        $row = $db->fetch_array();
                        $level = intval($row['loc_level']);
                        $db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB['activation']['dbnameRegionL'.$level]);
                        
                        
                        $selectColumn = ($isoObj[0] == 'IND') ? 'branch' : "(SELECT branchName from $regionTam where mapid = map_id)branch";

                        $fromTableStr='';
                        $declareQuery = "set nocount on;DECLARE @result TABLE (name nvarchar(50),count int);INSERT INTO @result ";

                        if(!$isFullPermission){
                            $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[0]);
                            if(!$result['queryable']) continue;
                        }

                        $tmpfromTableStr="SELECT $selectColumn,count"
                            ." FROM "
                            .($isColorAll ? "" : "$colorMappingTable A2,")
                            .($isCpuAll ? "" : "$cpuMappingTable A3,")
                            .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                            .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                            .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                            ."$isoObj[0] A1,"
                            ."$deviceTable device_model"

                            ." WHERE "
                            ."date BETWEEN '".$from."' AND '".$to."'"
                            ." AND A1.device = device_model.device_name"
                            .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                            .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                            .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                            .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                            .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                            .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");

                        
                        $declareQuery =$declareQuery . $tmpfromTableStr;

                        $queryStr = $declareQuery
                            ."SELECT name,count,FORMAT(((CAST(count AS DECIMAL(18,2))) / (CAST(total AS DECIMAL(18,2))))*100,'N2')percentage 
                            FROM(
                                SELECT name
                                    ,sum(count)count
                                    ,(select sum(count) from @result)total 
                                FROM @result 
                                GROUP BY name
                            )goo 
                            ORDER BY count DESC;";
//                            echo $queryStr;
                        break;
                }
                break;       
        }
        $db->query($queryStr);
        
        if($distributedBy == $MODE_ACTIVATION_DISTRIBUTED_BY_REGION && $distributedLevel == $MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH){
            while($row = $db->fetch_array()){
                $results[] = array('name'=>str_replace('_',' ',mb_strtoupper($row['name'], 'UTF-8'))
                                   , 'count'=>$row['count'] 
                                   , 'percentage'=>$row['percentage']);
            }
        }
        else{
            while($row = $db->fetch_array()){
                $results[] = array('name'=>$row['name'], 'count'=>$row['count'], 'percentage'=>$row['percentage']);
            }
        }
    }    
    $json = json_encode($results);
*/
    switch($distributedBy){
        case $MODE_ACTIVATION_DISTRIBUTED_BY_DEVICE:
            $json = '[{"name":"MODEL2(4G\/32G)","count":3390,"percentage":"62.17"},{"name":"MODEL1(3G\/32G)","count":1428,"percentage":"26.19"},{"name":"MODEL3(4G\/64G)","count":477,"percentage":"8.75"},{"name":"MODEL2(2G\/32G)","count":58,"percentage":"1.06"},{"name":"MODEL4(6G\/64G)","count":54,"percentage":"0.99"},{"name":"MODEL4(6G\/256G)","count":35,"percentage":"0.64"},{"name":"MODEL5(4G\/64G)","count":8,"percentage":"0.15"},{"name":"MODEL1(4G\/64G)","count":3,"percentage":"0.06"}]';
            break;
        case $MODE_ACTIVATION_DISTRIBUTED_BY_MODEL:
            $json = '[{"name":"MODEL2","count":3448,"percentage":"63.23"},{"name":"MODEL1","count":1431,"percentage":"26.24"},{"name":"MODEL3","count":477,"percentage":"8.75"},{"name":"MODEL4","count":89,"percentage":"1.63"},{"name":"MODEL5","count":8,"percentage":"0.15"}]';
            break;
        case $MODE_ACTIVATION_DISTRIBUTED_BY_REGION:
            switch($distributedLevel){
                case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_BRANCH:
                    $json = '[{"name":"KARNATAKA","count":2266,"percentage":"41.56"},{"name":"TAMIL NADU","count":1140,"percentage":"20.91"},{"name":"JOB","count":291,"percentage":"5.34"},{"name":"KERALA","count":258,"percentage":"4.73"},{"name":"MUMBAI","count":204,"percentage":"3.74"},{"name":"UP UTTARANCHAL","count":204,"percentage":"3.74"},{"name":"NORTH EAST","count":172,"percentage":"3.15"},{"name":"DELHI","count":135,"percentage":"2.48"},{"name":"PUNE","count":122,"percentage":"2.24"},{"name":"","count":120,"percentage":"2.20"},{"name":"RAJASTHAN","count":118,"percentage":"2.16"},{"name":"NAGPUR RAIPUR","count":100,"percentage":"1.83"},{"name":"PUNJAB","count":78,"percentage":"1.43"},{"name":"GUJARAT","count":72,"percentage":"1.32"},{"name":"ANDHRA PRADESH","count":70,"percentage":"1.28"},{"name":"WEST BENGAL","count":55,"percentage":"1.01"},{"name":"MADHYA PRADESH","count":48,"percentage":"0.88"}]';
                    break;
                case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_COUNTRY:
                    $json = '[{"name":"India","count":5453,"percentage":"100.00"}]';
                    break;
                case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L1:
                    $json = '[{"name":"Maharashtra","count":814,"percentage":"14.93"},{"name":"Tamil Nadu","count":577,"percentage":"10.58"},{"name":"Karnataka","count":566,"percentage":"10.38"},{"name":"NCT of Delhi","count":462,"percentage":"8.47"},{"name":"Kerala","count":382,"percentage":"7.01"},{"name":"West Bengal","count":314,"percentage":"5.76"},{"name":"Gujarat","count":291,"percentage":"5.34"},{"name":"Uttar Pradesh","count":258,"percentage":"4.73"},{"name":"Telangana","count":248,"percentage":"4.55"},{"name":"Andhra Pradesh","count":193,"percentage":"3.54"},{"name":"Assam","count":157,"percentage":"2.88"},{"name":"Jharkhand","count":151,"percentage":"2.77"},{"name":"Rajasthan","count":145,"percentage":"2.66"},{"name":"Madhya Pradesh","count":122,"percentage":"2.24"},{"name":"Bihar","count":117,"percentage":"2.15"},{"name":"Haryana","count":116,"percentage":"2.13"},{"name":"Odisha","count":104,"percentage":"1.91"},{"name":"Punjab","count":81,"percentage":"1.49"},{"name":"Chhattisgarh","count":69,"percentage":"1.27"},{"name":"Goa","count":58,"percentage":"1.06"},{"name":"Uttarakhand","count":46,"percentage":"0.84"},{"name":"Himachal Pradesh","count":37,"percentage":"0.68"},{"name":"Chandigarh","count":34,"percentage":"0.62"},{"name":"Jammu and Kashmir","count":25,"percentage":"0.46"},{"name":"Puducherry","count":18,"percentage":"0.33"},{"name":"Manipur","count":17,"percentage":"0.31"},{"name":"Meghalaya","count":12,"percentage":"0.22"},{"name":"Mizoram","count":12,"percentage":"0.22"},{"name":"Tripura","count":11,"percentage":"0.20"},{"name":"Nagaland","count":7,"percentage":"0.13"},{"name":"Sikkim","count":5,"percentage":"0.09"},{"name":"Arunachal Pradesh","count":2,"percentage":"0.04"},{"name":"Dadra and Nagar Haveli","count":1,"percentage":"0.02"},{"name":"Daman and Diu","count":1,"percentage":"0.02"}]';
                    break;
                case $MODE_ACTIVATION_DISTRIBUTED_LEVEL_L2:
                    $json = '[{"name":"Delhi","count":462,"percentage":"8.47"},{"name":"Bangalore Urban","count":394,"percentage":"7.23"},{"name":"Mumbai Suburban","count":187,"percentage":"3.43"},{"name":"Pune","count":154,"percentage":"2.82"},{"name":"Ranga Reddy","count":139,"percentage":"2.55"},{"name":"Chennai","count":134,"percentage":"2.46"},{"name":"Thane","count":120,"percentage":"2.20"},{"name":"Ernakulam","count":97,"percentage":"1.78"},{"name":"Ahmedabad","count":92,"percentage":"1.69"},{"name":"North 24 Parganas","count":88,"percentage":"1.61"},{"name":"Kanchipuram","count":85,"percentage":"1.56"},{"name":"Thiruvananthapuram","count":68,"percentage":"1.25"},{"name":"Ranchi","count":64,"percentage":"1.17"},{"name":"Coimbatore","count":59,"percentage":"1.08"},{"name":"Hyderabad","count":57,"percentage":"1.05"},{"name":"Jaipur","count":56,"percentage":"1.03"},{"name":"Nagpur","count":55,"percentage":"1.01"},{"name":"Kolkata","count":54,"percentage":"0.99"},{"name":"Gautam Buddh Nagar","count":52,"percentage":"0.95"},{"name":"South 24 Parganas","count":50,"percentage":"0.92"},{"name":"Patna","count":49,"percentage":"0.90"},{"name":"Gurgaon","count":48,"percentage":"0.88"},{"name":"Mumbai City","count":47,"percentage":"0.86"},{"name":"Kamrup Metropolitan","count":46,"percentage":"0.84"},{"name":"Surat","count":43,"percentage":"0.79"},{"name":"Tiruvallur","count":41,"percentage":"0.75"},{"name":"Vadodara","count":40,"percentage":"0.73"},{"name":"Lucknow","count":40,"percentage":"0.73"},{"name":"East Singhbhum","count":36,"percentage":"0.66"},{"name":"Visakhapatnam","count":36,"percentage":"0.66"},{"name":"Chandigarh","count":34,"percentage":"0.62"},{"name":"Krishna","count":33,"percentage":"0.61"},{"name":"Rajkot","count":33,"percentage":"0.61"},{"name":"Salem","count":32,"percentage":"0.59"},{"name":"Kozhikode","count":32,"percentage":"0.59"},{"name":"Muzaffarpur","count":31,"percentage":"0.57"},{"name":"Raigad","count":31,"percentage":"0.57"},{"name":"Thrissur","count":30,"percentage":"0.55"},{"name":"Kottayam","count":30,"percentage":"0.55"},{"name":"North Goa","count":29,"percentage":"0.53"},{"name":"Nashik","count":29,"percentage":"0.53"},{"name":"Dakshina Kannada","count":29,"percentage":"0.53"},{"name":"South Goa","count":29,"percentage":"0.53"},{"name":"Raipur","count":29,"percentage":"0.53"},{"name":"Varanasi","count":27,"percentage":"0.50"},{"name":"Cuttack","count":27,"percentage":"0.50"},{"name":"Bhopal","count":26,"percentage":"0.48"},{"name":"Malappuram","count":26,"percentage":"0.48"},{"name":"Khordha","count":26,"percentage":"0.48"},{"name":"Kanpur Nagar","count":25,"percentage":"0.46"},{"name":"East Godavari","count":25,"percentage":"0.46"},{"name":"Guntur","count":23,"percentage":"0.42"},{"name":"Bardhaman","count":23,"percentage":"0.42"},{"name":"Palghar","count":23,"percentage":"0.42"},{"name":"Palakkad","count":22,"percentage":"0.40"},{"name":"Erode","count":22,"percentage":"0.40"},{"name":"Dehradun","count":21,"percentage":"0.39"},{"name":"Belgaum","count":21,"percentage":"0.39"},{"name":"Mysore","count":21,"percentage":"0.39"},{"name":"Howrah","count":21,"percentage":"0.39"},{"name":"Tiruppur","count":21,"percentage":"0.39"},{"name":"Indore","count":20,"percentage":"0.37"},{"name":"Jammu","count":20,"percentage":"0.37"},{"name":"Ludhiana","count":20,"percentage":"0.37"},{"name":"Madurai","count":20,"percentage":"0.37"},{"name":"Aurangabad","count":20,"percentage":"0.37"},{"name":"Dhanbad","count":20,"percentage":"0.37"},{"name":"Alappuzha","count":19,"percentage":"0.35"},{"name":"Tiruchirappalli","count":19,"percentage":"0.35"},{"name":"Vellore","count":19,"percentage":"0.35"},{"name":"Cachar","count":18,"percentage":"0.33"},{"name":"Hooghly","count":18,"percentage":"0.33"},{"name":"Kaushambi","count":18,"percentage":"0.33"},{"name":"Kapurthala","count":17,"percentage":"0.31"},{"name":"Kollam","count":17,"percentage":"0.31"},{"name":"Faridabad","count":17,"percentage":"0.31"},{"name":"Pondicherry","count":17,"percentage":"0.31"},{"name":"Satara","count":16,"percentage":"0.29"},{"name":"Sonitpur","count":16,"percentage":"0.29"},{"name":"Gandhinagar","count":16,"percentage":"0.29"},{"name":"Chittoor","count":16,"percentage":"0.29"},{"name":"Kota","count":16,"percentage":"0.29"},{"name":"Kurnool","count":16,"percentage":"0.29"},{"name":"Kolhapur","count":15,"percentage":"0.28"},{"name":"Kannur","count":15,"percentage":"0.28"},{"name":"Jalgaon","count":15,"percentage":"0.28"},{"name":"Ghaziabad","count":15,"percentage":"0.28"},{"name":"Bareilly","count":14,"percentage":"0.26"},{"name":"Kanyakumari","count":14,"percentage":"0.26"},{"name":"Karimnagar","count":14,"percentage":"0.26"},{"name":"Nadia","count":14,"percentage":"0.26"},{"name":"Pathanamthitta","count":13,"percentage":"0.24"},{"name":"Jabalpur","count":13,"percentage":"0.24"},{"name":"Durg","count":13,"percentage":"0.24"},{"name":"Solapur","count":13,"percentage":"0.24"},{"name":"Viluppuram","count":13,"percentage":"0.24"},{"name":"Udaipur","count":12,"percentage":"0.22"},{"name":"Purba Medinipur","count":12,"percentage":"0.22"},{"name":"East Khasi Hills","count":12,"percentage":"0.22"},{"name":"Dibrugarh","count":12,"percentage":"0.22"},{"name":"Aizawl","count":12,"percentage":"0.22"},{"name":"Bhilwara","count":12,"percentage":"0.22"},{"name":"Korba","count":12,"percentage":"0.22"},{"name":"Nalanda","count":12,"percentage":"0.22"},{"name":"Paschim Medinipur","count":11,"percentage":"0.20"},{"name":"Medak","count":11,"percentage":"0.20"},{"name":"Jodhpur","count":11,"percentage":"0.20"},{"name":"Bokaro","count":11,"percentage":"0.20"},{"name":"Cuddalore","count":11,"percentage":"0.20"},{"name":"Thanjavur","count":11,"percentage":"0.20"},{"name":"Sundargarh","count":10,"percentage":"0.18"},{"name":"Sahibzada Ajit Singh Nagar","count":10,"percentage":"0.18"},{"name":"Dindigul","count":10,"percentage":"0.18"},{"name":"Ganjam","count":10,"percentage":"0.18"},{"name":"Betul","count":10,"percentage":"0.18"},{"name":"Khammam","count":10,"percentage":"0.18"},{"name":"Kutch","count":10,"percentage":"0.18"},{"name":"Panchkula","count":9,"percentage":"0.17"},{"name":"Namakkal","count":9,"percentage":"0.17"},{"name":"Kullu","count":9,"percentage":"0.17"},{"name":"Kadapa","count":9,"percentage":"0.17"},{"name":"Imphal West","count":9,"percentage":"0.17"},{"name":"Jalandhar","count":9,"percentage":"0.17"},{"name":"Idukki","count":9,"percentage":"0.17"},{"name":"Ahmednagar","count":9,"percentage":"0.17"},{"name":"Adilabad","count":9,"percentage":"0.17"},{"name":"Agra","count":9,"percentage":"0.17"},{"name":"Alwar","count":9,"percentage":"0.17"},{"name":"Amravati","count":9,"percentage":"0.17"},{"name":"Anantapur","count":9,"percentage":"0.17"},{"name":"Gwalior","count":9,"percentage":"0.17"},{"name":"Sivasagar","count":9,"percentage":"0.17"},{"name":"Tirunelveli","count":9,"percentage":"0.17"},{"name":"Udham Singh Nagar","count":9,"percentage":"0.17"},{"name":"Vijayapura","count":9,"percentage":"0.17"},{"name":"Yavatmal","count":8,"percentage":"0.15"},{"name":"West Tripura","count":8,"percentage":"0.15"},{"name":"Sri Potti Sriramulu Nellore","count":8,"percentage":"0.15"},{"name":"Sangli","count":8,"percentage":"0.15"},{"name":"Gorakhpur","count":8,"percentage":"0.15"},{"name":"Dharwad","count":8,"percentage":"0.15"},{"name":"Davanagere","count":8,"percentage":"0.15"},{"name":"Amritsar","count":8,"percentage":"0.15"},{"name":"Kamrup","count":8,"percentage":"0.15"},{"name":"Nainital","count":8,"percentage":"0.15"},{"name":"Prakasam","count":8,"percentage":"0.15"},{"name":"Nagapattinam","count":8,"percentage":"0.15"},{"name":"Jorhat","count":7,"percentage":"0.13"},{"name":"Junagadh","count":7,"percentage":"0.13"},{"name":"Hisar","count":7,"percentage":"0.13"},{"name":"Krishnagiri","count":7,"percentage":"0.13"},{"name":"Anand","count":7,"percentage":"0.13"},{"name":"Bharuch","count":7,"percentage":"0.13"},{"name":"Bidar","count":7,"percentage":"0.13"},{"name":"Sambalpur","count":7,"percentage":"0.13"},{"name":"Sultanpur","count":7,"percentage":"0.13"},{"name":"Thoothukudi","count":7,"percentage":"0.13"},{"name":"Solan","count":7,"percentage":"0.13"},{"name":"Shimoga","count":7,"percentage":"0.13"},{"name":"Ujjain","count":7,"percentage":"0.13"},{"name":"Valsad","count":6,"percentage":"0.11"},{"name":"Shimla","count":6,"percentage":"0.11"},{"name":"Tinsukia","count":6,"percentage":"0.11"},{"name":"Sagar","count":6,"percentage":"0.11"},{"name":"Rewa","count":6,"percentage":"0.11"},{"name":"Ambala","count":6,"percentage":"0.11"},{"name":"Bagalkot","count":6,"percentage":"0.11"},{"name":"Balasore","count":6,"percentage":"0.11"},{"name":"Akola","count":6,"percentage":"0.11"},{"name":"Bangalore Rural","count":6,"percentage":"0.11"},{"name":"Haridwar","count":6,"percentage":"0.11"},{"name":"Nagaon","count":6,"percentage":"0.11"},{"name":"Pathankot","count":5,"percentage":"0.09"},{"name":"Kolar","count":5,"percentage":"0.09"},{"name":"Kangra","count":5,"percentage":"0.09"},{"name":"Imphal East","count":5,"percentage":"0.09"},{"name":"Jalna","count":5,"percentage":"0.09"},{"name":"Faizabad","count":5,"percentage":"0.09"},{"name":"Darjeeling","count":5,"percentage":"0.09"},{"name":"Buldhana","count":5,"percentage":"0.09"},{"name":"Deoghar","count":5,"percentage":"0.09"},{"name":"Dimapur","count":5,"percentage":"0.09"},{"name":"Chikkamagaluru","count":5,"percentage":"0.09"},{"name":"Rewari","count":5,"percentage":"0.09"},{"name":"Sabarkantha","count":5,"percentage":"0.09"},{"name":"Raichur","count":5,"percentage":"0.09"},{"name":"Ramanathapuram","count":4,"percentage":"0.07"},{"name":"Ramgarh","count":4,"percentage":"0.07"},{"name":"Ratlam","count":4,"percentage":"0.07"},{"name":"Sikar","count":4,"percentage":"0.07"},{"name":"Sindhudurg","count":4,"percentage":"0.07"},{"name":"Vizianagaram","count":4,"percentage":"0.07"},{"name":"Warangal","count":4,"percentage":"0.07"},{"name":"Wardha","count":4,"percentage":"0.07"},{"name":"Washim","count":4,"percentage":"0.07"},{"name":"West Godavari","count":4,"percentage":"0.07"},{"name":"Udupi","count":4,"percentage":"0.07"},{"name":"Tumkur","count":4,"percentage":"0.07"},{"name":"Chandrapur","count":4,"percentage":"0.07"},{"name":"Bikaner","count":4,"percentage":"0.07"},{"name":"Bilaspur","count":4,"percentage":"0.07"},{"name":"Birbhum","count":4,"percentage":"0.07"},{"name":"Bhandara","count":4,"percentage":"0.07"},{"name":"Alipurduar","count":4,"percentage":"0.07"},{"name":"Dharmapuri","count":4,"percentage":"0.07"},{"name":"Dhule","count":4,"percentage":"0.07"},{"name":"East Sikkim","count":4,"percentage":"0.07"},{"name":"Hamirpur","count":4,"percentage":"0.07"},{"name":"Gulbarga","count":4,"percentage":"0.07"},{"name":"Golaghat","count":4,"percentage":"0.07"},{"name":"Hazaribagh","count":4,"percentage":"0.07"},{"name":"Karnal","count":4,"percentage":"0.07"},{"name":"Karur","count":4,"percentage":"0.07"},{"name":"Panipat","count":4,"percentage":"0.07"},{"name":"Mirzapur","count":4,"percentage":"0.07"},{"name":"Mandi","count":4,"percentage":"0.07"},{"name":"Mandya","count":3,"percentage":"0.06"},{"name":"Maldah","count":3,"percentage":"0.06"},{"name":"Lakhimpur","count":3,"percentage":"0.06"},{"name":"Meerut","count":3,"percentage":"0.06"},{"name":"Nagaur","count":3,"percentage":"0.06"},{"name":"Patiala","count":3,"percentage":"0.06"},{"name":"Navsari","count":3,"percentage":"0.06"},{"name":"Goalpara","count":3,"percentage":"0.06"},{"name":"Hoshangabad","count":3,"percentage":"0.06"},{"name":"Jajpur","count":3,"percentage":"0.06"},{"name":"Jaunpur","count":3,"percentage":"0.06"},{"name":"Gomati","count":3,"percentage":"0.06"},{"name":"Gondia","count":3,"percentage":"0.06"},{"name":"East Champaran","count":3,"percentage":"0.06"},{"name":"Gaya","count":3,"percentage":"0.06"},{"name":"Darrang","count":3,"percentage":"0.06"},{"name":"Ajmer","count":3,"percentage":"0.06"},{"name":"Bhavnagar","count":3,"percentage":"0.06"},{"name":"Bellary","count":3,"percentage":"0.06"},{"name":"Beed","count":3,"percentage":"0.06"},{"name":"Begusarai","count":3,"percentage":"0.06"},{"name":"Chirang","count":3,"percentage":"0.06"},{"name":"Vaishali","count":3,"percentage":"0.06"},{"name":"Theni","count":3,"percentage":"0.06"},{"name":"Virudhunagar","count":3,"percentage":"0.06"},{"name":"Wayanad","count":3,"percentage":"0.06"},{"name":"Uttara Kannada","count":3,"percentage":"0.06"},{"name":"Sirsa","count":3,"percentage":"0.06"},{"name":"Sivaganga","count":3,"percentage":"0.06"},{"name":"Surguja","count":3,"percentage":"0.06"},{"name":"Srinagar","count":3,"percentage":"0.06"},{"name":"Ratnagiri","count":3,"percentage":"0.06"},{"name":"Puri","count":3,"percentage":"0.06"},{"name":"Porbandar","count":2,"percentage":"0.04"},{"name":"Rajnandgaon","count":2,"percentage":"0.04"},{"name":"Rajsamand","count":2,"percentage":"0.04"},{"name":"Ramanagara","count":2,"percentage":"0.04"},{"name":"Rohtak","count":2,"percentage":"0.04"},{"name":"Saran","count":2,"percentage":"0.04"},{"name":"Srikakulam","count":2,"percentage":"0.04"},{"name":"Sonbhadra","count":2,"percentage":"0.04"},{"name":"Seoni","count":2,"percentage":"0.04"},{"name":"Vidisha","count":2,"percentage":"0.04"},{"name":"West Singhbhum","count":2,"percentage":"0.04"},{"name":"Yadgir","count":2,"percentage":"0.04"},{"name":"Udalguri","count":2,"percentage":"0.04"},{"name":"Tiruvannamalai","count":2,"percentage":"0.04"},{"name":"Uttar Dinajpur","count":2,"percentage":"0.04"},{"name":"Chitradurga","count":2,"percentage":"0.04"},{"name":"Chamarajnagar","count":2,"percentage":"0.04"},{"name":"Bijnor","count":2,"percentage":"0.04"},{"name":"Botad","count":2,"percentage":"0.04"},{"name":"Budaun","count":2,"percentage":"0.04"},{"name":"Bulandshahr","count":2,"percentage":"0.04"},{"name":"Bathinda","count":2,"percentage":"0.04"},{"name":"Bhagalpur","count":2,"percentage":"0.04"},{"name":"Aligarh","count":2,"percentage":"0.04"},{"name":"Amreli","count":2,"percentage":"0.04"},{"name":"Bankura","count":2,"percentage":"0.04"},{"name":"Barpeta","count":2,"percentage":"0.04"},{"name":"Balangir","count":2,"percentage":"0.04"},{"name":"Dausa","count":2,"percentage":"0.04"},{"name":"Dahod","count":2,"percentage":"0.04"},{"name":"Churu","count":2,"percentage":"0.04"},{"name":"Dhubri","count":2,"percentage":"0.04"},{"name":"Dungarpur","count":2,"percentage":"0.04"},{"name":"East Nimar","count":2,"percentage":"0.04"},{"name":"Gajapati","count":2,"percentage":"0.04"},{"name":"Fatehpur","count":2,"percentage":"0.04"},{"name":"Gir Somnath","count":2,"percentage":"0.04"},{"name":"Hailakandi","count":2,"percentage":"0.04"},{"name":"Gurdaspur","count":2,"percentage":"0.04"},{"name":"Janjgir-Champa","count":2,"percentage":"0.04"},{"name":"Jhajjar","count":2,"percentage":"0.04"},{"name":"Haveri","count":2,"percentage":"0.04"},{"name":"Kheda","count":2,"percentage":"0.04"},{"name":"Katni","count":2,"percentage":"0.04"},{"name":"Kodagu","count":2,"percentage":"0.04"},{"name":"Nanded","count":2,"percentage":"0.04"},{"name":"Narmada","count":2,"percentage":"0.04"},{"name":"Nalbari","count":2,"percentage":"0.04"},{"name":"Palamu","count":2,"percentage":"0.04"},{"name":"Nizamabad","count":2,"percentage":"0.04"},{"name":"Osmanabad","count":2,"percentage":"0.04"},{"name":"Parbhani","count":2,"percentage":"0.04"},{"name":"Pratapgarh","count":2,"percentage":"0.04"},{"name":"Mehsana","count":2,"percentage":"0.04"},{"name":"Mewat","count":2,"percentage":"0.04"},{"name":"Moradabad","count":2,"percentage":"0.04"},{"name":"Mahendragarh","count":2,"percentage":"0.04"},{"name":"Mahoba","count":1,"percentage":"0.02"},{"name":"Mayurbhanj","count":1,"percentage":"0.02"},{"name":"Mandsaur","count":1,"percentage":"0.02"},{"name":"Latur","count":1,"percentage":"0.02"},{"name":"Lower Dibang Valley","count":1,"percentage":"0.02"},{"name":"Mahbubnagar","count":1,"percentage":"0.02"},{"name":"Mahe","count":1,"percentage":"0.02"},{"name":"Morbi","count":1,"percentage":"0.02"},{"name":"Morena","count":1,"percentage":"0.02"},{"name":"Moga","count":1,"percentage":"0.02"},{"name":"Mokokchung","count":1,"percentage":"0.02"},{"name":"Munger","count":1,"percentage":"0.02"},{"name":"Murshidabad","count":1,"percentage":"0.02"},{"name":"Pudukkottai","count":1,"percentage":"0.02"},{"name":"Pulwama","count":1,"percentage":"0.02"},{"name":"Pauri Garhwal","count":1,"percentage":"0.02"},{"name":"Perambalur","count":1,"percentage":"0.02"},{"name":"Peren","count":1,"percentage":"0.02"},{"name":"Pali","count":1,"percentage":"0.02"},{"name":"Palwal","count":1,"percentage":"0.02"},{"name":"Patan","count":1,"percentage":"0.02"},{"name":"Pakur","count":1,"percentage":"0.02"},{"name":"Nalgonda","count":1,"percentage":"0.02"},{"name":"Neemuch","count":1,"percentage":"0.02"},{"name":"Koderma","count":1,"percentage":"0.02"},{"name":"Kinnaur","count":1,"percentage":"0.02"},{"name":"Kulgam","count":1,"percentage":"0.02"},{"name":"Kushinagar","count":1,"percentage":"0.02"},{"name":"Karbi Anglong","count":1,"percentage":"0.02"},{"name":"Kendujhar","count":1,"percentage":"0.02"},{"name":"Khagaria","count":1,"percentage":"0.02"},{"name":"Kasaragod","count":1,"percentage":"0.02"},{"name":"Hoshiarpur","count":1,"percentage":"0.02"},{"name":"Jaisalmer","count":1,"percentage":"0.02"},{"name":"Jagatsinghapur","count":1,"percentage":"0.02"},{"name":"Jharsuguda","count":1,"percentage":"0.02"},{"name":"Jhunjhunu","count":1,"percentage":"0.02"},{"name":"Jind","count":1,"percentage":"0.02"},{"name":"Jalpaiguri","count":1,"percentage":"0.02"},{"name":"Jehanabad","count":1,"percentage":"0.02"},{"name":"Kalahandi","count":1,"percentage":"0.02"},{"name":"Hanumangarh","count":1,"percentage":"0.02"},{"name":"Hapur","count":1,"percentage":"0.02"},{"name":"Hassan","count":1,"percentage":"0.02"},{"name":"Hathras","count":1,"percentage":"0.02"},{"name":"Gopalganj","count":1,"percentage":"0.02"},{"name":"Firozabad","count":1,"percentage":"0.02"},{"name":"Gadchiroli","count":1,"percentage":"0.02"},{"name":"Faridkot","count":1,"percentage":"0.02"},{"name":"East Siang","count":1,"percentage":"0.02"},{"name":"Dhemaji","count":1,"percentage":"0.02"},{"name":"Dhenkanal","count":1,"percentage":"0.02"},{"name":"Chittorgarh","count":1,"percentage":"0.02"},{"name":"Churachandpur","count":1,"percentage":"0.02"},{"name":"Dadra and Nagar Haveli","count":1,"percentage":"0.02"},{"name":"Daman","count":1,"percentage":"0.02"},{"name":"Damoh","count":1,"percentage":"0.02"},{"name":"Darbhanga","count":1,"percentage":"0.02"},{"name":"Balod","count":1,"percentage":"0.02"},{"name":"Banda","count":1,"percentage":"0.02"},{"name":"Angul","count":1,"percentage":"0.02"},{"name":"Araria","count":1,"percentage":"0.02"},{"name":"Aravalli","count":1,"percentage":"0.02"},{"name":"Ashoknagar","count":1,"percentage":"0.02"},{"name":"Auraiya","count":1,"percentage":"0.02"},{"name":"Bastar","count":1,"percentage":"0.02"},{"name":"Basti","count":1,"percentage":"0.02"},{"name":"Barmer","count":1,"percentage":"0.02"},{"name":"Barabanki","count":1,"percentage":"0.02"},{"name":"Alirajpur","count":1,"percentage":"0.02"},{"name":"Allahabad","count":1,"percentage":"0.02"},{"name":"Bhadrak","count":1,"percentage":"0.02"},{"name":"Bharatpur","count":1,"percentage":"0.02"},{"name":"Bhind","count":1,"percentage":"0.02"},{"name":"Bhiwani","count":1,"percentage":"0.02"},{"name":"Bhojpur","count":1,"percentage":"0.02"},{"name":"Bongaigaon","count":1,"percentage":"0.02"},{"name":"Chandel","count":1,"percentage":"0.02"},{"name":"Chhatarpur","count":1,"percentage":"0.02"},{"name":"Chikkaballapur","count":1,"percentage":"0.02"},{"name":"Una","count":1,"percentage":"0.02"},{"name":"Yamunanagar","count":1,"percentage":"0.02"},{"name":"Seraikella-Kharsawan","count":1,"percentage":"0.02"},{"name":"Shahjahanpur","count":1,"percentage":"0.02"},{"name":"Siddharth Nagar","count":1,"percentage":"0.02"},{"name":"Singrauli","count":1,"percentage":"0.02"},{"name":"Siwan","count":1,"percentage":"0.02"},{"name":"South Sikkim","count":1,"percentage":"0.02"},{"name":"Sri Muktsar Sahib","count":1,"percentage":"0.02"},{"name":"Sonipat","count":1,"percentage":"0.02"},{"name":"Tehri Garhwal","count":1,"percentage":"0.02"},{"name":"The Nilgiris","count":1,"percentage":"0.02"},{"name":"Thoubal","count":1,"percentage":"0.02"},{"name":"Satna","count":1,"percentage":"0.02"},{"name":"Sangrur","count":1,"percentage":"0.02"},{"name":"Rohtas","count":1,"percentage":"0.02"},{"name":"Purulia","count":1,"percentage":"0.02"}]';
                    break;
            }
    }

    echo htmlspecialchars($json);

?>