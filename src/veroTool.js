var vrvToolkit = new verovio.toolkit();
var zoom = 100;
var pageHeight = 800;
var pageWidth = 800;

function setOptions() {
    //////////////////////////////////////////////////////////////
    /* Adjust the height and width according to the window size */
    //////////////////////////////////////////////////////////////
    pageHeight = $("#svg_output").height() * 100 / zoom ;
    pageWidth = $("#svg_output").width() * 100 / zoom ;
    options = {
                pageHeight: pageHeight,
                pageWidth: pageWidth,
                scale: zoom,
                adjustPageHeight: true
            };
    vrvToolkit.setOptions(options);
}

////////////////////////////////////////////////////////////////////////////////
/* A function that sets the options, loads the data and render the first page */
////////////////////////////////////////////////////////////////////////////////
function loadData(data) {
    setOptions();
    vrvToolkit.loadData(data);
    svg = vrvToolkit.renderToSVG(1, {});
    $("#svg_output").html(svg);
}

$(document).ready(function() {
    var file = "./mei/default.mei";
    $.ajax({
        url: file
        , dataType: "text"
        , success: function(data) {
            loadData(data);
        }
    });
});