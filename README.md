## Download data

curl 'https://sedate-efficacious-nation.glitch.me/opus-1/data' > data.json

## Clear server data

curl 'https://sedate-efficacious-nation.glitch.me/opus-1/data/clear'

## upload data

curl -X POST -H "Content-Type: application/json" -d @data.json https://sedate-efficacious-nation.glitch.me/opus-1/data
