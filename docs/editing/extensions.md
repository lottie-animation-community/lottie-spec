# Markdown Extensions

This documentation comes with several markdown extensions that allow
interactive elements and data pulled from the schema.

## Schema Integration

### `schema_string`

Using a reference to a value in the JSON schema (without `$defs`) will embed that string
into the markdown text.

Example:

```
{schema_string:shapes/graphic-element/description}
```

Output:

{schema_string:shapes/graphic-element/description}

### `schema_link`

Link to the relevant section in the formatted schema.

Example:

```
{schema_link:shapes/ellipse}
```

Output:

{schema_link:shapes/ellipse}

### `schema_subtype_table`

Used to list all the `ty` values for Layer / Shape etc.


Example:

```
{schema_subtype_table:layers/all-layers:ty}
```

Output:

{schema_subtype_table:layers/all-layers:ty}

### `schema_object`

Embeds a property table from the schema.

Example:

```
{schema_object:shapes/ellipse}
```

Output:

{schema_object:shapes/ellipse}

### `schema_enum`

Same as `schema_object` but for enumerations.

Example:

```
{schema_enum:fill-rule}
```

Output:

{schema_enum:fill-rule}

### `schema_inheritance`

Shows the inheritance diagram for an object type.

Example:

```
{schema_inheritance:shapes/ellipse}
```

Output:

{schema_inheritance:shapes/ellipse}

### `json_file`

Embed a JSON file into markdown, including syntax highlighting and reference links for JSON schema.

Example:

```
{json_file:lottie.schema.json}
```

## Lottie Player

### `<lottie>`

Embeds a lottie into the document

Example:

```xml
<lottie
    src="static/logo.json"
    width="200"
    background="white"
/>
```

Output:

<lottie
    src="static/logo.json"
    width="200"
    background="white"
/>


### `lottie-playground`

Embeds a player side by side to a JSON snipped and controls to tweak the animation

Example:

```html
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
```

Output:

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
