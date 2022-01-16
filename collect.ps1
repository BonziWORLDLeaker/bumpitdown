﻿Param(
[Parameter(Mandatory)][int]$start,
[Parameter(Mandatory)][int]$end,
[Parameter(Mandatory)][int]$offset=0,
[Parameter(Mandatory)][string]$url
)
for($i=($c=$start)+$offset;$c-lt$end;$c++,$i++){
	if(test-path ("_SAVED/movie-{0:d7}.xml"-f$i)){continue;}
    try{
	    iwr ("$url/movies/m-{0}.xml"-f$c) -outfile ("_SAVED/movie-{0:d7}.xml"-f$i);
	    iwr ("$url/movie_thumbs/m-{0}"-f$c) -outfile ("_SAVED/thumb-{0:d7}.png"-f$i);
    }catch{}
}