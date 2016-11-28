var rows = 8;
var mapData = [];


function start() {
    generateMap();
    bindEvents();
}

function bindEvents(){
 $("#new-game").on("click", function(){
     generateMap();
 })
}

function generateMap() {

    //rows
    mapData = [];
    for (var i = 0; i < rows; i++) {
        var row = [];

        var outer = true;
        if(i % 2){
            outer = false;
        }
      //cols
        for (var j = 0; j < rows; j++) {

            if(outer){
                var block = 0;
                if(j % 2) {
                    block = 1;
                }
            }else{
                var block = 1;
                if(j % 2) {
                    block = 0;
                }
            }

            var element = {
                "image": "assets/img/gem_" + getRandomizer(1,7)+ ".png",
                "block": block
            };
            row.push(element)

        }

        mapData.push(row)
    }

    console.log('map data', mapData)
    renderGems(mapData)

}

function renderGems(mapData){

    $('#gem-container').empty();

    for (var i = 0; i < mapData.length; i++) {
        for (var j = 0; j < mapData[i].length; j++) {

            var $newDiv;

            if(mapData[i][j].block == 1){
                $newDiv = $('<div class="block black-block text-center"><span class="helper"></span></div>');

            }else{
                $newDiv = $('<div class="block white-block text-center"><span class="helper"></span></div>');
            }
            var $img = $('<img class="gem-img"/>');
            $img.attr('src', mapData[i][j].image);
            $newDiv.find('.helper').append($img)
            $newDiv.css({'top': j * 80, 'left': i *80});

            $('#gem-container').append($newDiv);
        }
    }


}

function getThreeNumbers() {

    var number = getRandomizer(0, monsters.length - 1);

    if (randomMonsters.indexOf(number) == -1) {
        randomMonsters.push(number)
    }

    if (randomMonsters.length == 3) {
        return;
    } else {
        getThreeNumbers();
    }

}


function getRandomizer(bottom, top) {
    return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
}
