<?php
 $actor_id = urlencode($_GET['actor_id']); // <- you need to secure this
 echo file_get_contents('http://www.imdb.com/name/'.$actor_id);
 ?>