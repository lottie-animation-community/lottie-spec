# Adding to the Schema

The Lottie specification has a machine-readable definitions which uses
[JSON Schema](https://json-schema.org/).

There are many different ways of formatting the schema so here are some
guidelines to ensure consistency.

## Guidelines

### Object Model Approach

Objects in the schema are organized in a way that simulated an object model.

This allows for implementation to have a (non-binding) foundation for their
internal structure and provides easy organization of the human-readable
documentation.

This means there can be some "abstract" type definitions, which
will contain the common properties and descriptions of concrete sub-types.

Object inheritance is simulated using `allOf`, with `$ref` items referring to
"base" definitions.

### Split Files

Each object or significant data type is split in its own file under `/schema`.
These files are grouped together within a shallow list of directories.

The files will be joined together into a single schema using `/tools/schema-merge.py`.

### Required Properties

Each type defined by the schema must have a `type`, as well as `title` and `description`.

`title` should consist of a couple words that can be used to name the described object.

`description` should contain a concise description that gives an idea of the purpose of that object.

### Enumerations

Enumerations are defined in a file under `/schema/constants` have `oneOf`
defining, `title`, `description`, and `const` for every possible value
of the enumeration.

### `all` Files

Some types have several sub-types in the schema, and properties might want
to accept a value to any of the concrete sub-types.

To ensure references to these types are consistent, you can create an additional
schema file with the list of acceptable values.

For example if you have an abstract type in `item.json`, the file will be
`all-items.json`, and contain `oneOf` with `$ref`s to the acceptable types.


## Writing Documentation

Every type defined in the documentation must be documented.

Schema documentation files go under `/docs/specs`, and there must be a
file for each directory under `/schema`, with anchors for every type
defined in that schema directory.

### Pulling Data from the Schema

There are several [Markdown extensions](extensions.md) available,
every object and enumeration must have the relevant table to show its
structure and an example playground should be provided for every visual element.


### Building the Documentation

There are several Python scripts that are used in the build process,
ensure the requirements listed under `/tools/requirements.txt` are
installed in your Python environment.

The first step is to build the combined schema:

```bash
tools/schema-merge.py
```

It's important to call this after every schema change as the markdown
extensions pull the data from this, and internal links are updated based
on the combined file.

To run the documentation locally you can use:

```bash
tools/mkdocs serve
```

This will create a local server that renders the documentation and it
will reload if anything under `/docs` changes.

To build a static HTML site run the following:

```bash
./tools/mkdocs build -d site
```

The output will be in `/site`.

### Schema Validation

You can validate schema syntax and internal references using

```bash
./tools/schema-validate.py
```

To validate that each section is documented, you can pass the path
to the built site:

```bash
./tools/schema-validate.py --html site/specs/
```
