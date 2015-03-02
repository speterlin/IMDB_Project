<?php
 //$movie_title = urlencode($_GET['movie_title']); // <- you need to secure this
 echo file_get_contents('https://secure.imdb.com/register-imdb/login?ref_=nv_usr_lgin_1');
 ?>