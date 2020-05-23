$EXECUTION_PATH = $(Get-Location).Path
$KUBERNETES_DEPLOY_FILE = $args[0]

if ($KUBERNETES_DEPLOY_FILE -eq $null) {
  echo "Usage: ./deploy.sh <KUBERNETES_DEPLOY_FILE>"
  echo "Example: ./build.sh telemetry-processor-azure"
  exit 1
}

kubectl apply -f $KUBERNETES_DEPLOY_FILE