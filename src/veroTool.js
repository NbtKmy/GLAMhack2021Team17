var vrvToolkit = new verovio.toolkit();

            ////////////////////////////////////
            /* Load the file using a HTTP GET */
            ////////////////////////////////////
            $.ajax({
                url: "./mei/default.mei"
                , dataType: "text"
                , success: function(data) {
                    var svg = vrvToolkit.renderData(data, {});
                    $("#svg_output").html(svg);
                }
            });