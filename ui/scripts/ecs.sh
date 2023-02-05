#!/bin/bash
yum install -y aws-cli
aws s3 cp s3://a11ywatch_secrets/ecs.config /etc/ecs/ecs.config