<?php
 $movie_id = urlencode($_GET['movie_id']); // <- you need to secure this
 echo file_get_contents('http://www.imdb.com/title/'.$movie_id);
 ?>
