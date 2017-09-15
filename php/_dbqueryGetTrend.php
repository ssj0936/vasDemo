<?php
    ini_set("max_execution_time", 0);
/*
    require_once("DBconfig.php");
    require_once("DBclass.php");
    require_once("function.php");
    $resultsGroupByModel = array();
    $resultsGroupByDevice = array();
    $resultsGroupByCountry = array();
    $resultsGroupByDate = array();
    $resultsGroupByDist = array();
    $resultsGroupByBranch = array();
    $distinctModel = array();
    $db = new DB();
    

//    $now = new DateTime(null,new DateTimeZone('Asia/Taipei'));
//    echo "<br>-----------<br>".$now->format('Y-m-d H:i:s')."<br>-----------<br>";
    $color = '["all"]';
    $cpu = '["all"]';
    $rearCamera = '["all"]';
    $frontCamera = '["all"]';
    $dataset = 'activation';
    $from = "2016-11-1";
    $to = "2016-12-31";    
    $iso ='["IND"]';
    $data = '[{"model":"ZENFONE","devices":"ZENFONE","product":"ZENFONE","datatype":"product"}]';
 $distBranch = '[]';
    $onlineDist = '[]';
    $permission = '{}';

//    $color = '["all"]';
//    $cpu = '["all"]';
//    $rearCamera = '["all"]';
//    $frontCamera = '["all"]';
//    $dataset = 'activation';
//    $from = "2016-7-9";
//    $to = "2016-8-3";    
//    $iso ='["IND"]';
//    $data = '[{"model":"A501CG","devices":"A501CG","product":"ZENFONE","datatype":"model"}]';
//    $distBranch = '[{"dist":"FLIPKART","branch":"KARNATAKA"}]';
//    $onlineDist = '[]';

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

//    $color = '["all"]';
//    $cpu = '["all"]';
//    $rearCamera = '["all"]';
//    $frontCamera = '["all"]';
//    $dataset = 'activation';
//    $from = "2016-12-7";
//    $to = "2016-12-9";    
//    $iso ='["IDN"]';
//    $data = '[{"model":"MODEL3","devices":"MODEL3","product":"ZENFONE","datatype":"model"}]';
//    $distBranch = '[]';
//    $onlineDist = '[]';
//    $permission = '{}';
    
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
    
		if(count($isoObj)==1){
			$db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB[$dataset]['dbnameRegionL2']);
		}else{
			$db->connect_db($_DB['host'], $_DB['username'], $_DB['password'], $_DB[$dataset]['dbnameRegionL1']);
		}
        
        $str_in='';
        $sqlDeviceIn = getAllTargetPartNoSql($dataObj);

        $db->query($sqlDeviceIn);
        while($row = $db->fetch_array()){
            $str_in.="'".$row['product_id']."',";
        }
        $str_in = substr($str_in,0,-1);
		//echo $str_in;	
        //group by model_name
		//--------------------------------------------------------------------------------
		$fromTableStr='';
		for($i=0;$i<count($isoObj);++$i){
            
            if(!$isFullPermission){
                $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                if(!$result['queryable']) continue;
            }
            
            $tmpFromTableStr="SELECT part_device.model_description as device,part_device.device_name as name,count,date"
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
                        .($isDistBranch ? " AND $distBranchStr " : "")
                        .($isOnlineDist ? " AND $onlineDistStr " : "")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")");
			
            if(strlen($fromTableStr)==0){
                $fromTableStr .= $tmpFromTableStr;
            }
            else{
                $fromTableStr.=(" UNION ALL ".$tmpFromTableStr);
            }
		}
		$fromTableStrGroupByModel ="(".$fromTableStr.")data,$deviceTable mapping";
//		echo $fromTableStr."<br>";
		
		$queryStr = "SELECT sum(count)count,date,model_name FROM ".$fromTableStrGroupByModel." WHERE data.name = mapping.device_name GROUP BY date, model_name ORDER BY date,model_name;";
//		echo $queryStr."<br><br><br>";
		
		$db->query($queryStr);
        $first = true;
        $start_date = null;
        $end_date = null;
		while($row = $db->fetch_array())
		{
			$resultsGroupByModel[$row['model_name']][] = array(
				//'model' => ($row['model_name']),
				'count' => ($row['count']),
                'date' => ($row['date'])
			);
            if($first){
                $start_date = $row['date'];
                $first=false;
            }
            $end_date = $row['date'];
		}
        //group by devices
        //--------------------------------------------------------------------------------
        $fromTableStrGroupByDevice ="(".$fromTableStr.")data";
        $queryStr = "SELECT sum(count)count,date,device FROM ".$fromTableStrGroupByDevice." GROUP BY date, device ORDER BY date,device;";
        $db->query($queryStr);
        while($row = $db->fetch_array())
        {
            $resultsGroupByDevice[$row['device']][] = array(
                'count' => ($row['count']),
                'date' => ($row['date'])
            );
        }
        //group by date
        //--------------------------------------------------------------------------------
        $fromTableStrGroupByDate ="(".$fromTableStr.")data";
        $queryStr = "SELECT sum(count)count,date FROM ".$fromTableStrGroupByDate." GROUP BY date ORDER BY date;";
        $db->query($queryStr);
        while($row = $db->fetch_array())
        {
            $resultsGroupByDate[] = array(
                'count' => ($row['count']),
                'date' => ($row['date'])
            );
        }
        //group By Country
        //--------------------------------------------------------------------------------
        $queryStr='';
        for($i=0;$i<count($isoObj);++$i){
            $queryStr="SELECT sum(count)count,date"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        ."$isoObj[$i] A1"

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .($isDistBranch ? " AND $distBranchStr " : "")
                        .($isOnlineDist ? " AND $onlineDistStr " : "")
                        .'GROUP BY date ORDER BY date';
            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByCountry[$isoObj[$i]][] = array(
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }
        }
        
        //group by dist/branch
        if($isDistBranch){
            //group by dist
            //--------------------------------------------------------------------------------
            $fromTableStr='';
            for($i=0;$i<count($isoObj);++$i){

                $fromTableStr.="SELECT part_device.model_description as device,part_device.device_name as name,count,date, disti"
                            ." FROM "
                            .($isColorAll ? "" : "$colorMappingTable A2,")
                            .($isCpuAll ? "" : "$cpuMappingTable A3,")
                            .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                            .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                            ."$isoObj[$i] A1,"
                            ."$productDescriptionMapping part_device"

                            ." WHERE "
                            ."date BETWEEN '".$from."' AND '".$to."'"
                            ." AND A1.product_id = part_device.product_id"
                            .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                            .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                            .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                            .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                            .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                            .($isDistBranch ? " AND $distBranchStr " : "")
                            .($isOnlineDist ? " AND $onlineDistStr " : "");
                if($i != count($isoObj)-1)
                    $fromTableStr.=" UNION ALL ";
            }
            $fromTableStrGroupByDist ="(".$fromTableStr.")data,$deviceTable mapping";
            //echo $fromTableStr."<br>";

            $queryStr = "SELECT sum(count)count,date,disti FROM ".$fromTableStrGroupByDist." WHERE data.name = mapping.device_name GROUP BY date, disti ORDER BY date,disti;";
//    		echo $queryStr."<br><br><br>";

            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByDist[$row['disti']][] = array(
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }
            
            //group by branch
            //--------------------------------------------------------------------------------
            $fromTableStr='';
            for($i=0;$i<count($isoObj);++$i){

                $fromTableStr.="SELECT part_device.model_description as device,part_device.device_name as name,count,date,branch"
                            ." FROM "
                            .($isColorAll ? "" : "$colorMappingTable A2,")
                            .($isCpuAll ? "" : "$cpuMappingTable A3,")
                            .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                            .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                            ."$isoObj[$i] A1,"
                            ."$productDescriptionMapping part_device"

                            ." WHERE "
                            ."date BETWEEN '".$from."' AND '".$to."'"
                            ." AND A1.product_id = part_device.product_id"
                            .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                            .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                            .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                            .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                            .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                            .($isDistBranch ? " AND $distBranchStr " : "")
                            .($isOnlineDist ? " AND $onlineDistStr " : "");
                if($i != count($isoObj)-1)
                    $fromTableStr.=" UNION ALL ";
            }
            $fromTableStrGroupByBranch ="(".$fromTableStr.")data,$deviceTable mapping";
            //echo $fromTableStr."<br>";

            $queryStr = "SELECT sum(count)count,date,branch FROM ".$fromTableStrGroupByBranch." WHERE data.name = mapping.device_name GROUP BY date, branch ORDER BY date,branch;";
    //		echo $queryStr."<br><br><br>";

            $db->query($queryStr);
            while($row = $db->fetch_array())
            {
                $resultsGroupByBranch[$row['branch']][] = array(
                    'count' => ($row['count']),
                    'date' => ($row['date'])
                );
            }
        }
    }
    $return = Array();
    $return['groupByDateResults'] = $resultsGroupByDate;
	$return['groupByModelResults'] = $resultsGroupByModel;
    $return['groupByDeviceResults'] = $resultsGroupByDevice;
    $return['groupByCountryResults'] = $resultsGroupByCountry;
    $return['groupByDistResults'] = $resultsGroupByDist;
    $return['groupByBranchResults'] = $resultsGroupByBranch;
    $return['start_time'] = $start_date;
    $return['end_time'] = $end_date;
    $json = json_encode($return);
*/
$json = '{"groupByDateResults":[{"count":161,"date":"2016-11-01"},{"count":159,"date":"2016-11-02"},{"count":152,"date":"2016-11-03"},{"count":167,"date":"2016-11-04"},{"count":156,"date":"2016-11-05"},{"count":137,"date":"2016-11-06"},{"count":124,"date":"2016-11-07"},{"count":135,"date":"2016-11-08"},{"count":153,"date":"2016-11-09"},{"count":129,"date":"2016-11-10"},{"count":119,"date":"2016-11-11"},{"count":113,"date":"2016-11-12"},{"count":110,"date":"2016-11-13"},{"count":139,"date":"2016-11-14"},{"count":151,"date":"2016-11-15"},{"count":125,"date":"2016-11-16"},{"count":128,"date":"2016-11-17"},{"count":112,"date":"2016-11-18"},{"count":145,"date":"2016-11-19"},{"count":134,"date":"2016-11-20"},{"count":124,"date":"2016-11-21"},{"count":109,"date":"2016-11-22"},{"count":120,"date":"2016-11-23"},{"count":137,"date":"2016-11-24"},{"count":124,"date":"2016-11-25"},{"count":147,"date":"2016-11-26"},{"count":88,"date":"2016-11-27"},{"count":113,"date":"2016-11-28"},{"count":98,"date":"2016-11-29"},{"count":139,"date":"2016-11-30"},{"count":131,"date":"2016-12-01"},{"count":147,"date":"2016-12-02"},{"count":170,"date":"2016-12-03"},{"count":117,"date":"2016-12-04"},{"count":151,"date":"2016-12-05"},{"count":124,"date":"2016-12-06"},{"count":118,"date":"2016-12-07"},{"count":108,"date":"2016-12-08"},{"count":130,"date":"2016-12-09"},{"count":156,"date":"2016-12-10"},{"count":109,"date":"2016-12-11"},{"count":157,"date":"2016-12-12"},{"count":158,"date":"2016-12-13"},{"count":150,"date":"2016-12-14"},{"count":110,"date":"2016-12-15"},{"count":135,"date":"2016-12-16"},{"count":139,"date":"2016-12-17"},{"count":97,"date":"2016-12-18"},{"count":139,"date":"2016-12-19"},{"count":246,"date":"2016-12-20"},{"count":244,"date":"2016-12-21"},{"count":313,"date":"2016-12-22"},{"count":284,"date":"2016-12-23"},{"count":236,"date":"2016-12-24"},{"count":179,"date":"2016-12-25"},{"count":208,"date":"2016-12-26"},{"count":191,"date":"2016-12-27"},{"count":180,"date":"2016-12-28"},{"count":171,"date":"2016-12-29"},{"count":183,"date":"2016-12-30"},{"count":168,"date":"2016-12-31"}],"groupByModelResults":{"MODEL2":[{"count":33,"date":"2016-11-01"},{"count":30,"date":"2016-11-02"},{"count":36,"date":"2016-11-03"},{"count":21,"date":"2016-11-04"},{"count":33,"date":"2016-11-05"},{"count":22,"date":"2016-11-06"},{"count":22,"date":"2016-11-07"},{"count":35,"date":"2016-11-08"},{"count":29,"date":"2016-11-09"},{"count":22,"date":"2016-11-10"},{"count":28,"date":"2016-11-11"},{"count":21,"date":"2016-11-12"},{"count":18,"date":"2016-11-13"},{"count":27,"date":"2016-11-14"},{"count":30,"date":"2016-11-15"},{"count":27,"date":"2016-11-16"},{"count":31,"date":"2016-11-17"},{"count":22,"date":"2016-11-18"},{"count":22,"date":"2016-11-19"},{"count":33,"date":"2016-11-20"},{"count":31,"date":"2016-11-21"},{"count":25,"date":"2016-11-22"},{"count":34,"date":"2016-11-23"},{"count":40,"date":"2016-11-24"},{"count":44,"date":"2016-11-25"},{"count":45,"date":"2016-11-26"},{"count":24,"date":"2016-11-27"},{"count":36,"date":"2016-11-28"},{"count":37,"date":"2016-11-29"},{"count":33,"date":"2016-11-30"},{"count":34,"date":"2016-12-01"},{"count":49,"date":"2016-12-02"},{"count":50,"date":"2016-12-03"},{"count":29,"date":"2016-12-04"},{"count":48,"date":"2016-12-05"},{"count":41,"date":"2016-12-06"},{"count":36,"date":"2016-12-07"},{"count":35,"date":"2016-12-08"},{"count":46,"date":"2016-12-09"},{"count":58,"date":"2016-12-10"},{"count":46,"date":"2016-12-11"},{"count":78,"date":"2016-12-12"},{"count":66,"date":"2016-12-13"},{"count":51,"date":"2016-12-14"},{"count":39,"date":"2016-12-15"},{"count":48,"date":"2016-12-16"},{"count":51,"date":"2016-12-17"},{"count":33,"date":"2016-12-18"},{"count":64,"date":"2016-12-19"},{"count":168,"date":"2016-12-20"},{"count":184,"date":"2016-12-21"},{"count":240,"date":"2016-12-22"},{"count":204,"date":"2016-12-23"},{"count":166,"date":"2016-12-24"},{"count":113,"date":"2016-12-25"},{"count":139,"date":"2016-12-26"},{"count":125,"date":"2016-12-27"},{"count":108,"date":"2016-12-28"},{"count":93,"date":"2016-12-29"},{"count":100,"date":"2016-12-30"},{"count":94,"date":"2016-12-31"}],"MODEL1":[{"count":108,"date":"2016-11-01"},{"count":102,"date":"2016-11-02"},{"count":91,"date":"2016-11-03"},{"count":121,"date":"2016-11-04"},{"count":86,"date":"2016-11-05"},{"count":89,"date":"2016-11-06"},{"count":76,"date":"2016-11-07"},{"count":83,"date":"2016-11-08"},{"count":93,"date":"2016-11-09"},{"count":74,"date":"2016-11-10"},{"count":73,"date":"2016-11-11"},{"count":70,"date":"2016-11-12"},{"count":73,"date":"2016-11-13"},{"count":80,"date":"2016-11-14"},{"count":98,"date":"2016-11-15"},{"count":76,"date":"2016-11-16"},{"count":72,"date":"2016-11-17"},{"count":69,"date":"2016-11-18"},{"count":98,"date":"2016-11-19"},{"count":84,"date":"2016-11-20"},{"count":79,"date":"2016-11-21"},{"count":66,"date":"2016-11-22"},{"count":73,"date":"2016-11-23"},{"count":78,"date":"2016-11-24"},{"count":64,"date":"2016-11-25"},{"count":83,"date":"2016-11-26"},{"count":47,"date":"2016-11-27"},{"count":70,"date":"2016-11-28"},{"count":45,"date":"2016-11-29"},{"count":73,"date":"2016-11-30"},{"count":75,"date":"2016-12-01"},{"count":77,"date":"2016-12-02"},{"count":91,"date":"2016-12-03"},{"count":66,"date":"2016-12-04"},{"count":78,"date":"2016-12-05"},{"count":60,"date":"2016-12-06"},{"count":61,"date":"2016-12-07"},{"count":48,"date":"2016-12-08"},{"count":62,"date":"2016-12-09"},{"count":69,"date":"2016-12-10"},{"count":55,"date":"2016-12-11"},{"count":47,"date":"2016-12-12"},{"count":74,"date":"2016-12-13"},{"count":78,"date":"2016-12-14"},{"count":57,"date":"2016-12-15"},{"count":52,"date":"2016-12-16"},{"count":64,"date":"2016-12-17"},{"count":48,"date":"2016-12-18"},{"count":51,"date":"2016-12-19"},{"count":56,"date":"2016-12-20"},{"count":44,"date":"2016-12-21"},{"count":54,"date":"2016-12-22"},{"count":53,"date":"2016-12-23"},{"count":48,"date":"2016-12-24"},{"count":41,"date":"2016-12-25"},{"count":45,"date":"2016-12-26"},{"count":46,"date":"2016-12-27"},{"count":53,"date":"2016-12-28"},{"count":57,"date":"2016-12-29"},{"count":55,"date":"2016-12-30"},{"count":57,"date":"2016-12-31"}],"MODEL3":[{"count":20,"date":"2016-11-01"},{"count":26,"date":"2016-11-02"},{"count":25,"date":"2016-11-03"},{"count":25,"date":"2016-11-04"},{"count":37,"date":"2016-11-05"},{"count":26,"date":"2016-11-06"},{"count":26,"date":"2016-11-07"},{"count":17,"date":"2016-11-08"},{"count":31,"date":"2016-11-09"},{"count":33,"date":"2016-11-10"},{"count":18,"date":"2016-11-11"},{"count":22,"date":"2016-11-12"},{"count":19,"date":"2016-11-13"},{"count":32,"date":"2016-11-14"},{"count":22,"date":"2016-11-15"},{"count":21,"date":"2016-11-16"},{"count":24,"date":"2016-11-17"},{"count":20,"date":"2016-11-18"},{"count":24,"date":"2016-11-19"},{"count":16,"date":"2016-11-20"},{"count":14,"date":"2016-11-21"},{"count":18,"date":"2016-11-22"},{"count":13,"date":"2016-11-23"},{"count":18,"date":"2016-11-24"},{"count":16,"date":"2016-11-25"},{"count":18,"date":"2016-11-26"},{"count":16,"date":"2016-11-27"},{"count":7,"date":"2016-11-28"},{"count":15,"date":"2016-11-29"},{"count":29,"date":"2016-11-30"},{"count":21,"date":"2016-12-01"},{"count":17,"date":"2016-12-02"},{"count":23,"date":"2016-12-03"},{"count":22,"date":"2016-12-04"},{"count":21,"date":"2016-12-05"},{"count":21,"date":"2016-12-06"},{"count":16,"date":"2016-12-07"},{"count":18,"date":"2016-12-08"},{"count":18,"date":"2016-12-09"},{"count":24,"date":"2016-12-10"},{"count":7,"date":"2016-12-11"},{"count":27,"date":"2016-12-12"},{"count":17,"date":"2016-12-13"},{"count":17,"date":"2016-12-14"},{"count":8,"date":"2016-12-15"},{"count":27,"date":"2016-12-16"},{"count":19,"date":"2016-12-17"},{"count":13,"date":"2016-12-18"},{"count":19,"date":"2016-12-19"},{"count":17,"date":"2016-12-20"},{"count":11,"date":"2016-12-21"},{"count":18,"date":"2016-12-22"},{"count":22,"date":"2016-12-23"},{"count":18,"date":"2016-12-24"},{"count":20,"date":"2016-12-25"},{"count":21,"date":"2016-12-26"},{"count":14,"date":"2016-12-27"},{"count":16,"date":"2016-12-28"},{"count":17,"date":"2016-12-29"},{"count":24,"date":"2016-12-30"},{"count":15,"date":"2016-12-31"}],"MODEL4":[{"count":1,"date":"2016-11-02"},{"count":1,"date":"2016-11-17"},{"count":1,"date":"2016-11-18"},{"count":1,"date":"2016-11-19"},{"count":1,"date":"2016-11-20"},{"count":1,"date":"2016-11-24"},{"count":1,"date":"2016-11-26"},{"count":1,"date":"2016-11-27"},{"count":1,"date":"2016-11-29"},{"count":4,"date":"2016-11-30"},{"count":1,"date":"2016-12-01"},{"count":3,"date":"2016-12-02"},{"count":6,"date":"2016-12-03"},{"count":4,"date":"2016-12-05"},{"count":1,"date":"2016-12-06"},{"count":5,"date":"2016-12-07"},{"count":7,"date":"2016-12-08"},{"count":4,"date":"2016-12-09"},{"count":5,"date":"2016-12-10"},{"count":5,"date":"2016-12-12"},{"count":1,"date":"2016-12-13"},{"count":4,"date":"2016-12-14"},{"count":6,"date":"2016-12-15"},{"count":8,"date":"2016-12-16"},{"count":5,"date":"2016-12-17"},{"count":3,"date":"2016-12-18"},{"count":3,"date":"2016-12-19"},{"count":5,"date":"2016-12-20"},{"count":5,"date":"2016-12-21"},{"count":1,"date":"2016-12-22"},{"count":5,"date":"2016-12-23"},{"count":3,"date":"2016-12-24"},{"count":5,"date":"2016-12-25"},{"count":3,"date":"2016-12-26"},{"count":6,"date":"2016-12-27"},{"count":3,"date":"2016-12-28"},{"count":4,"date":"2016-12-29"},{"count":4,"date":"2016-12-30"},{"count":2,"date":"2016-12-31"}],"MODEL5":[{"count":1,"date":"2016-11-15"},{"count":1,"date":"2016-11-16"},{"count":1,"date":"2016-12-02"},{"count":1,"date":"2016-12-06"},{"count":1,"date":"2016-12-11"},{"count":2,"date":"2016-12-19"},{"count":1,"date":"2016-12-24"}]},"groupByDeviceResults":{"MODEL2(4G\/32G)":[{"count":33,"date":"2016-11-01"},{"count":28,"date":"2016-11-02"},{"count":36,"date":"2016-11-03"},{"count":18,"date":"2016-11-04"},{"count":33,"date":"2016-11-05"},{"count":21,"date":"2016-11-06"},{"count":19,"date":"2016-11-07"},{"count":35,"date":"2016-11-08"},{"count":29,"date":"2016-11-09"},{"count":22,"date":"2016-11-10"},{"count":28,"date":"2016-11-11"},{"count":21,"date":"2016-11-12"},{"count":16,"date":"2016-11-13"},{"count":26,"date":"2016-11-14"},{"count":28,"date":"2016-11-15"},{"count":25,"date":"2016-11-16"},{"count":30,"date":"2016-11-17"},{"count":22,"date":"2016-11-18"},{"count":22,"date":"2016-11-19"},{"count":31,"date":"2016-11-20"},{"count":31,"date":"2016-11-21"},{"count":25,"date":"2016-11-22"},{"count":33,"date":"2016-11-23"},{"count":40,"date":"2016-11-24"},{"count":44,"date":"2016-11-25"},{"count":44,"date":"2016-11-26"},{"count":23,"date":"2016-11-27"},{"count":36,"date":"2016-11-28"},{"count":37,"date":"2016-11-29"},{"count":32,"date":"2016-11-30"},{"count":33,"date":"2016-12-01"},{"count":46,"date":"2016-12-02"},{"count":48,"date":"2016-12-03"},{"count":26,"date":"2016-12-04"},{"count":46,"date":"2016-12-05"},{"count":41,"date":"2016-12-06"},{"count":34,"date":"2016-12-07"},{"count":34,"date":"2016-12-08"},{"count":46,"date":"2016-12-09"},{"count":57,"date":"2016-12-10"},{"count":46,"date":"2016-12-11"},{"count":76,"date":"2016-12-12"},{"count":64,"date":"2016-12-13"},{"count":50,"date":"2016-12-14"},{"count":39,"date":"2016-12-15"},{"count":48,"date":"2016-12-16"},{"count":51,"date":"2016-12-17"},{"count":32,"date":"2016-12-18"},{"count":62,"date":"2016-12-19"},{"count":163,"date":"2016-12-20"},{"count":181,"date":"2016-12-21"},{"count":238,"date":"2016-12-22"},{"count":202,"date":"2016-12-23"},{"count":161,"date":"2016-12-24"},{"count":113,"date":"2016-12-25"},{"count":137,"date":"2016-12-26"},{"count":121,"date":"2016-12-27"},{"count":108,"date":"2016-12-28"},{"count":90,"date":"2016-12-29"},{"count":99,"date":"2016-12-30"},{"count":93,"date":"2016-12-31"}],"MODEL1(3G\/32G)":[{"count":108,"date":"2016-11-01"},{"count":102,"date":"2016-11-02"},{"count":91,"date":"2016-11-03"},{"count":121,"date":"2016-11-04"},{"count":86,"date":"2016-11-05"},{"count":89,"date":"2016-11-06"},{"count":76,"date":"2016-11-07"},{"count":83,"date":"2016-11-08"},{"count":93,"date":"2016-11-09"},{"count":73,"date":"2016-11-10"},{"count":73,"date":"2016-11-11"},{"count":70,"date":"2016-11-12"},{"count":73,"date":"2016-11-13"},{"count":80,"date":"2016-11-14"},{"count":98,"date":"2016-11-15"},{"count":76,"date":"2016-11-16"},{"count":72,"date":"2016-11-17"},{"count":69,"date":"2016-11-18"},{"count":98,"date":"2016-11-19"},{"count":84,"date":"2016-11-20"},{"count":79,"date":"2016-11-21"},{"count":66,"date":"2016-11-22"},{"count":73,"date":"2016-11-23"},{"count":78,"date":"2016-11-24"},{"count":64,"date":"2016-11-25"},{"count":82,"date":"2016-11-26"},{"count":47,"date":"2016-11-27"},{"count":70,"date":"2016-11-28"},{"count":45,"date":"2016-11-29"},{"count":73,"date":"2016-11-30"},{"count":75,"date":"2016-12-01"},{"count":77,"date":"2016-12-02"},{"count":91,"date":"2016-12-03"},{"count":65,"date":"2016-12-04"},{"count":78,"date":"2016-12-05"},{"count":59,"date":"2016-12-06"},{"count":61,"date":"2016-12-07"},{"count":48,"date":"2016-12-08"},{"count":61,"date":"2016-12-09"},{"count":68,"date":"2016-12-10"},{"count":55,"date":"2016-12-11"},{"count":47,"date":"2016-12-12"},{"count":74,"date":"2016-12-13"},{"count":78,"date":"2016-12-14"},{"count":57,"date":"2016-12-15"},{"count":52,"date":"2016-12-16"},{"count":64,"date":"2016-12-17"},{"count":48,"date":"2016-12-18"},{"count":51,"date":"2016-12-19"},{"count":56,"date":"2016-12-20"},{"count":44,"date":"2016-12-21"},{"count":54,"date":"2016-12-22"},{"count":53,"date":"2016-12-23"},{"count":48,"date":"2016-12-24"},{"count":40,"date":"2016-12-25"},{"count":45,"date":"2016-12-26"},{"count":46,"date":"2016-12-27"},{"count":53,"date":"2016-12-28"},{"count":56,"date":"2016-12-29"},{"count":55,"date":"2016-12-30"},{"count":57,"date":"2016-12-31"}],"MODEL3(4G\/64G)":[{"count":20,"date":"2016-11-01"},{"count":26,"date":"2016-11-02"},{"count":25,"date":"2016-11-03"},{"count":25,"date":"2016-11-04"},{"count":37,"date":"2016-11-05"},{"count":26,"date":"2016-11-06"},{"count":26,"date":"2016-11-07"},{"count":17,"date":"2016-11-08"},{"count":31,"date":"2016-11-09"},{"count":33,"date":"2016-11-10"},{"count":18,"date":"2016-11-11"},{"count":22,"date":"2016-11-12"},{"count":19,"date":"2016-11-13"},{"count":32,"date":"2016-11-14"},{"count":22,"date":"2016-11-15"},{"count":21,"date":"2016-11-16"},{"count":24,"date":"2016-11-17"},{"count":20,"date":"2016-11-18"},{"count":24,"date":"2016-11-19"},{"count":16,"date":"2016-11-20"},{"count":14,"date":"2016-11-21"},{"count":18,"date":"2016-11-22"},{"count":13,"date":"2016-11-23"},{"count":18,"date":"2016-11-24"},{"count":16,"date":"2016-11-25"},{"count":18,"date":"2016-11-26"},{"count":16,"date":"2016-11-27"},{"count":7,"date":"2016-11-28"},{"count":15,"date":"2016-11-29"},{"count":29,"date":"2016-11-30"},{"count":21,"date":"2016-12-01"},{"count":17,"date":"2016-12-02"},{"count":23,"date":"2016-12-03"},{"count":22,"date":"2016-12-04"},{"count":21,"date":"2016-12-05"},{"count":21,"date":"2016-12-06"},{"count":16,"date":"2016-12-07"},{"count":18,"date":"2016-12-08"},{"count":18,"date":"2016-12-09"},{"count":24,"date":"2016-12-10"},{"count":7,"date":"2016-12-11"},{"count":27,"date":"2016-12-12"},{"count":17,"date":"2016-12-13"},{"count":17,"date":"2016-12-14"},{"count":8,"date":"2016-12-15"},{"count":27,"date":"2016-12-16"},{"count":19,"date":"2016-12-17"},{"count":13,"date":"2016-12-18"},{"count":19,"date":"2016-12-19"},{"count":17,"date":"2016-12-20"},{"count":11,"date":"2016-12-21"},{"count":18,"date":"2016-12-22"},{"count":22,"date":"2016-12-23"},{"count":18,"date":"2016-12-24"},{"count":20,"date":"2016-12-25"},{"count":21,"date":"2016-12-26"},{"count":14,"date":"2016-12-27"},{"count":16,"date":"2016-12-28"},{"count":17,"date":"2016-12-29"},{"count":24,"date":"2016-12-30"},{"count":15,"date":"2016-12-31"}],"MODEL2(2G\/32G)":[{"count":2,"date":"2016-11-02"},{"count":3,"date":"2016-11-04"},{"count":1,"date":"2016-11-06"},{"count":3,"date":"2016-11-07"},{"count":2,"date":"2016-11-13"},{"count":1,"date":"2016-11-14"},{"count":2,"date":"2016-11-15"},{"count":2,"date":"2016-11-16"},{"count":1,"date":"2016-11-17"},{"count":2,"date":"2016-11-20"},{"count":1,"date":"2016-11-23"},{"count":1,"date":"2016-11-26"},{"count":1,"date":"2016-11-27"},{"count":1,"date":"2016-11-30"},{"count":1,"date":"2016-12-01"},{"count":3,"date":"2016-12-02"},{"count":2,"date":"2016-12-03"},{"count":3,"date":"2016-12-04"},{"count":2,"date":"2016-12-05"},{"count":2,"date":"2016-12-07"},{"count":1,"date":"2016-12-08"},{"count":1,"date":"2016-12-10"},{"count":2,"date":"2016-12-12"},{"count":2,"date":"2016-12-13"},{"count":1,"date":"2016-12-14"},{"count":1,"date":"2016-12-18"},{"count":2,"date":"2016-12-19"},{"count":5,"date":"2016-12-20"},{"count":3,"date":"2016-12-21"},{"count":2,"date":"2016-12-22"},{"count":2,"date":"2016-12-23"},{"count":5,"date":"2016-12-24"},{"count":2,"date":"2016-12-26"},{"count":4,"date":"2016-12-27"},{"count":3,"date":"2016-12-29"},{"count":1,"date":"2016-12-30"},{"count":1,"date":"2016-12-31"}],"MODEL4(6G\/64G)":[{"count":1,"date":"2016-11-02"},{"count":1,"date":"2016-11-17"},{"count":1,"date":"2016-11-18"},{"count":1,"date":"2016-11-19"},{"count":1,"date":"2016-11-20"},{"count":1,"date":"2016-11-24"},{"count":1,"date":"2016-11-26"},{"count":1,"date":"2016-11-27"},{"count":1,"date":"2016-11-29"},{"count":3,"date":"2016-11-30"},{"count":2,"date":"2016-12-02"},{"count":3,"date":"2016-12-03"},{"count":2,"date":"2016-12-05"},{"count":1,"date":"2016-12-06"},{"count":3,"date":"2016-12-07"},{"count":4,"date":"2016-12-08"},{"count":3,"date":"2016-12-09"},{"count":3,"date":"2016-12-10"},{"count":3,"date":"2016-12-12"},{"count":1,"date":"2016-12-13"},{"count":1,"date":"2016-12-14"},{"count":4,"date":"2016-12-15"},{"count":3,"date":"2016-12-16"},{"count":2,"date":"2016-12-17"},{"count":1,"date":"2016-12-18"},{"count":2,"date":"2016-12-19"},{"count":2,"date":"2016-12-20"},{"count":3,"date":"2016-12-21"},{"count":3,"date":"2016-12-23"},{"count":1,"date":"2016-12-24"},{"count":2,"date":"2016-12-25"},{"count":1,"date":"2016-12-26"},{"count":4,"date":"2016-12-27"},{"count":3,"date":"2016-12-28"},{"count":3,"date":"2016-12-29"},{"count":3,"date":"2016-12-30"},{"count":2,"date":"2016-12-31"}],"MODEL1(4G\/64G)":[{"count":1,"date":"2016-11-10"},{"count":1,"date":"2016-11-26"},{"count":1,"date":"2016-12-04"},{"count":1,"date":"2016-12-06"},{"count":1,"date":"2016-12-09"},{"count":1,"date":"2016-12-10"},{"count":1,"date":"2016-12-25"},{"count":1,"date":"2016-12-29"}],"MODEL5(4G\/64G)":[{"count":1,"date":"2016-11-15"},{"count":1,"date":"2016-11-16"},{"count":1,"date":"2016-12-02"},{"count":1,"date":"2016-12-06"},{"count":1,"date":"2016-12-11"},{"count":2,"date":"2016-12-19"},{"count":1,"date":"2016-12-24"}],"MODEL4(6G\/256G)":[{"count":1,"date":"2016-11-30"},{"count":1,"date":"2016-12-01"},{"count":1,"date":"2016-12-02"},{"count":3,"date":"2016-12-03"},{"count":2,"date":"2016-12-05"},{"count":2,"date":"2016-12-07"},{"count":3,"date":"2016-12-08"},{"count":1,"date":"2016-12-09"},{"count":2,"date":"2016-12-10"},{"count":2,"date":"2016-12-12"},{"count":3,"date":"2016-12-14"},{"count":2,"date":"2016-12-15"},{"count":5,"date":"2016-12-16"},{"count":3,"date":"2016-12-17"},{"count":2,"date":"2016-12-18"},{"count":1,"date":"2016-12-19"},{"count":3,"date":"2016-12-20"},{"count":2,"date":"2016-12-21"},{"count":1,"date":"2016-12-22"},{"count":2,"date":"2016-12-23"},{"count":2,"date":"2016-12-24"},{"count":3,"date":"2016-12-25"},{"count":2,"date":"2016-12-26"},{"count":2,"date":"2016-12-27"},{"count":1,"date":"2016-12-29"},{"count":1,"date":"2016-12-30"}]},"groupByCountryResults":{"IND":[{"count":161,"date":"2016-11-01"},{"count":159,"date":"2016-11-02"},{"count":152,"date":"2016-11-03"},{"count":167,"date":"2016-11-04"},{"count":156,"date":"2016-11-05"},{"count":137,"date":"2016-11-06"},{"count":124,"date":"2016-11-07"},{"count":135,"date":"2016-11-08"},{"count":153,"date":"2016-11-09"},{"count":129,"date":"2016-11-10"},{"count":119,"date":"2016-11-11"},{"count":113,"date":"2016-11-12"},{"count":110,"date":"2016-11-13"},{"count":139,"date":"2016-11-14"},{"count":151,"date":"2016-11-15"},{"count":125,"date":"2016-11-16"},{"count":128,"date":"2016-11-17"},{"count":112,"date":"2016-11-18"},{"count":145,"date":"2016-11-19"},{"count":134,"date":"2016-11-20"},{"count":124,"date":"2016-11-21"},{"count":109,"date":"2016-11-22"},{"count":120,"date":"2016-11-23"},{"count":137,"date":"2016-11-24"},{"count":124,"date":"2016-11-25"},{"count":147,"date":"2016-11-26"},{"count":88,"date":"2016-11-27"},{"count":113,"date":"2016-11-28"},{"count":98,"date":"2016-11-29"},{"count":139,"date":"2016-11-30"},{"count":131,"date":"2016-12-01"},{"count":147,"date":"2016-12-02"},{"count":170,"date":"2016-12-03"},{"count":117,"date":"2016-12-04"},{"count":151,"date":"2016-12-05"},{"count":124,"date":"2016-12-06"},{"count":118,"date":"2016-12-07"},{"count":108,"date":"2016-12-08"},{"count":130,"date":"2016-12-09"},{"count":156,"date":"2016-12-10"},{"count":109,"date":"2016-12-11"},{"count":157,"date":"2016-12-12"},{"count":158,"date":"2016-12-13"},{"count":150,"date":"2016-12-14"},{"count":110,"date":"2016-12-15"},{"count":135,"date":"2016-12-16"},{"count":139,"date":"2016-12-17"},{"count":97,"date":"2016-12-18"},{"count":139,"date":"2016-12-19"},{"count":246,"date":"2016-12-20"},{"count":244,"date":"2016-12-21"},{"count":313,"date":"2016-12-22"},{"count":284,"date":"2016-12-23"},{"count":236,"date":"2016-12-24"},{"count":179,"date":"2016-12-25"},{"count":208,"date":"2016-12-26"},{"count":191,"date":"2016-12-27"},{"count":180,"date":"2016-12-28"},{"count":171,"date":"2016-12-29"},{"count":183,"date":"2016-12-30"},{"count":168,"date":"2016-12-31"}]},"groupByDistResults":[],"groupByBranchResults":[],"start_time":"2016-11-01","end_time":"2016-12-31"}';
    echo htmlspecialchars($json);

//     $now = new DateTime(null,new DateTimeZone('Asia/Taipei'));
//     echo "<br>-----------<br>".$now->format('Y-m-d H:i:s')."<br>-----------<br>";

?>