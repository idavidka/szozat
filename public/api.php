<?php
	header('Status: 200 OK', TRUE);
    header("Content-type: application/json");

    $httpOrigin = $_SERVER['HTTP_ORIGIN'];

    if (in_array($httpOrigin, array('http://szozat.idavid.hu','https://szozat.idavid.hu','http://localhost:3000', 'http://192.168.0.18:3000')))
    {  
        header("Access-Control-Allow-Origin: $httpOrigin");
        header("Access-Control-Allow-Headers: *");
    }

    function getStateFolder() {
        $dir = '../states/';

        if(!is_dir($dir)) {
            mkdir($dir);
        }

        return $dir;
    }

    function getFile($id) {
        $file = getStateFolder().$id.'.json';

        touch($file);

        $content = file_get_contents($file);

        return $content ? json_decode($content, true) : array();
    }

    function setFile($id, $content) {
        $file = getStateFolder().$id.'.json';

        return file_put_contents($file, json_encode($content, JSON_UNESCAPED_UNICODE));
    }

    function getAllStat($state = false) { 
        $files = glob(getStateFolder().'*'.'.json');

        $stats = array();

        for($i = 3; $i <= 9; $i++) {
            $stats[$i] = array(
                'totalGames' => 0,
                'gameFailed' => 0,
                'winDistribution' => array(),
            );
        }

        foreach($files as $file) {
            $content = file_get_contents($file);
            $content = $content ? json_decode($content, true) : null;
            if(is_array($content)) {
                foreach($content as $difficult => $stat) {
                    $stats[$difficult]['totalGames'] += $stat['totalGames'];
                    $stats[$difficult]['gameFailed'] += $stat['gameFailed'];
                    foreach($stat['winDistribution'] as $i => $distribution) {
                        $stats[$difficult]['winDistribution'][$i] = (isset($stats[$difficult]['winDistribution'][$i]) ? $stats[$difficult]['winDistribution'][$i] : 0) +(int)$distribution; 
                    }
                }
            }
        }

        return $stats;
    }

    if(isset($_POST['id']) && isset($_POST['state'])) {
        $id = $_POST['id'];
        $state = json_decode($_POST['state'], true);
        $file = getFile($id);
    

        if(setFile($id, $state)) {
            print json_encode($file, JSON_UNESCAPED_UNICODE);
            exit();
        }
    }  else if(isset($_GET['id']) && isset($_GET['state'])) {
        $state = getFile($_GET['id']);
        print json_encode($state, JSON_UNESCAPED_UNICODE);
        exit();
    } else if(isset($_GET['id']) && isset($_GET['global'])) {
        print json_encode(getAllStat(), JSON_UNESCAPED_UNICODE);
        exit();
    }

    header('Status: 400 Bad Request', TRUE);
    print json_encode(array('error' => 'malformed'), JSON_UNESCAPED_UNICODE);