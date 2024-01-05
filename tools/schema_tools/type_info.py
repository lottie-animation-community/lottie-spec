import json
from .schema import Schema, SchemaPath


class TypeSystem:
    def __init__(self, schema: Schema):
        self.types = {}
        self.modules = {}
        schema.type = self
        self.schema = schema

        for name, value in (schema / "$defs").items():
            self.modules[name] = Module(self, value)

        for type in self.types.values():
            type.resolve()

    def from_path(self, path: SchemaPath) -> "Type":
        if isinstance(path, str):
            path = SchemaPath(path)
        path.ensure_defs()
        return self.types[str(path)]

    @staticmethod
    def load(path):
        with open(path) as file:
            schema_data = Schema(json.load(file))
        return TypeSystem(schema_data)


class Type:
    def __init__(self, type_system: TypeSystem, schema: Schema):
        self.type_system = type_system
        self.schema = schema
        self.ref = str(schema.path)
        self.slug = schema.path.chunks[-1]
        self.title = schema.get("title", self.slug)
        self.description = schema.get("description", self.title)
        id_chunks = list(schema.path.chunks)
        id_chunks.pop(0)
        self.id = "-".join(map(str, id_chunks))
        schema.type = self

    def resolve(self):
        pass


class Property(Type):
    def __init__(self, type_system: TypeSystem, schema: Schema):
        super().__init__(type_system, schema)
        self.const = schema.get("const", None)

    def resolve_type(self, schema: Schema):
        if "oneOf" in schema:
            return [self.resolve_type(choice) for choice in schema / "oneOf"]
        if "$ref" in schema:
            return self.type_system.types[schema["$ref"]]
        return schema.get("type", None)

    def resolve(self):
        self.type = self.resolve_type(self.schema)
        if "items" in self.schema:
            self.item_type = self.resolve_type(self.schema / "items")
        else:
            self.item_type = ""


class Class(Type):
    def __init__(self, type_system: TypeSystem, schema: Schema):
        super().__init__(type_system, schema)

        self.base_refs = []
        self.properties = {}
        self.bases = []
        self.derived = []

        if "allOf" in schema:
            for item in schema / "allOf":
                if "$ref" in item:
                    self.base_refs.append(item.get("$ref"))
                else:
                    self.get_properties(item)

        self.get_properties(schema)

    def get_properties(self, schema: Schema):
        if "properties" in schema:
            for name, value in (schema / "properties").items():
                self.properties[name] = Property(self.type_system, value)

    def resolve(self):
        for ref in self.base_refs:
            base = self.type_system.types[ref]
            self.bases.append(base)
            base.derived.append(self)

        for prop in self.properties.values():
            prop.resolve()

    def all_properties(self, props=None):
        if props is None:
            props = {}

        for base in self.bases:
            base.all_properties(props)

        props.update(self.properties)
        return props


class ConcreteClass(Type):
    def __init__(self, type_system: TypeSystem, schema: Schema):
        super().__init__(type_system, schema)
        self.target_ref = self.ref.replace("/all-", "/")[:-1]
        self.concrete = []

    def resolve(self):
        self.target = self.type_system.types[self.target_ref]
        for schema in self.schema / "oneOf":
            self.concrete.append(self.type_system.from_path(schema.get("$ref")))


class EnumValue(Type):
    def __init__(self, type_system: TypeSystem, schema: Schema):
        super().__init__(type_system, schema)
        self.value = self.schema.get("const")
        if self.description == self.title:
            self.description = None


class Enum(Type):
    def __init__(self, type_system: TypeSystem, schema: Schema):
        super().__init__(type_system, schema)
        self.values = [
            EnumValue(type_system, value)
            for value in schema / "oneOf"
        ]


class Module(Type):
    def __init__(self, type_system: TypeSystem, schema: Schema):
        super().__init__(type_system, schema)
        self.types = {}

        for name, value in schema.items():
            type = self.make_type(name, value)
            self.type_system.types[type.ref] = type
            self.types[type.slug] = type

    def make_type(self, name: str, schema: Schema):
        type = schema.get("type", None)
        if type == "object":
            return Class(self.type_system, schema)

        if type in ("integer", "string") and "oneOf" in schema:
            return Enum(self.type_system, schema)

        if name.startswith("all-"):
            return ConcreteClass(self.type_system, schema)

        return Type(self.type_system, schema)
