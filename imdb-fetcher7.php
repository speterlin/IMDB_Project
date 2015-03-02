<?php
 $movie_id = ($_GET['movie_id']); // <- you need to secure this
 //echo $movie_title;
 echo file_get_contents('http://www.imdb.com/title/'.$movie_id);
 ?>
