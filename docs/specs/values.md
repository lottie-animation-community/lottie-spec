# Values

<h2 id="int-boolean">Integer Boolean</h2>

{schema_string:values/int-boolean/description}

<h2 id="vector">Vector</h2>

Vector data is represented by an array of numbers.
This is used any time a property with multiple components is needed.

An example would be a position, which would be represented as an array
with two numbers, the first corresponding to the _X_ coordinate and the
second corresponding to the _Y_.

<h2 id="color">Color</h2>

Colors are [Vectors](#vector) with values between 0 and 1 for the RGB components.

for example:

* {lottie_color:1, 0, 0}
* {lottie_color:1, 0.5, 0}

Note sometimes you might find color values with 4 components (the 4th being alpha)
but most players ignore the last component.

<h2 id="bezier">Bezier</h2>

{schema_string:values/bezier/description}

{schema_object:values/bezier}

{editor_example:bezier}
