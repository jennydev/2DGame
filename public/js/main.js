var rows = 8;
var mapData = [];
var gemsMatch = [];
var selectAllowed = true;
var first = true;
var soundOn = true;
var stats = {
    score:0,
    smashing:0,
    splendid:0,
    indubitably:0,
    marvelous:0,
    unbelievable:0,
    beer1:0,
    beer2:0
}
var combo = 0;

var sounds = {
    start: "assets/sounds/start.mp3",
    smashing: "assets/sounds/smashing.mp3",
    splendid: "assets/sounds/splendid.mp3",
    marvelous: "assets/sounds/marvelous.mp3",
    unbelievable: "assets/sounds/unbelievable.mp3",
    select: "assets/sounds/select.mp3",
    move: "assets/sounds/move.mp3",
    disabledmove: "assets/sounds/disabledmove.mp3",
    first:"assets/sounds/first_of_many.mp3",
    indubitably:"assets/sounds/indubitably.mp3",
    destroy:"assets/sounds/destroy.mp3"

};


function start() {
    //console.log('start()');

    generateMap();

    $("#new-game").on("click", function () {
        generateMap();

    });

    $('.sound-icon').on('click', function(){
        //console.log($(this));
        $(this).toggleClass('disabled-sound');
        soundOn = !soundOn;
    })
}

function bindBlockClick($element) {


    $element.on("click", function () {


        // Gem2 is the second selected gem
        var $gem2 = $(this);
        // Gem1 is the first selected gem
        var $gem1 = $('.active');

        $gem1.removeClass("active");
        $gem2.addClass("active");

        playSound(sounds.select);

        if (!selectAllowed) {
            return;
        }

        //If there is a previously selected gem get coordinates of Gem1 and Gem2
        if ($gem1.length > 0) {

            var gem1Row = parseInt($gem1.attr("row"));
            var gem1Col = parseInt($gem1.attr("col"));

            var gem2Row = parseInt($gem2.attr("row"));
            var gem2Col = parseInt($gem2.attr("col"));


            // If the distance between Gem1 and Gem2 is lower or equal to 1 switch Gem1 and Gem2 positions
            if (Math.abs(gem1Row - gem2Row) <= 1 && Math.abs(gem1Col - gem2Col) <= 1) {

                playSound(sounds.move);

                selectAllowed = false;
                var gem1InMap = mapData[gem1Row][gem1Col].gemType;
                var gem2InMap = mapData[gem2Row][gem2Col].gemType;
                var gem1Image = mapData[gem1Row][gem1Col].image;
                var gem2Image = mapData[gem2Row][gem2Col].image;

                mapData[gem1Row][gem1Col].image = gem2Image;
                mapData[gem2Row][gem2Col].image = gem1Image;

                mapData[gem1Row][gem1Col].gemType = gem2InMap;
                mapData[gem2Row][gem2Col].gemType = gem1InMap;

                //Get Gem2 position
                var swapTop1 = gem2Row * 81;
                var swapLeft1 = gem2Col * 81;

                // Animate Gem1 to Gem2 position
                $gem1.animate({left: swapLeft1 + "px", top: swapTop1 + 'px'}, 300);

                //Get Gem1 position
                var swapTop2 = gem1Row * 81;
                var swapLeft2 = gem1Col * 81;

                // Switch attributes col and row between Gem1 and Gem2
                $gem2.attr({'col': gem1Col, 'row': gem1Row});
                $gem1.attr({'col': gem2Col, 'row': gem2Row});


                //Update helper info (switch white labels)
                $gem2.find('.helper-info').html(gem1Row + ':' + gem1Col);
                $gem1.find('.helper-info').html(gem2Row + ':' + gem2Col);

                // Deselect Gem2
                $gem2.removeClass("active");



                // Animate Gem2 to Gem1 position
                $gem2.animate({left: swapLeft2 + "px", top: swapTop2 + 'px'}, 300, function () {
                    // Animation complete.


                    checkGems(mapData);
                    if (gemsMatch.length > 0) {
                        destroyGems(gemsMatch)
                    } else {
                        // Move gem back
                        playSound(sounds.disabledmove);
                        $gem2.animate({left: swapLeft1 + "px", top: swapTop1 + 'px'}, 300, function () {
                            selectAllowed = true;
                        });
                        $gem1.animate({left: swapLeft2 + "px", top: swapTop2 + 'px'}, 300, function () {

                        });

                        $gem2.attr({'col': gem2Col, 'row': gem2Row});
                        $gem1.attr({'col': gem1Col, 'row': gem1Row});

                        mapData[gem2Row][gem2Col].image = gem2Image;
                        mapData[gem1Row][gem1Col].image = gem1Image;

                        mapData[gem2Row][gem2Col].gemType = gem2InMap;
                        mapData[gem1Row][gem1Col].gemType = gem1InMap;


                    }

                });


            }


        }

    })
}


function generateMap() {

    playSound(sounds.start);
    addImageAnimation('start');

    stats = {
        score:0,
        smashing:0,
        splendid:0,
        indubitably:0,
        marvelous:0,
        unbelievable:0,
        beer1:0,
        beer2:0
    }
    first= true;



    updateScore()
    //console.log('generateMap()');


    //rows
    mapData = [];
    for (var row = 0; row < rows; row++) {
        var rowArray = [];
        mapData.push(rowArray)

        var outer = true;
        if (row % 2) {
            outer = false;
        }
        //cols
        for (var col = 0; col < rows; col++) {

            if (outer) {
                var block = 0;
                if (col % 2) {
                    block = 1;
                }
            } else {
                var block = 1;
                if (col % 2) {
                    block = 0;
                }
            }

            var randomNumber = getRandomizer(1, 7);

            randomNumber = getRandomGem(row, col, randomNumber, true);

            var gem = {
                "image": "assets/img/gem_" + randomNumber + ".png",
                "block": block,
                "gemType": randomNumber,
                "row": row,
                "col": col
            };
            rowArray.push(gem)

        }


    }

    //console.log('map data', mapData)
    renderGems(mapData)

}

function checkGems(mapData) {
    gemsMatch = [];
    for (var row = 0; row < mapData.length; row++) {
        for (var col = 0; col < mapData[row].length; col++) {

            getRandomGem(row, col, mapData[row][col].gemType, false)

        }
    }

    gemsMatch = _.uniq(gemsMatch);

    var beer1Length = _.where(gemsMatch, {'gemType':5}).length;
    var beer2Length = _.where(gemsMatch, {'gemType':6}).length;
    stats.beer1 += beer1Length;
    stats.beer2 += beer2Length;

    if (gemsMatch.length > 0) {
        playSound(sounds.destroy);
    }
    if(gemsMatch.length == 4){

        playSound(sounds.splendid);
        addImageAnimation("splendid");
        stats.splendid++;


    }
    if(gemsMatch.length >= 5){
        addImageAnimation('indubitably');
        playSound(sounds.indubitably);
        stats.indubitably++;
    }

    updateScore()
}



function moveGemsDown(gemsMatch) {


    for (var col = 0; col < rows; col++) {

        var emptyGemsOnCol = _.where(gemsMatch, {col: col});

        if (emptyGemsOnCol.length > 0) {
            //console.log('empty gems on col:', col, ':', emptyGemsOnCol)
        }


        for (var row = mapData.length - 1; row >= 0; row--) {
            _.each(emptyGemsOnCol, function (emptyGem, index) {

                var currentGem = mapData[row][col];

                //move existing gems
                if (currentGem.row < emptyGem.row) {


                    var emptyGemsBelow = _.filter(emptyGemsOnCol, function (i) {
                        return i.row > currentGem.row;
                    })


                    var rowOffset = currentGem.row + emptyGemsBelow.length;
                    var gemOffsetTop = rowOffset * 81;

                    var $gem = $('#gem-container').find(".block[row='" + currentGem.row + "'][col='" + currentGem.col + "']");

                    var matchedGem = mapData[rowOffset][currentGem.col];
                    matchedGem.gemType = currentGem.gemType;
                    matchedGem.image = "assets/img/gem_" + currentGem.gemType + ".png";

                    $gem.attr('row', rowOffset);
                    $gem.find('.helper-info').html(rowOffset + ":" + col);

                    $gem.animate({top: gemOffsetTop + 'px'}, 500, function () {

                    });
                }
            })
        }

        //create new gems and move them
        _.each(emptyGemsOnCol, function (emptyGem, index) {

            var randomType = getRandomizer(1, 7);
            var currentRow = emptyGemsOnCol.length - index - 1;
            var $newDiv = $('<div class="block white-block text-center" row="' + currentRow + '" col="' + col + '"><span class="helper"><span class="helper-info">' + currentRow + ":" + col + '</span> </span></div>');
            var $img = $('<img class="gem-img"/>');
            $img.attr('src', "assets/img/gem_" + randomType + ".png");

            $newDiv.find('.helper').append($img);
            $newDiv.css({'top': (-1 - index) * 81, 'left': col * 81});

            $('#gem-container').append($newDiv);
            mapData[currentRow][col].gemType = randomType;
            mapData[currentRow][col].image = "assets/img/gem_" + mapData[currentRow][col].gemType + ".png",

                $newDiv.animate({top: (emptyGemsOnCol.length - 1 - index) * 81 + 'px'}, 500, function () {
                    bindBlockClick($newDiv);
                });

        });


    }


}


function renderGems(mapData) {
    //console.log('renderGems()');


    $('#gem-container').empty();

    for (var row = 0; row < mapData.length; row++) {
        for (var col = 0; col < mapData[row].length; col++) {

            var $newDiv;

            if (mapData[row][col].block == 1) {
                $newDiv = $('<div class="block white-block text-center" row="' + row + '" col="' + col + '"><span class="helper"><span class="helper-info">' + row + ":" + col + '</span> </span></div>');

            } else {
                $newDiv = $('<div class="block white-block text-center" row="' + row + '" col="' + col + '"><span class="helper"><span class="helper-info">' + row + ":" + col + '</span></span></div>');
            }
            var $img = $('<img class="gem-img"/>');
            $img.attr('src', mapData[row][col].image);
            $newDiv.find('.helper').append($img)
            $newDiv.css({'top': row * 81, 'left': col * 81});

            $('#gem-container').append($newDiv);
        }
    }

    $('.block').each(function () {
        bindBlockClick($(this));
    });

}

function getRandomizer(bottom, top) {
    return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
}

function getRandomGem(row, col, gemType, initialLoad) {

    var gemTypeRepeats = false;
    var gemOnTop = 0;
    var gemOnLeft = 0;

    if (mapData[row] && mapData[row][col - 1] && mapData[row][col - 2]) {

        //Checks the previous two on the same row
        if (gemType == mapData[row][col - 1].gemType && gemType == mapData[row][col - 2].gemType) {
            //console.log("gems on row at: [", row, ":", col - 2, "]", "[", row, ":", col - 1, "]", "[", row, ":", col, "] are same type: ", gemType)
            gemTypeRepeats = true;
            // checks if initialLoad is false
            if (!initialLoad) {
                gemsMatch.push(mapData[row][col - 2]);
                gemsMatch.push(mapData[row][col - 1]);
                gemsMatch.push(mapData[row][col]);
            }
        }


    }
    //Checks the upper two gems on the same column
    if (mapData[row] && mapData[row - 1] && mapData[row - 2]) {

        if (gemType == mapData[row - 1][col].gemType && gemType == mapData[row - 2][col].gemType) {
            //console.log("gems at: [", row - 2, ":", col, "]", "[", row - 1, ":", col, "]", "[", row, ":", col, "] are same type: ", gemType)
            gemTypeRepeats = true;
            if (!initialLoad) {
                gemsMatch.push(mapData[row - 2][col]);
                gemsMatch.push(mapData[row - 1][col]);
                gemsMatch.push(mapData[row][col]);
            }
        }

    }
    ////Checks the top left diagonal the two gems
    //if (mapData[row] && mapData[row - 1] && mapData[row - 2] && mapData[row - 1][col - 1] && mapData[row - 2][col - 2]) {
    //
    //    if (gemType == mapData[row - 1][col - 1].gemType && gemType == mapData[row - 2][col - 2].gemType) {
    //        console.log("gems at: [", row - 2, ":", col - 2, "]", "[", row - 1, ":", col - 1, "]", "[", row, ":", col, "] are same type: ", gemType)
    //        gemTypeRepeats = true;
    //        if (!initialLoad) {
    //            gemsMatch.push(mapData[row - 2][col - 2]);
    //            gemsMatch.push(mapData[row - 1][col - 1]);
    //            gemsMatch.push(mapData[row][col]);
    //        }
    //    }
    //}
    ////Checks the top right diagonal the two gems
    //if (mapData[row] && mapData[row - 1] && mapData[row - 1][col + 1] && mapData[row - 2] && mapData[row - 2][col + 2]) {
    //
    //    if (gemType == mapData[row - 1][col + 1].gemType && gemType == mapData[row - 2][col + 2].gemType) {
    //        console.log("gems at: [", row - 2, ":", col + 2, "]", "[", row - 1, ":", col + 1, "]", "[", row, ":", col, "] are same type: ", gemType)
    //        gemTypeRepeats = true;
    //        if (!initialLoad) {
    //            gemsMatch.push(mapData[row][col]);
    //            gemsMatch.push(mapData[row - 1][col + 1]);
    //            gemsMatch.push(mapData[row - 2][col + 2]);
    //        }
    //    }
    //}

//If  there are at least 3 matches of one gemType it replaces the gemType of the current one

    if (gemTypeRepeats && initialLoad) {

        if (gemType > 4) {
            gemType = 8 - gemType
        } else {
            gemType = 7 - gemType;
        }

    }


    return gemType;
}

function destroyGems(gemsArray) {

    selectAllowed = false;
    for (var i = 0; i < gemsArray.length; i++) {

        var $destroyAnimation = $('<div/>', {
            class: 'destroy-gems'
        });

        var $gem = $('#gem-container').find(".block[row='" + gemsArray[i].row + "'][col='" + gemsArray[i].col + "']");
        $gem.find('img').hide();
        $gem.append($destroyAnimation);
        playAnimation($destroyAnimation)

    }

    setTimeout(function () {

        moveGemsDown(gemsMatch);
        setTimeout(function () {
            checkGems(mapData);

            if (gemsMatch.length > 0) {
                combo++;

                destroyGems(gemsMatch)
            } else {
                if(combo == 1){

                    playSound(sounds.smashing);
                    addImageAnimation("smashing");
                    stats.smashing++;
                    stats.score += 100;

                }
                if(combo == 2){
                    addImageAnimation('marvelous');
                    playSound(sounds.marvelous);
                    stats.marvelous++;
                    stats.score += 200;

                }
                if(combo >= 3){
                    addImageAnimation('unbelievable');
                    playSound(sounds.unbelievable);
                    stats.unbelievable++;
                    stats.score += 400;


                }
                updateScore()
                combo = 0;
                selectAllowed = true;

            }
        }, 500)
    }, 500);


}

function playAnimation($destroyAnimation) {
    $destroyAnimation.animateSprite({
        fps: 25,
        loop: false,
        autoplay: false,
        animations: {
            start: [0, 1, 2, 3, 4, 5, 6]

        },
        complete: function () {
            $destroyAnimation.closest('.block').remove();
        }
    })

    $destroyAnimation.animateSprite("play", "start");


}

function updateScore() {


    if (gemsMatch.length == 3) {
        stats.score += 30;
    }
    if (gemsMatch.length == 4) {
        stats.score += 60;
    }
    if (gemsMatch.length > 4) {
        stats.score += 60 + gemsMatch.length * 10
    }

    //console.log('All matched gems: ', gemsMatch.length)

    for (var property in stats) {
        if (stats.hasOwnProperty(property)) {
            var value = stats[property];
            $('.' + property).html(value);
        }
    }


}


function playSound(sound){

    if(!soundOn){
        return;
    }
    var sound = new Audio(sound)
    sound.play()
}


function addImageAnimation(imageClass, duration){
    $('.inner-container').find('img').hide();
    if(duration == undefined){
        duration = 1200;
    }
    var $image = $('.inner-container').find('.'+ imageClass)
    $image.show()
    $image.addClass('shake');

    setTimeout(function () {
        $image.removeClass('shake');
        $image.fadeOut('fast')
    }, duration)

}















