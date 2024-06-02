import csv
import json

# Define the CSV file name
csv_file_name = "data/raw csv/aex.csv"  # Update this to your CSV file path
# Define the JSON file name
json_file_name = 'data/raw json/aex.json'  # Update this to your desired JSON file path

# Read the CSV and convert to JSON
data = []
try:
    with open(csv_file_name, mode='r', encoding='utf-8') as csvfile:
        csvreader = csv.DictReader(csvfile)
        for row in csvreader:
            data.append(row)
except FileNotFoundError:
    print(f"File {csv_file_name} not found.")

# Save the JSON
try:
    with open(json_file_name, mode='w', encoding='utf-8') as jsonfile:
        jsonfile.write(json.dumps(data, indent=4))
except IOError:
    print(f"Could not write to file {json_file_name}.")

