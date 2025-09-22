# 🚀 Zero-Downtime VM to Kubernetes Migration with Istio

> Migrate legacy applications from VMs to Kubernetes with zero downtime using Istio service mesh and canary deployments.

[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Istio](https://img.shields.io/badge/Istio-466BB0?style=for-the-badge&logo=istio&logoColor=white)](https://istio.io/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 🎯 What This Does

- **Hybrid Deployment**: Run applications on VM and Kubernetes simultaneously
- **Zero Downtime**: Gradually shift traffic from VM to K8s (80/20 → 50/50 → 0/100)
- **Instant Rollback**: One command to revert all traffic to VM
- **Canary Testing**: Route specific traffic to K8s with headers

## 🏗️ Architecture

```
Client Traffic
     ↓
Istio Gateway
     ↓
VirtualService (80% VM, 20% K8s)
     ↓                    ↓
WorkloadEntry      Kubernetes Pods
(VM App)           (Containerized App)
```

## ⚡ Quick Start

### Prerequisites
- Docker Desktop 
- Node.js 18+
- k3d

### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/vm-k8s-migration-istio
cd vm-k8s-migration-istio
```

### 2. Install Tools
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/

# Install k3d
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Install istioctl
curl -L https://istio.io/downloadIstio | sh -
sudo mv istio-*/bin/istioctl /usr/local/bin/
```

### 3. Start VM Application
```bash
npm install
npm start &

# Test VM app
curl http://localhost:3000
```

### 4. Create Kubernetes Cluster
```bash
# Create cluster
k3d cluster create migration-cluster \
  --port "8080:80@loadbalancer" \
  --agents 2

# Install Istio
istioctl install --set values.defaultRevision=default -y
kubectl label namespace default istio-injection=enabled
```

### 5. Deploy to Kubernetes
```bash
# Build and load image
docker build -t migration-demo:v1.0 .
k3d image import migration-demo:v1.0 -c migration-cluster

# Deploy application
kubectl apply -f k8s-deployment.yaml

# Wait for pods
kubectl get pods -w
```

### 6. Setup Hybrid Deployment
```bash
# Register VM in service mesh
kubectl apply -f vm-workloadentry.yaml

# Configure traffic routing
kubectl apply -f destination-rule.yaml
kubectl apply -f virtual-service.yaml
```

### 7. Test Migration
```bash
# Deploy test client
kubectl apply -f test-pod.yaml

# Test traffic distribution (80% VM, 20% K8s)
for i in {1..10}; do
  kubectl exec -it test-client -- curl -s http://migration-demo-service:3000 | grep platform
done

# Test canary routing (100% K8s)
kubectl exec -it test-client -- curl -s -H "canary: true" http://migration-demo-service:3000
```

## 📁 Files

```
├── app.js                    # Sample Node.js application
├── package.json              # Dependencies
├── Dockerfile                # Container definition
├── k8s-deployment.yaml       # Kubernetes deployment + service
├── vm-workloadentry.yaml     # VM registration in Istio
├── destination-rule.yaml     # Traffic routing subsets
├── virtual-service.yaml      # Canary deployment rules
└── test-pod.yaml            # Test client
```

## 🔄 Migration Process

### Adjust Traffic Weights
Edit `virtual-service.yaml`:

```yaml
# Phase 1: Start conservative
weight: 90  # VM
weight: 10  # Kubernetes

# Phase 2: Increase gradually  
weight: 50  # VM
weight: 50  # Kubernetes

# Phase 3: Complete migration
weight: 0   # VM
weight: 100 # Kubernetes
```

Apply changes:
```bash
kubectl apply -f virtual-service.yaml
```

### Emergency Rollback
```bash
kubectl patch virtualservice migration-demo-vs --type='merge' -p='
{
  "spec": {
    "http": [{
      "route": [{
        "destination": {
          "host": "migration-demo-service",
          "subset": "vm"
        },
        "weight": 100
      }]
    }]
  }
}'
```

## 🐞 Common Issues

**Pods not starting:**
```bash
kubectl describe pods
kubectl logs <pod-name>
```

**Traffic not splitting:**
```bash
kubectl get virtualservice migration-demo-vs -o yaml
kubectl get endpoints migration-demo-service
```

**VM not reachable:**
```bash
kubectl get workloadentry
kubectl exec -it test-client -- telnet host.k3d.internal 3000
```

## 📖 Detailed Guide

Read the complete tutorial: [Zero-Downtime VM to Kubernetes Migration with Istio](https://dev.to/yourusername/your-blog-post-link)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Create Pull Request
---

⭐ **Star this repo if it helped you migrate without downtime!**
