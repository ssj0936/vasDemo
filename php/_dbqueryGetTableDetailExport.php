<?php
    ini_set("max_execution_time", 0);

    require_once("DBconfig.php");
    require_once("DBclass.php");
    require_once("function.php");
    $results = array();
    $db = new DB();
    
    $firstTable = '';
    $secondTable = '';
    $thirdTable = '';

//    $now = new DateTime(null,new DateTimeZone('Asia/Taipei'));
//    echo "<br>-----------<br>".$now->format('Y-m-d H:i:s')."<br>-----------<br>";
//    $color = '["all"]';
//    $cpu = '["all"]';
//    $rearCamera = '["all"]';
//    $frontCamera = '["all"]';
//    $dataset = 'activation';
//    $from = "2017-03-02";
//    $to = "2017-03-30";    
//    $iso ='["IDN","IND","TWN"]';
//    $data = '[{"model":"ZENFONE","devices":"ZENFONE","product":"ZENFONE","datatype":"product"}]';
//    $permission = '{"":["AK","AX","AZ","NP"]}';

    $color = $_POST['color'];
    $cpu = $_POST['cpu'];
    $rearCamera = $_POST['rearCamera'];
    $frontCamera = $_POST['frontCamera'];
    $dataset = 'activation';
    $from = $_POST['from'];
    $to = $_POST['to'];
    $data = $_POST['data'];
    $iso = $_POST['iso'];
    $permission = $_POST['permission'];

    $countryArray = array();

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
            
        
        //first table:
        //by branch or 1st level
        //-----------------------------------------------------------------------------------------
		$fromTableStr='';
		for($i=0;$i<count($isoObj);++$i){
            
            if(!$isFullPermission){
                $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                if(!$result['queryable']) continue;
            }
            
            //group by granch
            if(in_array($isoObj[$i],$gapSupportedCountries)){
                $getLevelQuery = "SELECT loc_level FROM $branchLocLevelTable WHERE iso='$isoObj[$i]'";
                $db->query($getLevelQuery);
                $row = $db->fetch_array();
                $level = intval($row['loc_level']);
                $table = $_DB['activation']['dbnameRegionL'.$level].'.dbo.'.$isoObj[$i];
                
                $tmpFromTableStr="SELECT (SELECT NAME_0 FROM $countryDataOnMap WHERE iso='$isoObj[$i]')country,branchName name,sum(count)count,date"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$table A1,"
                        ."$deviceTable device_model,"
                        ."$regionTam mappingtable "

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        ." AND A1.map_id = mappingtable.mapid"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." group by branchName,date ";
            }else{
                $table = $_DB['activation']['dbnameRegionL1'].'.dbo.'.$isoObj[$i];
                
                $tmpFromTableStr="SELECT (SELECT NAME_0 FROM $countryDataOnMap WHERE iso='$isoObj[$i]')country ,mappingtable.name,sum(count)count,date"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$table A1,"
                        ."$deviceTable device_model,"
                        ."$nameToMapidL1 mappingtable "

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        ." AND A1.map_id = mappingtable.mapid"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." group by name,date ";
            }

			if(strlen($fromTableStr)==0){
                $fromTableStr .= $tmpFromTableStr;
            }
            else{
                $fromTableStr.=(" UNION ALL ".$tmpFromTableStr);
            }
		}
		
		$queryStr = $fromTableStr." order by country,name,date";
//		echo $queryStr."<br><br><br>";
        
		$db->query($queryStr);
        
        $max_time = null;
        $min_time = null;
        
        
		while($row = $db->fetch_array())
		{
            $results[$row['country']][$row['name']][$row['date']] = $row['count'];
            if($min_time == null)
                    $min_time = $row['date'];

            if($max_time == null)
                $max_time = $row['date'];

            if(strtotime($max_time)<strtotime($row['date']))
                    $max_time = $row['date'];
            if(strtotime($min_time)>strtotime($row['date']))
                    $min_time = $row['date'];
		}
        
        $countryMerge = array();
        
        $finalTable = array();
        $lastDayActivation = array();
        foreach($results as $country => $arr){

            //get TAM
            $db->query("SELECT * FROM $branchLocLevelTable A1,$branchTam A2 WHERE A1.iso = A2.iso AND Country = '$country'");
            $row = $db->fetch_array();
            $fileStr = hex2bin($row['hexcode']);
            $present = $row['tam_spec'];
            $file = explode("\r\n",$fileStr);
            $tam = array();
            $totalTam = 0;
            foreach($file as $val){
                $str = $val;
                $val = str_replace("\r", '', $val);
                $val = str_replace("\n", '', $val);
                $split = explode(',', $val);

                $branchName = strtoupper($split[0]);
                if ($present == 'number') {
                    $tam[$branchName] = intval($split[1]);
                    $totalTam += intval($split[1]);
                } else if ($present == 'percent') {
                    $tam[$branchName] = intval($split[1])/100;
                }
            }
            if($present == 'number'){
                foreach($tam as &$val){
                    $val = ($val/$totalTam);
                }
            }
//            print_r($tam);
            foreach($arr as $name =>$dataArr){
                $row = array();
                $row['country'] = $country;
                $row['branchDivision'] = str_replace('_',' ',$name);
                $row['tamShare'] = isset($tam[strtoupper($name)]) ? sprintf('%E', ($tam[strtoupper($name)])) : '';
                $row['daTargetShare'] = '';
                $row['daLastdayShare'] = '';
                $row['daTarget'] = '';
                $row['da'] =array();
                $current_time = $min_time;
                while(strtotime($max_time) >= strtotime($current_time)){
                    //echo $row['da'][date('Y-m-d', strtotime($current_time))]."<br><br>";
                    $row['da'][date('Y-m-d', strtotime($current_time))] = (isset($dataArr[date('Y-m-d', strtotime($current_time))])) ? $dataArr[date('Y-m-d', strtotime($current_time))] : 0;
                    $current_time = date('Y-m-d', strtotime($current_time. ' + 1 days'));
                }
                $lastDayActivation[$country] = (isset($lastDayActivation[$country])) ? $lastDayActivation[$country]+$row['da'][$max_time] :0+$row['da'][$max_time];
                $finalTable[] = $row;
                
                //record merge
                $countryMerge[$country] = isset($countryMerge[$country]) ? $countryMerge[$country]+1 : 1;
            }
        }
        
        //daLastdayShare
        foreach($finalTable as &$data){
            $data['daLastdayShare'] = sprintf('%E', ($lastDayActivation[$data['country']]==0 ? 0 : $data['da'][$max_time]/$lastDayActivation[$data['country']]));
        }
    }
    
//    print_r($countryMerge);

    $index = array('country','branchDivision','tamShare','daTargetShare','daLastdayShare','daTarget');
    $indexN = array('Country','Branch / 1st-level division','TAM share (%)','DA Target share (%)','DA ('.$max_time.') Share (%)','DA Target');
    //s69 = title style
    //s77 = normal style
    //s76
    $percentWithoutJibaiStyle = array('tamShare');
    //s67
    $percentWithJibaiStyle = array('daTargetShare','daLastdayShare');
    //s66
    $jibaiStyleIndex = array('daTarget');

    $firstTable.= "<table>";
    $firstTable.= "<tr>";
    foreach($indexN as $val){
        $firstTable.= '<th data-style="s69">'.$val.'</th>';
    }
    $dateArray = array();

    $current_time = $max_time;
    while(strtotime($min_time) <= strtotime($current_time)){
        //$firstTable.= $row['da'][date('Y-m-d', strtotime($current_time))]."<br><br>";
        $firstTable.= '<th data-style="s69">'.date('Y-m-d', strtotime($current_time)).'</th>';
        $dateArray[] = date('Y-m-d', strtotime($current_time));
        $current_time = date('Y-m-d', strtotime($current_time. ' - 1 days'));
    }
    $currentCountry = null;
    $nextNeedToSetIndex = false;
    foreach($finalTable as $dataval){
        $firstTable.= '<tr>';    
        foreach($index as $indexname){
            if($indexname == 'country'){
                if($currentCountry != $dataval[$indexname]){
                    $currentCountry = $dataval[$indexname];
                    $merge = $countryMerge[$dataval[$indexname]]-1;
                    $firstTable.= '<td data-merge="'.$merge.'" data-style="s77">'.$dataval[$indexname].'</td>';    
                    $nextNeedToSetIndex = false;
                }
                else
                    $firstTable.= '<td data-needhide="1" data-style="s77"></td>';
            }
            else{
                //format number
                if($indexname != 'branchDivision'){
                    if(in_array($indexname,$percentWithoutJibaiStyle)){
                        if($dataval[$indexname]=='')
                            $firstTable.= '<td data-style="s77">'.$dataval[$indexname].'</td>';
                        else
                            $firstTable.= '<td data-type = "Number" data-style="s76">'.$dataval[$indexname].'</td>';
                    }
                    else if(in_array($indexname,$percentWithJibaiStyle)){
                        if($dataval[$indexname]=='')
                            $firstTable.= '<td data-style="s66">'.$dataval[$indexname].'</td>';
                        else
                            $firstTable.= '<td data-type = "Number" data-style="s67">'.$dataval[$indexname].'</td>';
                    }
                    else if(in_array($indexname,$jibaiStyleIndex)){
                        if($dataval[$indexname]=='')
                            $firstTable.= '<td data-style="s66">'.$dataval[$indexname].'</td>';
                        else
                            $firstTable.= '<td data-type = "Number" data-style="s66">'.$dataval[$indexname].'</td>';
                    }
                }
                //format string
                else{
                    if($nextNeedToSetIndex)
                        $firstTable.= '<td data-index="2" data-style="s77">'.$dataval[$indexname].'</td>';
                    else{
                        $firstTable.= '<td data-style="s77">'.$dataval[$indexname].'</td>';
                        $nextNeedToSetIndex = true;
                    }
                }
            }
        }
        
        foreach($dateArray as $dateIndex){
            $firstTable.= '<td data-type = "Number" data-style="s66">'.$dataval['da'][$dateIndex].'</td>';
        }
        $firstTable.= '</tr>';
    }
    $firstTable.= "</table>";
    
    //second table:
    //by lower level
    //-----------------------------------------------------------------------------------------
    $fromTableStr='';
		for($i=0;$i<count($isoObj);++$i){
            
            if(!$isFullPermission){
                $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                if(!$result['queryable']) continue;
            }
            
            //group by granch
            if(in_array($isoObj[$i],$gapSupportedCountries)){
                $getLevelQuery = "SELECT loc_level FROM $branchLocLevelTable WHERE iso='$isoObj[$i]'";
                $db->query($getLevelQuery);
                $row = $db->fetch_array();
                $level = intval($row['loc_level']);
                $table = $_DB['activation']['dbnameRegionL'.$level].'.dbo.'.$isoObj[$i];
                
                $tmpFromTableStr="SELECT (SELECT NAME_0 FROM $countryDataOnMap WHERE iso='$isoObj[$i]')country,branchName parentName,name2 name,sum(count)count,date"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$table A1,"
                        ."$deviceTable device_model,"
                        ."$regionTam mappingtable "

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        ." AND A1.map_id = mappingtable.mapid"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." group by branchName,name2,date ";
            }else{
                $table = $_DB['activation']['dbnameRegionL2'].'.dbo.'.$isoObj[$i];

                $tmpFromTableStr="SELECT (SELECT NAME_0 FROM $countryDataOnMap WHERE iso='$isoObj[$i]')country ,mappingtable.parentName,mappingtable.name,sum(count)count,date"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$table A1,"
                        ."$deviceTable device_model,"
                        ."$nameToMapidL2 mappingtable "

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        ." AND A1.map_id = mappingtable.mapid"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." group by parentName,name,date";
            }

			if(strlen($fromTableStr)==0){
                $fromTableStr .= $tmpFromTableStr;
            }
            else{
                $fromTableStr.=(" UNION ALL ".$tmpFromTableStr);
            }
		}
		
		$queryStr = $fromTableStr." order by country,parentName,name,date";
//		echo $queryStr."<br><br><br>";
		
		$db->query($queryStr);
        
        $max_time = null;
        $min_time = null;
        
        
		while($row = $db->fetch_array())
		{
            $results2[$row['country']][$row['parentName']][$row['name']][$row['date']] = $row['count'];
            if($min_time == null)
                    $min_time = $row['date'];

            if($max_time == null)
                $max_time = $row['date'];

            if(strtotime($max_time)<strtotime($row['date']))
                    $max_time = $row['date'];
            
            if(strtotime($min_time)>strtotime($row['date']))
                    $min_time = $row['date'];
		}
        $countryMerge = array();
        $secondLevelMerge = array();
        $finalTable = array();
        $branchLastDayActivation = array();
        foreach($results2 as $country => $arr){
            foreach($arr as $parentName =>$arr2){
                foreach($arr2 as $name =>$dataArr){
                    $row = array();
                    $row['country'] = $country;
                    $row['branchDivision'] = str_replace('_',' ',$parentName);
                    $row['daLastday'] = 0;
                    $row['2ndLevelDivision'] = str_replace('_',' ',$name);
                    $row['da'] =array();
                    $current_time = $min_time;
                    while(strtotime($max_time) >= strtotime($current_time)){
                        //echo $row['da'][date('Y-m-d', strtotime($current_time))]."<br><br>";
                        $row['da'][date('Y-m-d', strtotime($current_time))] = (isset($dataArr[date('Y-m-d', strtotime($current_time))])) ? $dataArr[date('Y-m-d', strtotime($current_time))] : 0;
                        $current_time = date('Y-m-d', strtotime($current_time. ' + 1 days'));
                    }
                    
                    //last day record(branch)
                    $branchLastDayActivation[$row['branchDivision']] = (isset($branchLastDayActivation[$row['branchDivision']])) ? $branchLastDayActivation[$row['branchDivision']]+$row['da'][$max_time] :0+$row['da'][$max_time];
                    $finalTable[] = $row;
                    
                    //record merge
                    $countryMerge[$country] = isset($countryMerge[$country]) ? $countryMerge[$country]+1 : 1;
                    $secondLevelMerge[$country][$row['branchDivision']] = isset($secondLevelMerge[$country][$row['branchDivision']]) ? $secondLevelMerge[$country][$row['branchDivision']]+1 : 1;
                }
            }
        }
//        print_r($countryMerge);
//        echo "<br><br>";
//        print_r($secondLevelMerge);

        //daLastday
        foreach($finalTable as &$data){
            $data['daLastday'] = $branchLastDayActivation[$data['branchDivision']];
        }
    
    $index = array('country','branchDivision','daLastday','2ndLevelDivision');
    $indexN = array('Country','Branch / 1st-level division','DA ('.$max_time.')','1st / 2nd-level division');

    $secondTable.= "<table>";
    $secondTable.= "<tr>";
    foreach($indexN as $val){
        $secondTable.= '<th data-style="s69">'.$val.'</th>';
    }
    $dateArray = array();

    $current_time = $max_time;
    while(strtotime($min_time) <= strtotime($current_time)){
        //echo $row['da'][date('Y-m-d', strtotime($current_time))]."<br><br>";
        $secondTable.= '<th data-style="s69">'.date('Y-m-d', strtotime($current_time)).'</th>';
        $dateArray[] = date('Y-m-d', strtotime($current_time));
        $current_time = date('Y-m-d', strtotime($current_time. ' - 1 days'));
    }
    $currentCountry = null;
    $currentBranch = null;
    $needToFillInData = false;

    $thisLinecountryMerge = false;
    $thisLinesecondMerge = false;
    foreach($finalTable as $dataval){
        $secondTable.= '<tr>';
        
        foreach($index as $indexname){
            if($indexname == 'country'){
                if($currentCountry != $dataval[$indexname]){
                    $currentCountry = $dataval[$indexname];
                    $merge = $countryMerge[$currentCountry]-1;
//                    echo $merge."/";
                    if($merge != 0){
                        $secondTable.= '<td data-merge="'.$merge.'" data-style="s77">'.$dataval[$indexname].'</td>';
                        $thisLinecountryMerge = false;
                    }else{
                        $secondTable.= '<td data-style="s77">'.$dataval[$indexname].'</td>';
                        $thisLinecountryMerge = false;
                    }
                }
                else{
                    $secondTable.= '<td data-needhide="1" data-style="s77"></td>';
                    $thisLinecountryMerge = true;
                }
            }
            else if($indexname == 'branchDivision'){
                if($currentBranch != $dataval[$indexname]){
                    $currentBranch = $dataval[$indexname];
                    $needToFillInData =true;
                    
                    $indexStr = '';
                    if($thisLinecountryMerge)
                        $indexStr = 'data-index="2"';
                    
                    $merge = $secondLevelMerge[$currentCountry][$dataval[$indexname]]-1;
                    if($merge != 0){
                        $secondTable.= "<td $indexStr data-merge='$merge' data-style='s77'>".$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }else{
                        $secondTable.= "<td $indexStr data-style='s77'>".$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }
                }
                else{
                    $secondTable.= '<td data-needhide="1" data-style="s77"></td>';
                    $thisLinesecondMerge = true;
                }
            }
            else if($indexname == 'daLastday'){
                if($needToFillInData){
                    
                    //$merge = $secondLevelMerge[$dataval[$indexname]]-1;
                    if($merge != 0){
                        $secondTable.= '<td data-merge="'.$merge.'" data-style="s77" data-type = "Number">'.$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }else{
                        $secondTable.= '<td data-style="s77" data-type = "Number">'.$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }
                    $needToFillInData = false;
                }
                else{
                    $secondTable.= '<td data-needhide="1" data-style="s77"></td>';
                    $thisLinesecondMerge = true;
                }
            }
            else{
                if($thisLinecountryMerge && $thisLinesecondMerge)
                    $secondTable.= '<td data-index="4" data-style="s77">'.$dataval[$indexname].'</td>';
                else
                    $secondTable.= '<td data-style="s77">'.$dataval[$indexname].'</td>';
            }
        }
        
        foreach($dateArray as $dateIndex){
            $secondTable.= '<td data-style="s77" data-type = "Number">'.$dataval['da'][$dateIndex].'</td>';
        }
        $secondTable.= '</tr>';
    }
    $secondTable.= "</table>";

    //third table:
    //by model
    //-----------------------------------------------------------------------------------------
    $query = "SELECT observed_model FROM $unpopularModel";
    $unpopularModelList = array();
    $db->query($query);
    while($row = $db->fetch_array()){
        $unpopularModelList[] = $row['observed_model'];
    }

    $fromTableStr='';
		for($i=0;$i<count($isoObj);++$i){
            
            if(!$isFullPermission){
                $result = permissionCheck($isFullPermission,$permissionObj,$isoObj[$i]);
                if(!$result['queryable']) continue;
            }
            
            $modelColumn = ($isFullPermission || $result['isFullPermissionThisIso']) ? 'model_name':'product.model_name';
            
            //group by granch
            if(in_array($isoObj[$i],$gapSupportedCountries)){
                $getLevelQuery = "SELECT loc_level FROM $branchLocLevelTable WHERE iso='$isoObj[$i]'";
                $db->query($getLevelQuery);
                $row = $db->fetch_array();
                $level = intval($row['loc_level']);
                $table = $_DB['activation']['dbnameRegionL'.$level].'.dbo.'.$isoObj[$i];
                $tmpFromTableStr="SELECT (SELECT NAME_0 FROM $countryDataOnMap WHERE iso='$isoObj[$i]')country,branchName name,$modelColumn,sum(count)count,date"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$table A1,"
                        ."$deviceTable device_model,"
                        ."$regionTam mappingtable "

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        ." AND A1.map_id = mappingtable.mapid"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." group by $modelColumn,branchName,date ";
            }else{
                $table = $_DB['activation']['dbnameRegionL1'].'.dbo.'.$isoObj[$i];
                
                $tmpFromTableStr="SELECT (SELECT NAME_0 FROM $countryDataOnMap WHERE iso='$isoObj[$i]')country ,mappingtable.name,$modelColumn,sum(count)count,date"
                        ." FROM "
                        .($isColorAll ? "" : "$colorMappingTable A2,")
                        .($isCpuAll ? "" : "$cpuMappingTable A3,")
                        .($isFrontCameraAll ? "" : "$frontCameraMappingTable A4,")
                        .($isRearCameraAll ? "" : "$rearCameraMappingTable A5,")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : "(SELECT distinct product_id,model_name FROM $productIDTable) product,")
                        ."$table A1,"
                        ."$deviceTable device_model,"
                        ."$nameToMapidL1 mappingtable "

                        ." WHERE "
                        ."date BETWEEN '".$from."' AND '".$to."'"
                        ." AND A1.device = device_model.device_name"
                        ." AND A1.map_id = mappingtable.mapid"
                        .($isAll?"":" AND A1.product_id IN(".$str_in.")")
                        .($isColorAll ? "" : " AND A1.product_id = A2.PART_NO AND A2.SPEC_DESC IN(".$color_in.")")
                        .($isCpuAll ? "" : " AND A1.product_id = A3.PART_NO AND A3.SPEC_DESC IN(".$cpu_in.")")
                        .($isFrontCameraAll ? "" : " AND A1.product_id = A4.PART_NO AND A4.SPEC_DESC IN(".$frontCamera_in.")")
                        .($isRearCameraAll ? "" : " AND A1.product_id = A5.PART_NO AND A5.SPEC_DESC IN(".$rearCamera_in.")")
                        .(($isFullPermission || $result['isFullPermissionThisIso']) ? "" : " AND device_model.model_name = product.model_name AND product.product_id IN (".$result['permissionProductIDStr'].")")
                        ." group by $modelColumn,name,date ";
            }

			if(strlen($fromTableStr)==0){
                $fromTableStr .= $tmpFromTableStr;
            }
            else{
                $fromTableStr.=(" UNION ALL ".$tmpFromTableStr);
            }
		}
		
		$queryStr = $fromTableStr." order by country,model_name,name,date";
//		echo $queryStr."<br><br><br>";

		$db->query($queryStr);
        $max_time = null;
        $min_time = null;
        
        
		while($row = $db->fetch_array())
		{
            $results3[$row['country']][$row['name']][$row['model_name']][$row['date']] = $row['count'];
            if($min_time == null)
                    $min_time = $row['date'];

            if($max_time == null)
                $max_time = $row['date'];

            if(strtotime($max_time)<strtotime($row['date']))
                    $max_time = $row['date'];
            if(strtotime($min_time)>strtotime($row['date']))
                    $min_time = $row['date'];
		}
        
        $countryMerge = array();
        $secondLevelMerge = array();
        $finalTable = array();
        $branchLastDayActivation = array();
        foreach($results3 as $country => $arr){
            foreach($arr as $name =>$arr2){
                foreach($arr2 as $modelName =>$dataArr){
                    $row = array();
                    $row['country'] = $country;
                    $row['branchDivision'] = str_replace('_',' ',$name);
                    $row['daLastDay'] = 0;
                    $row['modelName'] = $modelName;
                    $row['da'] =array();
                    $current_time = $min_time;
                    while(strtotime($max_time) >= strtotime($current_time)){
                        //echo $row['da'][date('Y-m-d', strtotime($current_time))]."<br><br>";
                        $row['da'][date('Y-m-d', strtotime($current_time))] = (isset($dataArr[date('Y-m-d', strtotime($current_time))])) ? $dataArr[date('Y-m-d', strtotime($current_time))] : 0;
                        $current_time = date('Y-m-d', strtotime($current_time. ' + 1 days'));
                    }
                    $branchLastDayActivation[$row['branchDivision']] = (isset($branchLastDayActivation[$row['branchDivision']])) ? $branchLastDayActivation[$row['branchDivision']]+$row['da'][$max_time] :0+$row['da'][$max_time];
                    $finalTable[] = $row;
                    
                    //record merge
                    $countryMerge[$country] = isset($countryMerge[$country]) ? $countryMerge[$country]+1 : 1;
                    $secondLevelMerge[$country][$row['branchDivision']] = isset($secondLevelMerge[$country][$row['branchDivision']]) ? $secondLevelMerge[$country][$row['branchDivision']]+1 : 1;
                }
            }
        }
        
        //daLastdayShare
        foreach($finalTable as &$data){
            $data['daLastDay'] = $branchLastDayActivation[$data['branchDivision']];
        }
    
//print_r($countryMerge);
//echo "<br><br>";
//print_r($secondLevelMerge);
    
    $index = array('country','branchDivision','daLastDay','modelName');
    $indexN = array('Country','Branch / 1st-level division','DA ('.$max_time.')','Model Name');

    $thirdTable.= "<table>";
    $thirdTable.= "<tr>";
    foreach($indexN as $val){
        $thirdTable.= '<th data-style="s69">'.$val.'</th>';
    }
    $dateArray = array();

    $current_time = $max_time;
    while(strtotime($min_time) <= strtotime($current_time)){
        //echo $row['da'][date('Y-m-d', strtotime($current_time))]."<br><br>";
        $thirdTable.= '<th data-style="s69">'.date('Y-m-d', strtotime($current_time)).'</th>';
        $dateArray[] = date('Y-m-d', strtotime($current_time));
        $current_time = date('Y-m-d', strtotime($current_time. ' - 1 days'));
    }

    $thisLinecountryMerge = false;
    $thisLinesecondMerge = false;

    $currentCountry = null;
    $currentBranch = null;
    $currentBranchDa = null;
    $needToFillInData = false;
    foreach($finalTable as $dataval){
        $thirdTable.= '<tr>';
        
        foreach($index as $indexname){
            if($indexname == 'country'){
                if($currentCountry != $dataval[$indexname]){
                    $currentCountry = $dataval[$indexname];
                    
                    $merge = $countryMerge[$currentCountry]-1;
                    if($merge != 0){
                        $thirdTable.= '<td data-merge="'.$merge.'" data-style="s77">'.$dataval[$indexname].'</td>';   
                        $thisLinecountryMerge = false;
                    }else{
                        $thirdTable.= '<td data-style="s77">'.$dataval[$indexname].'</td>';
                        $thisLinecountryMerge = false;
                    }
                }
                else{
                    $thirdTable.= '<td data-needhide="1" data-style="s77"></td>';
                    $thisLinecountryMerge = true;
                }
            }
            else if($indexname == 'branchDivision'){
                if($currentBranch != $dataval[$indexname]){
                    $currentBranch = $dataval[$indexname];
                    $needToFillInData = true;
                    
                    $indexStr = '';
                    if($thisLinecountryMerge)
                        $indexStr = 'data-index="2"';
                    
                    $merge = $secondLevelMerge[$currentCountry][$dataval[$indexname]]-1;
                    if($merge != 0){
                        $thirdTable.= "<td $indexStr data-merge='$merge' data-style='s77'>".$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }else{
                        $thirdTable.= "<td $indexStr data-style='s77'>".$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }
                }
                else{
                    $thirdTable.= '<td data-needhide="1" data-style="s77"></td>';
                    $thisLinesecondMerge = true;
                }
            }
            else if($indexname == 'daLastDay'){
                if($needToFillInData){
                    //$merge = $secondLevelMerge[$dataval[$indexname]]-1;
                    if($merge != 0){
                        $thirdTable.= '<td data-merge="'.$merge.'" data-style="s77" data-type = "Number">'.$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }else{
                        $thirdTable.= '<td data-style="s77" data-type = "Number">'.$dataval[$indexname].'</td>';
                        $thisLinesecondMerge = false;
                    }
                    $needToFillInData = false;
                }
                else{
                    $thirdTable.= '<td data-needhide="1" data-style="s77"></td>';
                    $thisLinesecondMerge = true;
                }
            }
            else{
                $modelName = in_array($dataval[$indexname],$unpopularModelList) ? ($dataval[$indexname].'(*)') : $dataval[$indexname];                
                if($thisLinecountryMerge && $thisLinesecondMerge)
                    $thirdTable.= '<td data-index="4" data-style="s77">'.$modelName.'</td>';
                else
                    $thirdTable.= '<td data-style="s77">'.$modelName.'</td>';
            }
        }
        
        foreach($dateArray as $dateIndex){
            $thirdTable.= '<td data-style="s77" data-type = "Number">'.$dataval['da'][$dateIndex].'</td>';
        }
        $thirdTable.= '</tr>';
    }
    $thirdTable.= "</table>";
    
//    echo /*$firstTable.$secondTable.*/$thirdTable;
    echo htmlspecialchars($firstTable.$secondTable.$thirdTable);
    
function percentage($numerator , $denominator){
    if($denominator == 0) return '0%';
    return "".round(($numerator / $denominator) * 100,3)."%";
}
?>
