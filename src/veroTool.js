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
NProgress.start();
let samples = SampleLibrary.load({
    instruments: ['piano', 'cello', 'clarinet', 'contrabass', 'flute', 'organ', 'saxophone', 'trombone', 'trumpet', 'violin'],
    baseUrl: "/GLAMhack2021Team17/samples/"
})

let current
Tone.Buffer.on('load', function() {
    //document.querySelector(".container").style.display = 'block';
    //document.querySelector("#loading").style.display = 'none';
    NProgress.done();

    // loop through instruments and set release, connect to master output
    for (var property in samples) {
        if (samples.hasOwnProperty(property)) {
            console.log(samples[property])
            samples[property].release = .5;
            samples[property].toMaster();
            }
        }
    current = samples['piano'];
})


// MIDI from base64 to arraybuffer
function _base64ToArrayBuffer(base64) {
    var binaryMidi = window.atob(base64);
    var u16 = new Uint16Array(binaryMidi.length);
    var u8 = new Uint8Array(binaryMidi.length);
    var len = binaryMidi.length;
    for(var i=0;i<len;i++){
        u16[i] = binaryMidi[i].charCodeAt(0);
        u8[i] = u16[i];
    }
    return u8.buffer;
}

$(document).ready(function() {

    loadFile();
    // set the Midi data
    var base64midi = vrvToolkit.renderToMIDI();
    var song = _base64ToArrayBuffer(base64midi);
    const midisong = new Midi(song);

    console.log(JSON.stringify(midisong));

    Tone.Transport.bpm.value = midisong.header.tempos[0].bpm;
    midisong.tracks.forEach(track => {
        //tracks have notes and controlChanges
        const TrackInst = track.instrument.name;
        console.log(TrackInst);

        //notes are an array
        const notes = track.notes;
        let partNotes = [];
        notes.forEach(note => {
        //note.midi, note.time, note.duration, note.name
        let n = {
            "name" : note.name,
            "duration" : note.duration,
            "time" : note.time,
            "velocity" : note.velocity
            };
        console.log(n);
        partNotes.push(n);
        })

        console.log(partNotes);
        new Tone.Part( nt => {
            current.triggerAttackRelease(nt.name, nt.duration, nt.time, nt.velocity)}, partNotes).start(0);
        })
});