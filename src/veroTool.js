const vrvToolkit = new verovio.toolkit();

/////////////////////////////////////////
/* rendering a MEI file as a SVG score */
/////////////////////////////////////////
const zoom = 30;

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

    // Bind a on click event to each note 
    $(".note").click(function() {
        let id = $(this).attr("id");
        let time = vrvToolkit.getTimeForElement(id);
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
    // for the local test situation
    //baseUrl: "../samples/"
})

// current = current instrument
let current
Tone.Buffer.on('load', function() {
    //document.querySelector(".container").style.display = 'block';
    //document.querySelector("#loading").style.display = 'none';
    NProgress.done();

    // loop through instruments and set release, connect to master output
    for (let property in samples) {
        if (samples.hasOwnProperty(property)) {
            //console.log(samples[property]);
            samples[property].release = .5;
            samples[property].toMaster();
            }
        }
    current = samples['piano'];
})

///////////////////////////////
/* MIDI Player configuration */
///////////////////////////////
let playing_status = false;
// ids for the each notes on the music score
let ids = [];
// Global variant for setInterval method
let scoreSync

// MIDI from base64 to arraybuffer
function _base64ToArrayBuffer(base64) {
    let binaryMidi = window.atob(base64);
    let len = binaryMidi.length;
    let u16 = new Uint16Array(len);
    let u8 = new Uint8Array(len);
    
    for(let i=0;i<len;i++){
        u16[i] = binaryMidi[i].charCodeAt(0);
        u8[i] = u16[i];
    }
    return u8.buffer;
}

function midi_score_sync(time){
    //console.log(time);
    // time needs to - 200 for adjustment
    let vrvTime = Math.max(0, time - 200);
    let elementsattime = vrvToolkit.getElementsAtTime(vrvTime);
    if (elementsattime.page > 0) {
        if (elementsattime.page != page) {
            page = elementsattime.page;
            loadPage();
        }
        if ((elementsattime.notes.length > 0) && (ids != elementsattime.notes)) {
            ids.forEach(function(noteid) {
                if ($.inArray(noteid, elementsattime.notes) == -1) {
                    $("#" + noteid).attr("fill", "#000").attr("stroke", "#000");
                }
            });
            ids = elementsattime.notes;
            ids.forEach(function(noteid) {
                if ($.inArray(noteid, elementsattime.notes) != -1) {
                    $("#" + noteid).attr("fill", "#c00").attr("stroke", "#c00");;
                }
            });
        }
    }
}

function TimeInMusic() {
scoreSync = setInterval(() => {
    let time_in_music = Tone.Transport.seconds;
    let rounded = Math.round(time_in_music * 1000);
    midi_score_sync(rounded);
}, 100);
}

// Midi Starter
const playButtonElem = document.getElementById("play_midi_bt");
playButtonElem.addEventListener("click", () => {

    // set the Midi data
    let base64midi = vrvToolkit.renderToMIDI();
    let song = _base64ToArrayBuffer(base64midi);
    const midisong = new Midi(song);
    Tone.Transport.bpm.value = midisong.header.tempos[0].bpm;
    // timeSig from the first track
    let timeSig = "midisong.timeSigunatures[0].timeSignature[0]" + "/" + "midisong.timeSigunatures[0].timeSignature[1]";
    Tone.Transport.timeSignature = timeSig;
    //console.log(midisong);
    midisong.tracks.forEach(track => {
        //tracks have notes and controlChanges
        const TrackInst = track.instrument.name;
        //console.log(TrackInst);
        
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

        //console.log(partNotes);
        new Tone.Part( (time, nt) => {
            current.triggerAttackRelease(nt.name, nt.duration, time, nt.velocity)}, partNotes).start(0);
    })
    if (!playing_status){
    playing_status = true
    Tone.Transport.start();
    TimeInMusic();
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
    clearInterval(scoreSync);
    }
}, false);

//////////////////////
/* Loading MEI file */
//////////////////////

$(document).ready(function() {
    load_File();
});