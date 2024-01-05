#!/usr/bin/env python3
import pathlib
import argparse
from schema_tools.schema import SchemaPath, Schema


def print_object(obj: Schema):
    path = "/".join(obj.path.chunks[1:])
    id = obj.path.chunks[-1]
    print("<h2 id=\"%s\">%s</h2>\n" % (id, obj["title"]))
    print("{schema_string:%s/description}\n" % path)
    if obj["type"] == "integer":
        print("{schema_enum:%s}\n\n" % id)
    else:
        print("{schema_object:%s}\n\n" % path)


root = pathlib.Path(__file__).absolute().parent.parent

parser = argparse.ArgumentParser()
parser.add_argument(
    "--schema",
    help="Schema file",
    type=pathlib.Path,
    default=root / "docs" / "lottie.schema.json"
)
parser.add_argument(
    "path",
    help="Schema path",
    type=SchemaPath,
)
args = parser.parse_args()

schema = Schema.load(args.schema).get_ref(args.path)

if "type" in schema:
    print_object(schema)
else:
    for v in schema:
        print_object(v)
