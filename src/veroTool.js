const vrvToolkit = new verovio.toolkit();


var zoom = 30;
var ids = [];
var isPlaying = false;

function set_Options() {
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

function load_Data(data) {
    set_Options();
    vrvToolkit.loadData(data);

    page = 1;
    load_Page();
}

function load_Page() {
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
}



function load_File() {
    const file = "./mei/default.mei";
    $.ajax({
        url: file
        , dataType: "text"
        , success: function(data) {
            load_Data(data);
        }
    });
}
//////////////////////////
/*Sampler configuration */
//////////////////////////
const instlist = ['piano', 'cello', 'clarinet', 'contrabass', 'flute', 'organ', 'saxophone', 'trombone', 'trumpet', 'violin'];

NProgress.start();
let samples = SampleLibrary.load({
    instruments: instlist,
    baseUrl: "/GLAMhack2021Team17/samples/"
    //baseUrl: "../samples/"
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

//////////////////////////
/* Player configuration */
//////////////////////////
let playing_status = false;

// MIDI from base64 to arraybuffer
function _base64ToArrayBuffer(base64) {
    var binaryMidi = window.atob(base64);
    var len = binaryMidi.length;
    var u16 = new Uint16Array(len);
    var u8 = new Uint8Array(len);
    
    for(var i=0;i<len;i++){
        u16[i] = binaryMidi[i].charCodeAt(0);
        u8[i] = u16[i];
    }
    return u8.buffer;
}

// Midi Player
const playButtonElem = document.getElementById("play_midi_bt");
playButtonElem.addEventListener("click", () => {

    // set the Midi data
    var base64midi = vrvToolkit.renderToMIDI();
    var song = _base64ToArrayBuffer(base64midi);
    const midisong = new Midi(song);
    Tone.Transport.bpm.value = midisong.header.tempos[0].bpm;
    midisong.tracks.forEach(track => {
        //tracks have notes and controlChanges
        const TrackInst = track.instrument.name;
        console.log(TrackInst);
        
        // if the instrument for the track in the instlist, then change the instrument. if not, then piano.
        if (instlist.includes(TrackInst)){
            current = samples[TrackInst];
        }

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
        partNotes.push(n);
        })

        console.log(partNotes);
        new Tone.Part( (time, nt) => {
            current.triggerAttackRelease(nt.name, nt.duration, time, nt.velocity)}, partNotes).start(0);
    })
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


$(document).ready(function() {
    load_File();
});