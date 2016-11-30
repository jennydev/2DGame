var rows = 8;
var mapData = [];
var gemsMatch = [];


function start() {
    generateMap();
    bindEvents();
}

function bindEvents() {
    console.log('bind events')
    $("#new-game").on("click", function () {
        generateMap();
        bindEvents();

        playAnimation($(".destroy-gems"))
    })

    $(".block").on("click", function () {

        // Gem2 is the second selected gem
        var $gem2 = $(this);
        // Gem1 is the first selected gem
        var $gem1 = $('.active');

        $gem1.removeClass("active");
        $gem2.addClass("active");


        //If there is a previously selected gem get coordinates of Gem1 and Gem2
        if ($gem1.length > 0) {

            var gem1Row = parseInt($gem1.attr("row"));
            var gem1Col = parseInt($gem1.attr("col"));

            var gem2Row = parseInt($gem2.attr("row"));
            var gem2Col = parseInt($gem2.attr("col"));


            // If the distance between Gem1 and Gem2 is lower or equal to 1 switch Gem1 and Gem2 positions
            if (Math.abs(gem1Row - gem2Row) <= 1 && Math.abs(gem1Col - gem2Col) <= 1) {

                var gem1InMap = mapData[gem1Row][gem1Col].gemType;
                var gem2InMap = mapData[gem2Row][gem2Col].gemType;
                var gem1Image = mapData[gem1Row][gem1Col].image;
                var gem2Image = mapData[gem2Row][gem2Col].image;

                mapData[gem1Row][gem1Col].image = gem2Image;
                mapData[gem2Row][gem2Col].image = gem1Image;

                mapData[gem1Row][gem1Col].gemType = gem2InMap;
                mapData[gem2Row][gem2Col].gemType = gem1InMap;

                console.log(mapData[gem1Row][gem1Col].gemType, mapData[gem2Row][gem2Col].gemType)

                console.log("row offset: ", Math.abs(gem1Row - gem2Row), "col offset:", Math.abs(gem1Col - gem2Col));

                //Get Gem2 position
                var swapTop1 = gem2Row * 80;
                var swapLeft1 = gem2Col * 80;

                // Animate Gem1 to Gem2 position
                $gem1.animate({left: swapLeft1 + "px", top: swapTop1 + 'px'});

                //Get Gem1 position
                var swapTop2 = gem1Row * 80;
                var swapLeft2 = gem1Col * 80;

                // Switch attributes col and row between Gem1 and Gem2
                $gem2.attr({'col': gem1Col, 'row': gem1Row});
                $gem1.attr({'col': gem2Col, 'row': gem2Row});


                //Update helper info (switch white labels)
                $gem2.find('.helper-info').html(gem1Row + ':' + gem1Col);
                $gem1.find('.helper-info').html(gem2Row + ':' + gem2Col);

                // Deselect Gem2
                $gem2.removeClass("active");


                // Animate Gem2 to Gem1 position
                $gem2.animate({left: swapLeft2 + "px", top: swapTop2 + 'px'}, 500, function () {
                    // Animation complete.

                    checkGems(mapData);
                    destroyGems(gemsMatch)

                });


            }


        }

    })

}

function generateMap() {


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

    console.log('map data', mapData)
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

    var verticalMatched = _.where(gemsMatch, {vertical: true});

    if (verticalMatched.length > 0) {

        var firstArray = _.where(verticalMatched, {gemType: verticalMatched[0].gemType});
        var secondArray = _.reject(verticalMatched, {gemType: verticalMatched[0].gemType});
        console.log('--->', firstArray, secondArray);

        var firstOffset = firstArray[0].row - 0;

        for (var i = 0; i < firstOffset; i++) {

            var $gem = $(".block[row='" + i + "'][col='" + firstArray[0].col + "']");
            var gemOffsetTop = (i + firstArray.length) * 80;

            var gemInMap = mapData[i + firstArray.length][firstArray[0].col];
            gemInMap.gemType = mapData[i][firstArray[0].col].gemType;

            console.log(gemInMap.gemType);

            $gem.animate({top: gemOffsetTop + 'px'}, 500, function () {

                //$gem

            });

        }

    }


}

function renderGems(mapData) {


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
            $newDiv.css({'top': row * 80, 'left': col * 80});

            $('#gem-container').append($newDiv);
        }
    }

    console.log('render gems')
}


function getRandomizer(bottom, top) {
    return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
}

function getRandomGem(row, col, gemType, initialLoad) {

    var gemTypeRepeats = false;

    if (mapData[row] && mapData[row][col - 1] && mapData[row][col - 2]) {

        //Checks the previous two on the same row
        if (gemType == mapData[row][col - 1].gemType && gemType == mapData[row][col - 2].gemType) {
            console.log("gems on row at: [", row, ":", col - 2, "]", "[", row, ":", col - 1, "]", "[", row, ":", col, "] are same type: ", gemType)
            gemTypeRepeats = true;
            // checks if initialLoad is false
            if (!initialLoad) {
                gemsMatch.push(mapData[row][col]);
                gemsMatch.push(mapData[row][col - 1]);
                gemsMatch.push(mapData[row][col - 2]);
            }
        }


    }
    //Checks the upper two gems on the same column
    if (mapData[row] && mapData[row - 1] && mapData[row - 2]) {

        if (gemType == mapData[row - 1][col].gemType && gemType == mapData[row - 2][col].gemType) {
            console.log("gems at: [", row - 2, ":", col, "]", "[", row - 1, ":", col, "]", "[", row, ":", col, "] are same type: ", gemType)
            gemTypeRepeats = true;
            if (!initialLoad) {
                mapData[row][col].vertical = mapData[row - 2][col].vertical = mapData[row - 1][col].vertical = true;
                gemsMatch.push(mapData[row - 2][col]);
                gemsMatch.push(mapData[row - 1][col]);
                gemsMatch.push(mapData[row][col]);
            }
        }

    }
    //Checks the top left diagonal the two gems
    if (mapData[row] && mapData[row - 1] && mapData[row - 2] && mapData[row - 1][col - 1] && mapData[row - 2][col - 2]) {

        if (gemType == mapData[row - 1][col - 1].gemType && gemType == mapData[row - 2][col - 2].gemType) {
            console.log("gems at: [", row - 2, ":", col - 2, "]", "[", row - 1, ":", col - 1, "]", "[", row, ":", col, "] are same type: ", gemType)
            gemTypeRepeats = true;
            if (!initialLoad) {
                gemsMatch.push(mapData[row][col]);
                gemsMatch.push(mapData[row - 1][col - 1]);
                gemsMatch.push(mapData[row - 2][col - 2]);
            }
        }
    }
    //Checks the top right diagonal the two gems
    if (mapData[row] && mapData[row - 1] && mapData[row - 1][col + 1] && mapData[row - 2] && mapData[row - 2][col + 2]) {

        if (gemType == mapData[row - 1][col + 1].gemType && gemType == mapData[row - 2][col + 2].gemType) {
            console.log("gems at: [", row - 2, ":", col + 2, "]", "[", row - 1, ":", col + 1, "]", "[", row, ":", col, "] are same type: ", gemType)
            gemTypeRepeats = true;
            if (!initialLoad) {
                gemsMatch.push(mapData[row][col]);
                gemsMatch.push(mapData[row - 1][col + 1]);
                gemsMatch.push(mapData[row - 2][col + 2]);
            }
        }
    }

//If  there are at least 3 matches of one gemType it replaces the gemType of the current one

    if (gemTypeRepeats && initialLoad) {
        var factor = gemType / 4;
        if (factor > 1) {
            gemType = gemType - getRandomizer(1, gemType - 1);
        } else {
            gemType = gemType + getRandomizer(1, gemType - 1);
        }
    }

    return gemType;
}

function destroyGems(gemsArray) {


    for (i = 0; i < gemsArray.length; i++) {

        var $destroyAnimation = $('<div/>', {
            class: 'destroy-gems'
        });

        var $gem = $(".block[row='" + gemsArray[i].row + "'][col='" + gemsArray[i].col + "']");
        $gem.find('img').hide();
        $gem.append($destroyAnimation);
        playAnimation($destroyAnimation)

    }


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





















