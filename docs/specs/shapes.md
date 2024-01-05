# Shapes

The graphical elements are divided in 4 categories:

* [Shapes](#shape) that define the actual curves but have no styling information
* [Grouping](#grouping), used to organize collections of graphic elements
* [Styles](#shape-style), that define the visual appearance of shapes
* [Modifiers](#modifier) alter the curves of the shapes

<h2 id="graphic-element">Graphic Element</h2>

{schema_string:shapes/graphic-element/description}

{schema_object:shapes/graphic-element}

The `ty` property defines the specific element type based on the following values:

{schema_subtype_table:shapes/all-graphic-elements:ty}


<h2 id="shape">Shapes</h2>

{schema_string:shapes/shape/description}

{schema_object:shapes/shape}


<h3 id="ellipse">Ellipse</h3>

{schema_string:shapes/ellipse/description}

{schema_object:shapes/ellipse}

<lottie-playground example="ellipse.json">
    <title>Example</title>
    <form>
        <input title="Position x" type="range" min="0" max="512" value="256"/>
        <input title="Position y" type="range" min="0" max="512" value="256"/>
        <input title="Width" type="range" min="0" max="512" value="256"/>
        <input title="Height" type="range" min="0" max="512" value="256"/>
    </form>
    <json>lottie.layers[0].shapes[0].it[0]</json>
    <script>
    lottie.layers[0].shapes[0].it[0].p.k = [
        data["Position x"], data["Position y"]
    ];
    lottie.layers[0].shapes[0].it[0].s.k = [
        data["Width"], data["Height"]
    ];
    </script>
</lottie-playground>


<h3 id="path">Path</h3>

{schema_string:shapes/path/description}

{schema_object:shapes/path}

<lottie-playground example="path.json">
    <title>Example</title>
    <form>
        <input title="Shape" type="bezier"/>
    </form>
    <json>lottie.layers[0].shapes[0].it[0]</json>
    <script>
        var shape = lottie.layers[0].shapes[0].it[0];
        if ( data["Shape"] )
            shape.ks.k = data["Shape"];
    </script>
</lottie-playground>

<h3 id="rectangle">Rectangle</h3>

{schema_string:shapes/rectangle/description}

{schema_object:shapes/rectangle}

<lottie-playground example="rectangle.json">
    <title>Example</title>
    <form>
        <input title="Position x" type="range" min="0" max="512" value="256"/>
        <input title="Position y" type="range" min="0" max="512" value="256"/>
        <input title="Width" type="range" min="0" max="512" value="256"/>
        <input title="Height" type="range" min="0" max="512" value="256"/>
        <input title="Roundness" type="range" min="0" max="512" value="0"/>
    </form>
    <json>lottie.layers[0].shapes[0].it[0]</json>
    <script>
    lottie.layers[0].shapes[0].it[0].p.k = [
        data["Position x"], data["Position y"]
    ];
    lottie.layers[0].shapes[0].it[0].s.k = [
        data["Width"], data["Height"]
    ];
    lottie.layers[0].shapes[0].it[0].r.k = data["Roundness"];
    </script>
</lottie-playground>

<h2 id="grouping">Grouping</h2>

<h3 id="group">Group</h3>

{schema_string:shapes/group/description}

{schema_object:shapes/group}

<h3 id="transform">Transform</h3>

{schema_string:shapes/transform/description}

{schema_object:shapes/transform}


<h2 id="shape-style">Style</h2>

{schema_string:shapes/shape-style/description}

{schema_object:shapes/shape-style}


<h3 id="fill">Fill</h3>

{schema_string:shapes/fill/description}

{schema_object:shapes/fill}

<lottie-playground example="fill.json">
    <title>Example</title>
    <form>
        <input title="Red" type="range" min="0" max="1" step="0.01" value="1"/>
        <input title="Green" type="range" min="0" max="1" step="0.01" value="0.98"/>
        <input title="Blue" type="range" min="0" max="1" step="0.01" value="0.28"/>
        <input title="Opacity" type="range" min="0" max="100" value="100"/>
        <enum title="Fill Rule">fill-rule</enum>
    </form>
    <json>lottie.layers[0].shapes[0].it[1]</json>
    <script>
        var shape = lottie.layers[0].shapes[0].it[1];
        shape.c.k = [data["Red"], data["Green"], data["Blue"]];
        shape.o.k = data["Opacity"];
        shape.r = Number(data["Fill Rule"]);
    </script>
</lottie-playground>


<h2 id="modifier">Modifiers</h2>

{schema_string:shapes/modifier/description}


<h3 id="trim-path">Trim Path</h3>

{schema_string:shapes/trim-path/description}

{schema_object:shapes/trim-path}

<lottie-playground example="trim_path.json">
    <form>
        <input title="Start" type="range" min="0" value="0" max="100"/>
        <input title="End" type="range" min="0" value="50" max="100"/>
        <input title="Offset" type="range" min="0" value="0" max="360"/>
        <enum title="Multiple Shapes">trim-multiple-shapes</enum>
    </form>
    <json>lottie.layers[0].shapes[4]</json>
    <script>
        lottie.layers[0].shapes[4].s.k = data["Start"];
        lottie.layers[0].shapes[4].e.k = data["End"];
        lottie.layers[0].shapes[4].o.k = data["Offset"];
        lottie.layers[0].shapes[4].m = Number(data["Multiple Shapes"]);
    </script>
</lottie-playground>
