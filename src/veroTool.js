var vrvToolkit = new verovio.toolkit();
var zoom = 40;

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