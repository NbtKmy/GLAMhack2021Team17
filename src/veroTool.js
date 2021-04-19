const vrvToolkit = new verovio.toolkit();
const picoAudio = new PicoAudio();

var zoom = 30;
var ids = [];
var isPlaying = false;

function setOptions() {
    let pageHeight = $("#svg_output").height() * 100 / zoom ;
    let pageWidth = $("#svg_output").width() * 100 / zoom ;
    options = {
                pageHeight: pageHeight,
                pageWidth: pageWidth,
                scale: zoom,
                adjustPageHeight: true
            };
    vrvToolkit.setOptions(options);
}

function loadData(data) {
    setOptions();
    vrvToolkit.loadData(data);

    page = 1;
    loadPage();
}

function loadPage() {
    svg = vrvToolkit.renderToSVG(page, {});
    $("#svg_output").html(svg);

    ////////////////////////////////////////
    /* Bind a on click event to each note */
    ////////////////////////////////////////
    $(".note").click(function() {
        var id = $(this).attr("id");
        var time = vrvToolkit.getTimeForElement(id);
        //$("#midi-player").midiPlayer.seek(time);
    });
};



function loadFile() {
    file = "./mei/default.mei";
    $.ajax({
        url: file
        , dataType: "text"
        , success: function(data) {
            loadData(data);
        }
    });
}


// Midi Player
function play_midi() {
    if (isPlaying == false) {
        picoAudio.init();
        picoAudio.play();
        isPlaying = true;
    };
}

// Midi stopper
function stop_midi() {
        ids.forEach(function(noteid) {
            $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
        });
        picoAudio.init();
        picoAudio.pause();
        isPlaying = false;
}

$(document).ready(function() {

    loadFile();
    // set the Midi data
    var base64midi = vrvToolkit.renderToMIDI();
    var song = 'data:audio/midi;base64,' + base64midi;
    const smfData = new Uint8Array(song);
    const parsedData = picoAudio.parseSMF(smfData);
    picoAudio.setData(parsedData);

});