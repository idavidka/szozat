<?php
	header('Status: 200 OK', TRUE);
    header("Content-type: application/json");

    $httpOrigin = $_SERVER['HTTP_ORIGIN'];

    if (in_array($httpOrigin, array('http://szozat.idavid.hu','https://szozat.idavid.hu','http://localhost:3000', 'http://192.168.0.18:3000')))
    {  
        header("Access-Control-Allow-Origin: $httpOrigin");
        header("Access-Control-Allow-Headers: *");
    }

    function getStatFolder() {
        $dir = '../stats/';

        if(!is_dir($dir)) {
            mkdir($dir);
        }

        return $dir;
    }

    function getFile($id, $state = false) {
        $file = getStatFolder().$id.($state ? '-state' : '-stat').'.json';

        touch($file);

        $content = file_get_contents($file);

        return $content ? json_decode($content, true) : array();
    }

    function setFile($id, $content, $state = false) {
        $file = getStatFolder().$id.($state ? '-state' : '-stat').'.json';

        return file_put_contents($file, json_encode($content, JSON_UNESCAPED_UNICODE));
    }

    function getAllStat($state = false) { 
        $files = glob(getStatFolder().'*'.($state ? '-state' : '-stat').'.json');

        $stats = array();

        for($i = 3; $i <= 9; $i++) {
            $stats[$i] = array(
                'totalCount' => 0,
                'failedCount' => 0,
                'distributions' => array(),
            );
        }

        foreach($files as $file) {
            $content = file_get_contents($file);
            $content = $content ? json_decode($content, true) : null;
            if(is_array($content)) {
                foreach($content as $difficult => $stat) {
                    $stats[$difficult]['totalCount'] += $stat['totalCount'];
                    $stats[$difficult]['failedCount'] += $stat['failedCount'];
                    foreach($stat['distributions'] as $i => $distribution) {
                        $stats[$difficult]['distributions'][$i] = (isset($stats[$difficult]['distributions'][$i]) ? $stats[$difficult]['distributions'][$i] : 0) +(int)$distribution; 
                    }
                }
            }
        }

        return $stats;
    }

    if(isset($_POST['id']) && isset($_POST['difficult'])&& isset($_POST['state'])) {
        $id = $_POST['id'];
        $difficult = (int)$_POST['difficult'];
        $state = json_decode($_POST['state'], true);
        $file = getFile($id, true);
        
        if(!isset($file['state'])) {
            $file['state'] = array();
        }

        if(!isset($file[$difficult])) {
            $file['state'][$difficult] = array();
        }

        $file['state'][$difficult] = $state;
        $file['difficulty'] = $difficult;

        if(setFile($id, $file,true)) {
            print json_encode($file, JSON_UNESCAPED_UNICODE);
            exit();
        }
    }  else if(isset($_GET['id']) && isset($_GET['state'])) {
        $state = getFile($_GET['id'], true);
        $state['stats'] = getFile($_GET['id']);
        print json_encode($state, JSON_UNESCAPED_UNICODE);
        exit();
    } else if(isset($_POST['id']) && isset($_POST['difficult']) && isset($_POST['totalCount']) && isset($_POST['failedCount']) && isset($_POST['distributions'])) {
        $id = $_POST['id'];
        $difficult = (int)$_POST['difficult'];
        $totalCount = (int)$_POST['totalCount'];
        $failedCount = (int)$_POST['failedCount'];
        $distributions = array();
        foreach(explode(',', $_POST['distributions']) as $distribution) {
            $distributions[] = (int)$distribution; 
        }

        if($difficult >= 3 && $difficult <= 9 && $totalCount > 0) {
            $file = getFile($id);
            if(!isset($file[$difficult])) {
                $file[$difficult] = array(
                    'totalCount' => 0,
                    'failedCount' => 0,
                    'distributions' => array(),
                );
            }

            // if($totalCount - 1 === $file[$difficult]['totalCount'] && 
            //     array_sum($distributions) === $totalCount - $failedCount &&
            //     ($failedCount - 1 === $file[$difficult]['failedCount'] || $failedCount === $file[$difficult]['failedCount'])){
                $file[$difficult]['totalCount'] = $totalCount;
                $file[$difficult]['failedCount'] = $failedCount;

                $old = $file[$difficult]['distributions'];
                foreach($distributions as $i => $distribution) {
                    $file[$difficult]['distributions'][$i] = (int)$distribution; 
                }

                if(setFile($id, $file)) {
                    print json_encode(getAllStat(), JSON_UNESCAPED_UNICODE);
                    exit();
                }
            // }
        }
    } else if(isset($_GET['id']) && isset($_GET['stat'])) {
        print json_encode(getAllStat(), JSON_UNESCAPED_UNICODE);
        exit();
    }

    header('Status: 400 Bad Request', TRUE);
    print json_encode(array('error' => 'malformed'), JSON_UNESCAPED_UNICODE);