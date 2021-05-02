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


//Syth 
const synth = new Tone.PolySynth(16).toMaster();

// Midi Player
const playButtonElem = document.getElementById("play_midi_bt");
playButtonElem.addEventListener("click", async () => {
    await Tone.start()
    console.log('audio is ready')
    
    Tone.Transport.start();
});

// Midi stopper
const pauseButtonElem = document.getElementById('pause_midi_bt');
pauseButtonElem.addEventListener('click', () => {
    ids.forEach(function(noteid) {
        $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
    });
    Tone.Transport.stop();
});

/*
function pause_midi() {
        ids.forEach(function(noteid) {
            $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
        });
        picoAudio.pause();
        isPlaying = false;
} 
*/


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
    MidiConvert.load(midisong, function(midi) {
        // .midファイルと同じBPMに設定
        Tone.Transport.bpm.value = midi.header.bpm;
        // 必要なパート分をループ
        for(var i=0; i<midi.tracks.length; i++) {
            new Tone.Part(function(time, note) {
            // .midファイルの通りに発音させる
            synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
            }, midi.tracks[i].notes).start();
        }
        // 全体のパートを同期させて演奏
        //Tone.Transport.start();
    });
    

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