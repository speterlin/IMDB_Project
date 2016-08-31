<?php
 $actor = urlencode($_GET['actor']); // <- you need to secure this
 echo file_get_contents('http://www.imdb.com/xml/find?json=1&nr=1&nm=on&q='.$actor);
 ?>
