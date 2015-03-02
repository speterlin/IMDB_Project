<?php
 $movie_title = ($_GET['movie_title']); // <- you need to secure this
 //echo $movie_title;
 echo file_get_contents('https://www.google.com/#q=watch+bounty+hunter+online+free');
 ?>