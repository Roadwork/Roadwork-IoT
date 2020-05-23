$EXECUTION_PATH = $(Get-Location).Path
$NAME = $args[0]
$LOCATION_DOCKERFILE = $args[1]

if ($NAME -eq $null -Or $LOCATION_DOCKERFILE -eq $null) {
  echo "Usage: ./build.sh <NAME> <LOCATION_DOCKERFILE>"
  echo "Example: ./build.sh demo-grpc-server Server/"
  exit 1
}

$DOCKER_IMAGE = "$NAME`:latest"

cd $LOCATION_DOCKERFILE
docker build -t $DOCKER_IMAGE .
cd $EXECUTION_PATH