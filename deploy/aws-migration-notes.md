# AWS Migration Notes — Pet Dogs

This document describes what to change when moving from the GoDaddy VPS to AWS.
Each section links the relevant env var, Docker service, or source file to update.

---

## 1. PostgreSQL → AWS RDS

**Why:** RDS gives automated backups, point-in-time recovery, and Multi-AZ failover.

**Steps:**
1. Create an RDS instance (PostgreSQL 16, `db.t4g.micro` for starters).
2. Set the security group to allow inbound 5432 from your EC2 / ECS task security group.
3. Update `.env.prod`:
   ```
   DATABASE_URL=postgresql+asyncpg://<user>:<password>@<rds-endpoint>.rds.amazonaws.com:5432/petdogs
   ```
4. Remove (or comment out) the `postgres` service block in `docker-compose.prod.yml`.
5. Run migrations once from a bastion host or ECS task:
   ```
   alembic upgrade head
   ```

---

## 2. Redis → AWS ElastiCache

**Why:** ElastiCache (Redis) is managed, supports cluster mode, and Multi-AZ.

**Steps:**
1. Create an ElastiCache cluster (Redis 7, `cache.t4g.micro` for starters).
2. Place it in the same VPC as your EC2 / ECS cluster.
3. Update `.env.prod`:
   ```
   REDIS_URL=redis://<elasticache-endpoint>.cache.amazonaws.com:6379/0
   ```
4. Remove (or comment out) the `redis` service block in `docker-compose.prod.yml`.

---

## 3. Image Storage: Cloudinary → S3 + CloudFront

**Why:** Keeps media in your AWS account, cheaper at scale, integrates with IAM.

**Steps:**
1. Create an S3 bucket (`petdogs-media-prod`). Enable versioning. Block public access.
2. Create a CloudFront distribution pointing to the bucket (use an OAC).
3. Create an IAM user (or instance role) with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on that bucket.
4. Update `.env.prod` — remove Cloudinary vars, add:
   ```
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_S3_BUCKET=petdogs-media-prod
   AWS_S3_REGION=us-east-1
   AWS_CLOUDFRONT_URL=https://xxxxxxxxxxxx.cloudfront.net
   ```
5. Rewrite `backend/app/services/storage_service.py`:
   - Replace the `cloudinary` SDK calls with `boto3.client("s3")`.
   - Use `s3.put_object(...)` for uploads and return `{cloudfront_url}/{key}` as the public URL.
   - Use `s3.delete_object(...)` for deletes.

---

## 4. Compute: Docker Compose on VPS → ECS (Fargate) or EC2

**Option A — EC2 + Docker Compose (easiest lift-and-shift):**
1. Launch an EC2 instance (e.g. `t3.small`, Amazon Linux 2023).
2. Install Docker + Docker Compose.
3. `scp` `.env.prod` to the instance.
4. Clone the repo, run `./deploy/godaddy-deploy.sh` (update `PROJECT_DIR`).

**Option B — ECS Fargate (fully managed, recommended for scale):**
1. Push Docker images to ECR:
   ```
   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker build -t petdogs-backend ./backend
   docker tag petdogs-backend:latest <ecr-uri>/petdogs-backend:latest
   docker push <ecr-uri>/petdogs-backend:latest
   ```
2. Create an ECS cluster, task definitions for `backend` and `frontend`, and services.
3. Store secrets in AWS Secrets Manager and reference them in the task definition
   (`secrets` block) — replaces `.env.prod`.
4. Use an Application Load Balancer (ALB) in front of the ECS services.

---

## 5. SSL: Self-managed Certs → AWS Certificate Manager (ACM) + ALB

**Why:** ACM certificates auto-renew and integrate seamlessly with ALB.

**Steps:**
1. Request a public certificate in ACM for your domain (DNS validation via Route 53).
2. Attach the certificate to the ALB HTTPS listener (port 443).
3. Add an ALB listener rule to redirect HTTP → HTTPS.
4. Remove the `nginx/ssl/` volume mount from `docker-compose.prod.yml`.
5. Simplify `nginx/nginx.conf` — remove the SSL server block (ALB terminates TLS).
   The nginx container only needs to listen on port 80 (ALB → nginx → backend/frontend).

---

## 6. DNS: GoDaddy DNS → Route 53 (optional)

1. Create a hosted zone in Route 53 for your domain.
2. Update the NS records at GoDaddy to point to the Route 53 name servers.
3. Add an `A` (Alias) record pointing to the ALB DNS name.

---

## 7. Cost Estimate (minimal AWS stack)

| Service         | Size            | Est. $/month |
|-----------------|-----------------|--------------|
| EC2 t3.small    | 2 vCPU, 2 GB    | ~$17         |
| RDS t4g.micro   | 2 vCPU, 1 GB    | ~$15         |
| ElastiCache t4g.micro | 2 vCPU, 1 GB | ~$13      |
| S3 + CloudFront | 50 GB + 100 GB  | ~$5          |
| ALB             | 1 ALB           | ~$18         |
| **Total**       |                 | **~$68/mo**  |

> Costs vary by region and data transfer. Use the [AWS Pricing Calculator](https://calculator.aws/pricing/2/home) for a precise estimate.

---

## Migration Checklist

- [ ] Create RDS instance and test connection
- [ ] Migrate existing Postgres data: `pg_dump` on VPS → `pg_restore` into RDS
- [ ] Create ElastiCache cluster and update `REDIS_URL`
- [ ] Create S3 bucket + CloudFront distribution
- [ ] Rewrite `storage_service.py` to use S3
- [ ] Migrate existing Cloudinary images to S3 (one-time script)
- [ ] Push backend + frontend images to ECR
- [ ] Create ECS task definitions (or set up EC2)
- [ ] Request ACM certificate and attach to ALB
- [ ] Update DNS to point to ALB
- [ ] Smoke-test all API endpoints and image uploads
- [ ] Monitor CloudWatch logs for the first 24 hours
