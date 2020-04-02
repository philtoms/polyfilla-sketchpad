## Download sketch

curl 'https://sedate-efficacious-nation.glitch.me/sketch/data' > sketch.json

## Clear sketch data

curl 'https://sedate-efficacious-nation.glitch.me/sketch/data/clear'

## upload sketch

curl -X POST -H "Content-Type: application/json" -d @data.json https://sedate-efficacious-nation.glitch.me/sketch/data

## Download all data

curl 'https://sedate-efficacious-nation.glitch.me/data' > data.json

## upload all data

curl -X POST -H "Content-Type: application/json" -d @data.json https://sedate-efficacious-nation.glitch.me/data
