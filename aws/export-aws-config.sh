#!/usr/bin/env bash
# ==============================================================================
# Exports the EC2 configuration of one instance into ./aws-export/<name>/
# Usage: ./export-aws-config.sh <instance-id> <region> <project-name>
# Example: ./export-aws-config.sh i-0xxxxxxxxxxxxxx eu-north-1 resume-ats
#
# Run it from AWS CloudShell or your local terminal (after `aws configure`).
# It only READS configuration. It does NOT export private keys or secrets.
# ==============================================================================

set -euo pipefail

INSTANCE_ID="${1:?instance id required, e.g. i-0xxxxxxxxxxxxxx}"
REGION="${2:-eu-north-1}"
NAME="${3:-resume-ats}"

OUT="aws-export/${NAME}"
mkdir -p "$OUT"

echo "=========================================================="
echo "🚀 Exporting AWS EC2 Configuration for: ${NAME}"
echo "Instance ID : ${INSTANCE_ID}"
echo "Region      : ${REGION}"
echo "Output Dir  : ${OUT}"
echo "=========================================================="

echo "1/6 Exporting instance details..."
aws ec2 describe-instances --region "$REGION" --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0]' --output json > "$OUT/instance.json"

echo "2/6 Exporting security groups..."
SG_IDS=$(aws ec2 describe-instances --region "$REGION" --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].SecurityGroups[].GroupId' --output text)
# shellcheck disable=SC2086
aws ec2 describe-security-groups --region "$REGION" --group-ids $SG_IDS \
  --output json > "$OUT/security-groups.json"

echo "3/6 Exporting storage volumes..."
aws ec2 describe-volumes --region "$REGION" \
  --filters "Name=attachment.instance-id,Values=$INSTANCE_ID" \
  --output json > "$OUT/volumes.json"

echo "4/6 Exporting Elastic IP bindings..."
aws ec2 describe-addresses --region "$REGION" \
  --filters "Name=instance-id,Values=$INSTANCE_ID" \
  --output json > "$OUT/elastic-ip.json"

echo "5/6 Exporting launch-template style configuration..."
aws ec2 get-launch-template-data --region "$REGION" --instance-id "$INSTANCE_ID" \
  --query 'LaunchTemplateData' --output json > "$OUT/launch-template-data.json"

echo "6/6 Redacting sensitive values and AWS account IDs..."
for f in "$OUT"/*.json; do
  sed -E -i.bak \
    -e 's/"UserData": *"[^"]*"/"UserData": "REDACTED"/' \
    -e 's/"KeyName": *"[^"]*"/"KeyName": "REDACTED"/' \
    -e 's/[0-9]{12}/123456789012/g' \
    "$f"
  rm -f "$f.bak"
done

cat > "$OUT/SUMMARY.md" <<EOF
# ${NAME} - EC2 Infrastructure Export
- Instance ID: ${INSTANCE_ID}
- Region: ${REGION}
- Exported: $(date -u +"%Y-%m-%d %H:%M UTC")
- Files: instance.json, security-groups.json, volumes.json, elastic-ip.json, launch-template-data.json
- Redacted: 12-digit AWS account IDs, SSH key pair name, UserData
EOF

# Package into zip for easy 1-click download from AWS CloudShell
ZIP_NAME="${NAME}-aws-export.zip"
zip -r "$ZIP_NAME" "$OUT" > /dev/null

echo "=========================================================="
echo "✅ Export complete! Configuration saved in: $OUT/"
echo "📦 Archive created: $ZIP_NAME"
echo "👉 In CloudShell: Click 'Actions' (top right) -> 'Download file' -> Enter: $ZIP_NAME"
echo "=========================================================="
