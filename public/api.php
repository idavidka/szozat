<?php
	header('Status: 200 OK', TRUE);
    header("Content-type: application/json");

    $httpOrigin = $_SERVER['HTTP_ORIGIN'];

    if (in_array($httpOrigin, array('http://szozat.idavid.hu','https://szozat.idavid.hu','http://localhost:5000', 'http://192.168.0.18:5000')))
    {  
        header("Access-Control-Allow-Origin: $httpOrigin");
        header("Access-Control-Allow-Headers: *");
    }


    function getLegacyFolder() {
        $dir = '../stats/';

        if(!is_dir($dir)) {
            mkdir($dir);
        }

        return $dir;
    }

    function getStateFolder() {
        $dir = '../states/';

        if(!is_dir($dir)) {
            mkdir($dir);
        }

        return $dir;
    }


    function getLegacyFile($id, $state = false) {
        $file = getLegacyFolder().$id.($state ? '-state' : '-stat').'.json';

        touch($file);

        $content = file_get_contents($file);

        return $content ? json_decode($content, true) : array();
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

        $usedFiles = array();

        $stats = array();

        for($i = 3; $i <= 9; $i++) {
            $stats[$i] = array(
                'players' => 0,
                'totalGames' => 0,
                'gamesFailed' => 0,
                'winDistribution' => array(),
            );
        }

        foreach($files as $file) {
            $content = file_get_contents($file);
            $content = $content ? json_decode($content, true) : null;

            if(is_array($content)) {
                $usedFiles[] = basename($file);
                foreach($content['stats'] as $difficult => $stat) {
                    $stats[$difficult]['players'] += $stat['totalGames'] > 0 ? 1 : 0;
                    $stats[$difficult]['totalGames'] += $stat['totalGames'];
                    $stats[$difficult]['gamesFailed'] += $stat['gamesFailed'];
                    foreach($stat['winDistribution'] as $i => $distribution) {
                        $stats[$difficult]['winDistribution'][$i] = (isset($stats[$difficult]['winDistribution'][$i]) ? $stats[$difficult]['winDistribution'][$i] : 0) +(int)$distribution; 
                    }
                }
            }
        }

        // todo removed once all new state generated
        $legacyFiles = glob(getLegacyFolder().'*-stat'.'.json');
        foreach($legacyFiles as $file) {
            $filename = preg_replace('/\-stat\.json$/', '.json', basename($file));
            if(in_array($filename, $usedFiles)) {
                continue;
            }

            $content = file_get_contents($file);
            $content = $content ? json_decode($content, true) : null;

            if(is_array($content)) {
                foreach($content as $difficult => $stat) {
                    $stats[$difficult]['players'] += $stat['totalGames'] > 0 ? 1 : 0;
                    $stats[$difficult]['totalGames'] += $stat['totalCount'];
                    $stats[$difficult]['gamesFailed'] += $stat['failedCount'];
                    foreach($stat['distributions'] as $i => $distribution) {
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
            print json_encode(getAllStat(), JSON_UNESCAPED_UNICODE);
            exit();
        }
    }  else if(isset($_GET['id']) && isset($_GET['state'])) {
        $state = getFile($_GET['id']);

        if(!$state) {
            $legacyState = getLegacyFile($_GET['id'], true);
            $legacyStats = getLegacyFile($_GET['id']);

            if($legacyState) {
                $newState = array(
                    'id' => $_GET['id'],
                    'theme' => 'light',
                    'view' => 'full',
                    'game' => $legacyState['state'] ? $legacyState['state'] : new stdClass(),
                    'difficulty' => $legacyState['difficulty'] >=3 && $legacyState['difficulty'] <= 9 ? $legacyState['difficulty'] : 5,
                    'stats' => $legacyStats ? $legacyStats : new stdClass()
                );

                foreach($newState['stats'] as &$legacyStat) {
                    $legacyStat = array(
                        'winDistribution' => $legacyStat['distributions'],
                        'totalGames' => $legacyStat['totalCount'],
                        'gamesFailed' => $legacyStat['failedCount'],
                    );
                }
                

                print json_encode($newState, JSON_UNESCAPED_UNICODE);
                exit();
            }
        }

        print json_encode($state, JSON_UNESCAPED_UNICODE);
        exit();
    } else if(isset($_GET['id']) && isset($_GET['global'])) {
        print json_encode(getAllStat(), JSON_UNESCAPED_UNICODE);
        exit();
    }

    header('Status: 400 Bad Request', TRUE);
    print json_encode(array('error' => 'malformed'), JSON_UNESCAPED_UNICODE);