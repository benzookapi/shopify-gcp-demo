# Shopify GCP Vertex connecting

## Workflow

```mermaid

graph TD

  ShopifyOrders("Shopify Order Data")

  ShopifyApp("Shopify CLI Remix App")

  ShopifyApi("Shopify Admin API [Order reading]")

  GcpRestApiBigQueryDataSet("GCP REST API [BigQuery Dataset creation]")

  GcpRestApiBigQueryTable("GCP REST API [BigQuery Dataset Table creation]")

  GcpRestApiBigQueryInsert("GCP REST API [BigQuery Dataset Table insertion]")

  GcpRestApiVertexDataset("GCP REST API [Vertex AI Dataset creation]")

  GcpRestApiVertexRun("GCP REST API [Vertex AI Pineline running]")

  GcpRestApiVertexResult("Vertex ML Analysis")

  ShopifyOrders-->ShopifyApp

  ShopifyApp-->ShopifyApi

  GcpRestApiBigQueryDataSet-->|Dataset Name|GcpRestApiBigQueryTable

  GcpRestApiBigQueryTable-->|Dataset Name + Table Name|GcpRestApiBigQueryInsert

  ShopifyApi-->|Order Data JSON Array (*needs >1000 records)|GcpRestApiBigQueryInsert

  GcpRestApiBigQueryInsert-->|BigQuery URI|GcpRestApiVertexDataset

  GcpRestApiVertexDataset-->|Dataset Id + Target Column ('amount' or 'country')|GcpRestApiVertexRun

  GcpRestApiVertexRun-->GcpRestApiVertexResult


  classDef edge1 fill:#696969,color:white,font-weight:bold
  class ShopifyOrders edge1

  classDef shopify fill:#006400,color:white
  class ShopifyApp,ShopifyApi shopify

  classDef gcp fill:#FFA500,color:white
  class GcpRestApiBigQueryDataSet,GcpRestApiBigQueryTable,GcpRestApiBigQueryInsert,GcpRestApiVertexDataset,GcpRestApiVertexRun gcp

  classDef edge2 fill:#696969,color:white,font-weight:bold
  class GcpRestApiVertexResult edge2

```

## How to run
1. aa
2. bb