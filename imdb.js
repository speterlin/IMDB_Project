$(document).ready(function() {
    // maybe change this to dynamic searching like google using keyup
    $("#movie-search-button").on("click", function(event) {
      if ($("#movie").val()) {
        movieSearch($("#movie").val());
        event.preventDefault();
      }
    })
    $("#movie").on("keypress", function(event) {
      if (event.keyCode == 13 && $("#movie").val()) {
        movieSearch($("#movie").val());
        event.preventDefault();
      }
    })
    $("#actor-search-button").on("click keypress", function(event) {
      if ($("#actor").val()) {
        actorSearch($("#actor").val());
        event.preventDefault();
      }
    })
    $("#actor").on("keypress", function(event) {
      if (event.keyCode == 13 && $("#actor").val()) {
        actorSearch($("#actor").val());
        event.preventDefault();
      }
    })

});

//would like to make this a local variable
var stop_movie_load = false;

function sortByBoxOffice(movies_data) {
    $("#movies-sort-by-box-office").hide();
    $("#movies-for-actor").remove();

    movies_data.sort(function(a,b) {
        return (parseFloat(b['box office'].match(/[\d|,]+/i)[0].split(",").join("")) - parseFloat(a['box office'].match(/[\d|,]+/i)[0].split(",").join("")));
    })

    $("#movies-sort-by-rating").show();
    var $ul = $("<ul id='movies-for-actor'><b>Movies Sorted by Gross Box Office</b></ul>");
    movies_data.map(function(value) {
        var $li = $("<li></li>")
        var $a = $("<a href='#Exit'>"+value.title+ " ("+value.year+"), Gross Box Office: "+value['box office']+"</a>");
        $a.click(function() {
          displayMovieData(value.imdbID, value);
        });
        $li.append($a);
        $ul.append($li);
    })

    $("#movies-list").append($ul);
}

function sortByRating(movies_data) {
    $("#movies-sort-by-rating").hide();
    $("#movies-for-actor").remove();

    movies_data.sort(function(a,b) {
        return (parseFloat(b.metascore) - parseFloat(a.metascore));
    })

    $('#movies-sort-by-box-office').show();
    var $ul = $("<ul id='movies-for-actor'><b>Movies Sorted by Metascore Rating</b></ul>");
    movies_data.map(function(value) {
        var $li = $("<li></li>")
        var $a = $("<a href='#Exit'>"+value.title+ " ("+value.year+"), Metascore Rating: "+value.metascore+"</a>");
        $a.click(function() {
          displayMovieData(value.imdbID, value);
        });
        $li.append($a);
        $ul.append($li);
    })

    $("#movies-list").append($ul);
}

function stopMovieLoad() {
    stop_movie_load = true;
}

function loadMovieData(basic_movies_data) {
    var counter=0;
    var movies_data = [];

    (function asyncLoop() {
        counter++
        $("#progress-bar").val((counter/basic_movies_data.length)*100);
        $("#status").html(counter + " out of " + basic_movies_data.length + " movies");

        if (counter <= basic_movies_data.length && stop_movie_load == false) {
            var movie_data = getMovieData(basic_movies_data[counter-1].imdbID);
            movies_data.push(movie_data);
            setTimeout(asyncLoop, 0);
        } else {
            var buttons = "<div id='sort-buttons'>";
            buttons += "<button type='text' id='movies-sort-by-rating'>Sort by IMDB Rating</button>";
            buttons += "<button type='text' id='movies-sort-by-box-office'>Sort by Gross Box Office</button>";
            buttons += "</div>";
            if (stop_movie_load == true) {
                clearTimeout(asyncLoop);
                stop_movie_load = false;
            }  else { //if have gone through all elements of array
                $("#load-info").empty();

                $("#load-info").append(buttons);
                $("#movies-sort-by-rating").click(function() {
                  sortByRating(movies_data);
                });
                $("#movies-sort-by-box-office").click(function() {
                  sortByBoxOffice(movies_data);
                });

                stop_movie_load = false;
            }
        }
    })();
}

function isMovie (movie_div_text) {
    //filtering out all of the titles that are not movies, like TV Series, TV Mini-Series, Video Game, (... short), TV Movie, Video
    if (movie_div_text.match(/TV Series/i) == null && movie_div_text.match(/TV Mini-Series/i) == null && movie_div_text.match(/Video Game/i) == null && movie_div_text.match(/\(\w*\s*short\)/i) == null && movie_div_text.match(/TV Movie/i) == null && movie_div_text.match(/\(Video\)/i) == null) {
        return true;
    } else {
        return false;
    }
}

function displayBasicMoviesData (filmography_div,filmography_category, actor) {
    $("#load-info").remove();

    var load_info = "<div id='load-info'><button type='text' id='load-movie-data-button'>Load All Movie Data</button>";
    load_info += "<button type='text' id='stop-movie-load-button' onClick='return stopMovieLoad(); return false'>Stop</button>"
    load_info += "<progress id='progress-bar' value='0' max='100' style='width:300px;'></progress><span id='status'></span></div>";
    var movies_list = "<div id='movies-list'><br><b>All Movies for "+actor+" in the filmography role of "+filmography_category+"</b><ul id='movies-for-actor'>";

    var basic_movies_data = [];
    filmography_div.find('div.filmo-row').filter(function(index,value) {
        //need to use this method because it's only way to get the (TV Movie)...(TV Mini-Series)... elements
        event = $(this).text().trim().replace(/\s\s+/g, ',').split(',');

        if (isMovie(event.join(","))) {
          //sometimes with new releases and there is no year specified, and this throws off element order in DOM
          var year = $(this).find('span.year_column').text().trim() || "Unknown";

          var actor_role = (year == "Unknown") ? "Unknown" : "";
          if (filmography_category == "actor" || filmography_category == "actress") {
            var anchor_tags = $(this).find("a").length;
            if (/character/i.test($(this).find("a")[anchor_tags-1].href)) {
              actor_role = $(this).find("a")[anchor_tags-1].text;
              //if the last 'a' tag doesn't describe character, it's usually at the end of div element event
            } else  {
              actor_role = event[event.length-1].replace(/\s\s+/g,' ');
            }
          }
          var role_str = (actor_role == "") ? "" : " as " + actor_role;
          var basic_info = {};
          basic_info['title'] = $(this).find('b a').text();
          basic_info['imdbID']= $(this).find('b a').attr('href').split("/")[2];
          basic_info['year'] = year;
          basic_info['role'] = actor_role;
          basic_movies_data.push(basic_info);
          movies_list += "<li><a href='#Exit' onClick='return displayMovieData(\"" + basic_info.imdbID + "\"); return false'>" + basic_info.title + " (" + basic_info.year + ")</a>"+role_str+"</li>";
        }
    })
    movies_list += "</ul></div>";

    $("#menu-items td").append(load_info);
    $("#main-display").html(movies_list);
    $('#load-movie-data-button').click(function(){
        loadMovieData(basic_movies_data);
    });
}

function getFilmographyRolesForActor(actor_id) {
    var result = {};
    var buttons = {};
    $.ajax ({
        type: "GET",
        url: "imdb-fetcher-actor-info.php?actor_id=" + actor_id,
        dataType: "html",
        async: false,
        success: function(data) {
            result['actor'] = $(data).find('.header').text().trim().replace(/\s\s+/g, ' ');

            $(data).find("div#filmography > div").each(function(element, value) {
              if (value.id != "") {
                var button_name = value.id.split("-")[2];
                var button = document.createElement("button");
                button.innerHTML = button_name;
                buttons[button_name] = button;
              } else {
                var last_button = buttons[Object.keys(buttons)[Object.keys(buttons).length -1]];
                last_button.data = value;
                last_button.onclick = function () {
                    displayBasicMoviesData($(this.data), this.innerHTML, result.actor);
                }
              }
            })
        }, error: function(request, status, error) {
            console.log(request.responseText, status, error);
        }
    })
    result['buttons'] = buttons;
    return result;
}

function displayFilmographyRolesForActor(actor_id) {
  $("#main-display").empty();
  $("#popup").empty();

  var actor_data = getFilmographyRolesForActor(actor_id);
  $("#filmography-buttons").html("Filmography Roles for "+actor_data.actor+": ");
  for (var button_name in actor_data.buttons) {
    $('#filmography-buttons').append(actor_data.buttons[button_name]);
  }
}

function getMovieData (movie_id) {
    var result = {};
    $.ajax ({
        type: 'GET',
        url: "imdb-fetcher-movie-info.php?movie_id=" + movie_id,
        async: false,
        dataType: "html",
        success: function(data) {
            result['title'] = $(data).find('.title_wrapper h1')[0].innerHTML.match(/^[^&]*/i)[0];
            result['imdbID']= movie_id;
            result['year'] = $(data).find('.title_wrapper h1 a')[0].innerHTML;
            result['summary'] = $(data).find('div.summary_text').text().trim()
            // maybe add actor role later

            var directors = [], writers = [], actors = []
            // maybe refactor later, some repeat code, can add more categories
            $(data).find('span[itemprop=director]').each(function(element,value){ directors.push(" "+value.children[0].text) })
            $(data).find('span[itemprop=creator]').each(function(element,value){ writers.push(" "+value.children[0].text) })
            $(data).find('span[itemprop=actors]').each(function(element,value){ actors.push(" "+value.children[0].text) })
            result['directors'] = directors, result['writers'] = writers, result['actors'] = actors;
            //displaying metascore as 0 if unknown, easier for calculations, may refactor
            result['metascore'] = $(data).find('div.metacriticScore span').text() || "0";
            result['box office'] = (typeof  $(data).find('.txt-block:contains("Gross")')[0] === 'undefined') ? "0 / Unknown" : $(data).find('.txt-block:contains("Gross")')[0].innerHTML.match(/\$[\d|,]+/i)[0];
            result['poster'] = $(data).find('div.poster img')[0].src;
            result['trailer'] = "http://www.imdb.com" + $(data).find('div.slate a')[0].href.match(/\/video.*/i)[0];
        },
        error: function(request, status, error) {
          console.log(request.responseText, status, error);
        }
    })
    return result;
}

function displayMovieData(movie_id, movie_data) {
    var movie_data = (typeof movie_data === 'undefined') ? getMovieData(movie_id) : movie_data;

    var str = "<div id='movieData'><br><b>Movie Data</b>";
    str+= "<img src='"+movie_data.poster+"' style='width:210px;height:350px;float:right;' alt='Image Not Found'</img>";
    str+= "<ul id='movieInfo'>"
    for (var event in movie_data) {
        if (event != "poster" && event != "trailer" && event != "imdbID") {
            str += "<li><b>"+event+":</b> "+ movie_data[event]+"</li>";
        }
    }
    if (movie_data.trailer) {
      str+= "<li><a target='_blank' href='"+movie_data.trailer+"'>Trailer</a></li>";
    }
    str+= "</ul></div>";
    //maybe add some remove elements here but is working fine as is
    $("#popup").html(str);
    $("#popup").show();
}

function actorSearch(actor) {
     $.ajax ({
      type: 'GET',
      url: "imdb-fetcher-actor.php?actor=" + actor,
      dataType: "json",
      success: function(data) {
        var str = "<div id='actors'>";
        var categories = JSON.stringify(data).match(/name_[^\"]+/g);

        for (var category in categories) {
            var title_words = categories[category].split('_')
            var title = title_words[0].charAt(0).toUpperCase() + title_words[0].substring(1) + " " + title_words[1].charAt(0).toUpperCase() + title_words[1].substring(1);

            str += "<div class='"+categories[category]+"'><b>"+title+"</b><ul>";
            $.each (data[categories[category]],function (index,element) {
                str += "<li><a href='#Exit' onClick='return displayFilmographyRolesForActor(\""+element.id+"\"); return false'>"+element.name+"</a></li>";
            })
            str += "</ul></div>";
        }
        str += "</div>";

        $("#main-display").html(str);
      }
    });
}

function movieSearch(movie) {
     $.ajax ({
      type: 'GET',
      url: "imdb-fetcher-movie.php?movie=" + movie,
      dataType: "json",
      success: function(data) {
            var str = "<div id='movies'>";
            //gets all categories except title_description
            var categories = JSON.stringify(data).match(/title_[^d][^\"]+/g);

            for (var category in categories) {
                var title_words = categories[category].split('_')
                var title = title_words[0].charAt(0).toUpperCase() + title_words[0].substring(1) + " " + title_words[1].charAt(0).toUpperCase() + title_words[1].substring(1);

                str += "<div class='"+categories[category]+"'><b>"+title+"</b><ul>";
                $.each (data[categories[category]],function (index,element) {
                    str += "<li><a href='#' onClick='return displayMovieData(\""+element.id+"\"); return false'>"+element.title+"</a></li>";
                })
                str += "</ul></div>";
            }
            str += "</div>";

            $("#main-display").html(str);
       }
    })
}
