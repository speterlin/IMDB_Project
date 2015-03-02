<?php
 $movie_id = urlencode($_GET['movie_id']); // <- you need to secure this
 // url: http://www.imdbapi.com/?t= if want to enter movie title
 echo file_get_contents('http://www.imdbapi.com/?i='.$movie_id);
 ?>

