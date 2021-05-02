const vrvToolkit = new verovio.toolkit();
//const picoAudio = new PicoAudio();
//picoAudio.init();

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


//Synth 

let playing_status = false;

// Midi Player
const playButtonElem = document.getElementById("play_midi_bt");
playButtonElem.addEventListener("click", () => {
    if (!playing_status){
    playing_status = true
    Tone.Transport.start();
    }
}, false);

// Midi stopper
const pauseButtonElem = document.getElementById("pause_midi_bt");
pauseButtonElem.addEventListener("click", () => {
    if (playing_status){
    playing_status = false
    ids.forEach(function(noteid) {
        $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
    });
    Tone.Transport.stop();
    }
}, false);

/*
function pause_midi() {
        ids.forEach(function(noteid) {
            $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
        });
        picoAudio.pause();
        isPlaying = false;
} 
*/
let samples = SampleLibrary.load({
    instruments: ['piano', 'cello', 'clarinet', 'contrabass', 'flute', 'organ', 'saxophone', 'trombone', 'trumpet', 'violin'],
    baseUrl: "../samples/"
})
const piano = samples['piano'];
piano.toDestination();

// MIDI from base64 to arraybuffer
function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

$(document).ready(function() {

    loadFile();
    // set the Midi data
    var base64midi = vrvToolkit.renderToMIDI();
    var song = _base64ToArrayBuffer(base64midi);
    const midisong = new Midi(song)

    console.log(midisong);

    Tone.Transport.bpm.value = midisong.header.tempos[0];
    midisong.tracks.forEach(track => {
        //tracks have notes and controlChanges
        const TrackInst = instrument.name;
        console.log(TrackInst);

        //notes are an array
        const notes = track.notes
        notes.forEach(note => {
        //note.midi, note.time, note.duration, note.name
        new Tone.Part(((note) => {
            // .midファイルの通りに発音させる
            piano.triggerAttackRelease(note.name, note.time, note.velocity);
            }), note.duration).start();
        })
      })
});

/*$(document).ready(function() {

    loadFile();
    // set the Midi data
    var base64midi = vrvToolkit.renderToMIDI();
    song = _base64ToArrayBuffer(base64midi);
    const midi = new Midi(midiData)
    //var song = "data:audio/midi;base64," + base64midi;
    const smfData = new Uint8Array(song);
    const parsedData = picoAudio.parseSMF(smfData);
    picoAudio.setData(parsedData);

});
*/