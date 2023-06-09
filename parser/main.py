import os

# Example function to parse an OBJ file
def parse_obj_file(obj_data):
    vertices = []
    indices = []

    lines = obj_data.split("\n")

    for line in lines:
        line = line.strip()

        if not line:
            continue  # Skip empty lines

        if line.startswith("v "):
            values = line.split(" ")[1:]
            # Exclude empty strings before converting to float
            vertices.extend([float(v) for v in values if v])
        elif line.startswith("f "):
            values = line.split(" ")[1:]
            for value in values:
                index = int(value.split("/")[0]) - 1
                indices.append(index)

    return {"vertices": vertices, "indices": indices}


# Prompt user to enter the path to the OBJ file
obj_file_path = input("Enter the path to the OBJ file: ")

# Read OBJ file contents
with open(obj_file_path, "r") as file:
    obj_data = file.read()

# Parse OBJ file
result = parse_obj_file(obj_data)

# Extract vertices and indices
DEFAULT_VERT = result["vertices"]
DEFAULT_INDICES = result["indices"]

# Convert DEFAULT_VERT to a JavaScript-style string representation
vertices_str = "[\n" + ", ".join(str(vertex) for vertex in DEFAULT_VERT) + "\n]"

# Convert DEFAULT_INDICES to a JavaScript-style string representation
indices_str = "new Uint8Array([\n" + ", ".join(str(index) for index in DEFAULT_INDICES) + "\n]);"

# Create output file path in the same directory as the input file
output_file_dir = os.path.dirname(obj_file_path)
output_file_path = os.path.join(output_file_dir, "output.txt")

# Write results to the output file
with open(output_file_path, "w") as output_file:
    output_file.write("var DEFAULT_VERT = " + vertices_str + ";\n")
    output_file.write("var DEFAULT_INDICES = " + indices_str + "\n")

print("Results have been written to", output_file_path)


# /Users/creckerid/Desktop/a.obj