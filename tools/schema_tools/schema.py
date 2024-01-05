import json


class SchemaPath:
    """
    Path inside a Schema object
    """
    def __init__(self, path=None):
        if isinstance(path, str):
            self.chunks = [int(chunk) if chunk.isdigit() else chunk for chunk in path.strip("#/").split("/")]
        elif path is None:
            self.chunks = []
        elif isinstance(path, SchemaPath):
            self.chunks = list(path.chunks)
        else:
            self.chunks = list(path)

    def __itruediv__(self, chunk):
        self.chunks.append(chunk)

    def __truediv__(self, chunk):
        return SchemaPath(self.chunks + [chunk])

    def walk(self, schema):
        for chunk in self.chunks:
            if not self.valid_step(schema, chunk):
                return None
            schema = self.step(schema, chunk)
        return schema

    @classmethod
    def step(cls, schema, chunk):
        return schema[chunk]

    @classmethod
    def valid_step(cls, schema, chunk):
        if isinstance(chunk, int) and isinstance(schema, list):
            return 0 <= chunk < len(schema)
        elif chunk not in schema:
            return False
        return True

    def ensure_defs(self):
        if self.chunks[0] != "$defs":
            self.chunks.insert(0, "$defs")

    def __str__(self):
        return "#/" + "/".join(map(str, self.chunks))


class Schema:
    """
    Class to access data from a JSON schema
    """
    def __init__(self, schema, path=None):
        self.schema = schema
        self.path = SchemaPath(path)

    def __getitem__(self, key):
        return self.child(key).value

    def __truediv__(self, key):
        return self.child(key)

    def __contains__(self, item):
        return isinstance(self.schema, dict) and item in self.schema

    def get(self, key, default=None):
        return self.schema.get(key, default) if isinstance(self.schema, dict) else default

    @property
    def value(self):
        return self.schema

    def __iter__(self):
        if isinstance(self.schema, list):
            iter = enumerate(self.schema)
        elif isinstance(self.schema, dict):
            iter = self.schema.items()
        else:
            return

        for key, value in iter:
            if isinstance(value, (object, list)):
                yield self / key

    def get_ref(self, path):
        path = SchemaPath(path)
        obj = path.walk(self)
        if obj is None:
            raise Exception("Schema object %s not found" % path)
        return Schema(obj, path)

    def items(self):
        if isinstance(self.schema, dict):
            for k, v in self.schema.items():
                yield k, Schema(v, self.path / k)
        return None

    def child(self, key):
        return Schema(SchemaPath.step(self.schema, key), self.path / key)

    @classmethod
    def load(cls, file):
        if hasattr(file, "read"):
            return cls(json.load(file))

        with open(file, "r") as f:
            return cls(json.load(f))
