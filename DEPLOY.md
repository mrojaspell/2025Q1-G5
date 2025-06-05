# Manual de Despliegue Cloud para Unimart (AWS Console)

**Versión:** 2.0

Este documento describe paso a paso cómo desplegar manualmente la infraestructura de Unimart utilizando la consola de AWS.

---

## 1. Crear la VPC

1. Buscar "VPC" en la consola de AWS.
2. Ingresar al panel de VPC y seleccionar **Create VPC**.
3. Completar con:
   - **VPC name:** Unimart-VPC  
   - **IPv4 CIDR block:** 10.0.0.0/16  
   - **Region:** us-east-1 (por defecto)
4. Crear la VPC.

---

## 2. Crear Subnets

1. Desde el panel de la VPC, ingresar a **Subnets**.
2. Hacer clic en **Create subnet**.
3. Completar para cada AZ (hacerlo dos veces):

### Subnet 1
- **Subnet name:** Subnet-AZ1  
- **Availability Zone:** us-east-1a  
- **IPv4 CIDR block:** 10.0.0.0/24  
- **VPC ID:** Unimart-VPC  

### Subnet 2
- **Subnet name:** Subnet-AZ2  
- **Availability Zone:** us-east-1b  
- **IPv4 CIDR block:** 10.0.1.0/24  
- **VPC ID:** Unimart-VPC  

4. Crear las subnets.

---

## 3. Crear Internet Gateway

1. Ir a **Internet Gateways**.
2. Crear uno nuevo:
   - **Name:** Unimart-IGW  
3. Entrar al nuevo IGW → **Actions** → **Attach to VPC**.
4. Seleccionar **Unimart-VPC**.

---

## 4. Configurar Route Table

1. Ir a **Route Tables** en el panel de VPC.
2. Puedes usar la tabla por defecto o crear una nueva:
   - **Name:** Unimart-public-RT  
   - **VPC:** Unimart-VPC  
3. Ingresar a la tabla y editar rutas:
   - **Destination:** 0.0.0.0/0  
   - **Target:** Unimart-IGW  
4. Guardar.
5. Ir a la pestaña **Subnet Associations** → **Edit subnet associations** y agregar ambas subnets.

---

## 5. Configurar Network ACLs

1. Ir a **Network ACLs**.
2. Puedes editar la ACL por defecto o crear una nueva:
   - **Name:** Unimart-NACL1  
   - **VPC:** Unimart-VPC  
3. Editar reglas:
   - **Inbound Rule 100:** Allow ALL, 0.0.0.0/0  
   - **Outbound Rule 100:** Allow ALL, 0.0.0.0/0  
4. Asociar ambas subnets desde **Subnet associations**.

---

## 6. Crear Security Group

1. Ir a **Security Groups** desde el panel de VPC.
2. Crear nuevo:
   - **Name:** Unimart-SG  
   - **Description:** Permite SSH y HTTP  
   - **VPC:** Unimart-VPC  
3. Agregar reglas:
   - **Inbound:**
     - SSH: TCP 22, 0.0.0.0/0  
     - HTTP: TCP 8000, 0.0.0.0/0  
   - **Outbound:** permitir todo (por defecto)

---

## 7. Crear Instancias EC2

1. Buscar **EC2** → **Instances** → **Launch Instance**.

### EC2-AZ1
- **Name:** EC2-AZ1  
- **AMI:** Amazon Linux 2023  
- **Instance type:** t2.micro  
- **Key Pair:** seleccionar uno válido  
- **VPC:** Unimart-VPC  
- **Subnet:** Subnet-AZ1  
- **Auto-assign Public IP:** Enabled  
- **Security Group:** Unimart-SG  
- **IAM Role:** LabInstanceProfile  

Lanzar la instancia.

### EC2-AZ2
Repetir el paso anterior, cambiando:
- **Name:** EC2-AZ2  
- **Subnet:** Subnet-AZ2  

---

## 8. Crear Bucket S3 para Frontend

1. Ir a **S3** → **Create bucket**.
2. Configurar:
   - **Name:** unimart-frontend  
   - **Region:** us-east-1  
3. **Desactivar el bloqueo de acceso público** (para permitir hosting estático).
4. Crear el bucket.
5. Ir a **Properties** → **Static website hosting** y habilitar.
6. Update el bucket policy con lo siguiente:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::unimart-frontend/*"
    }
  ]
}
```
7. Subir los archivos del SPA (index.html, etc.) al bucket.

---

## 9. Base de Datos (elegir solo una)

### Opción A: DynamoDB

1. Buscar **DynamoDB** → **Create table**.
2. Configurar:
   - **Table name:** unimart-products  
   - **Partition key:** ean (String)  
   - **No sort key**  
3. Crear GSIs:
   - **Index 1:**  
     - Name: category-ean-index  
     - Partition key: category  
     - Sort key: ean  
   - **Index 2:**  
     - Name: name_key-ean-index  
     - Partition key: name_key  
     - Sort key: ean  

### Opción B: Bucket S3 privado como base de datos

1. Ir a **S3** → **Create bucket**.
2. Configurar:
   - **Name:** unimart-products  
   - **Region:** us-east-1  
3. **Mantener el acceso público bloqueado.**
4. Crear el bucket.
5. Subir archivos JSON o CSV que contengan los datos de productos.
6. Crear política de acceso desde EC2:
   - Ir a **IAM > Roles** → seleccionar **LabInstanceProfile**
   - Adjuntar política que permita acceso a `s3:ListBucket` y `s3:GetObject` sobre `unimart-products`
7. Crear un VPC Gateway Endpoint para S3:

---

## 10. Crear VPC Gateway Endpoints

1. Ir a **Endpoints** en la sección de VPC.
2. Crear uno nuevo → **Service name:** `com.amazonaws.us-east-1.s3`
   - **Type:** Gateway  
   - **VPC:** Unimart-VPC  
   - **Route Table:** Unimart-public-RT  
   - Confirmar

3. (Solo si usás DynamoDB) Crear otro endpoint:
   - **Service name:** `com.amazonaws.us-east-1.dynamodb`

---

## 11. (Opcional) Configurar Route 53

1. Ir a **Route 53**.
2. Crear un **Hosted Zone** si tienes un dominio propio.
3. Crear registros tipo **A** que apunten al IP público de las instancias EC2.

---
