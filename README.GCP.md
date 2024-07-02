```mermaid

graph TD

  ShopifyOrders("Shopify Order Data")

  ShopifyApi("Shopify Admin GraphQL for Order reading")

  GcpRestApiBigQueryDataSet("GCP REST API for BigQuery Dataset creation")

  GcpRestApiBigQueryTable("GCP REST API for BigQuery Dataset Table creation")

  GcpRestApiBigQueryInsert("GCP REST API for BigQuery Dataset Table insertion")

  GcpRestApiVertexDataset("GCP REST API for Vertex AI Dataset creation")

  GcpRestApiVertexRun("GCP REST API for Vertex AI Pineline running")

  GcpRestApiVertexResult("Vertex AI ML Analysis")

  ShopifyOrders-->ShopifyApi

  GcpRestApiBigQueryDataSet-->GcpRestApiBigQueryTable

  GcpRestApiBigQueryTable-->GcpRestApiBigQueryInsert

  ShopifyApi-->|Order Data JSON|GcpRestApiBigQueryInsert

  GcpRestApiBigQueryInsert-->GcpRestApiVertexDataset

  GcpRestApiVertexDataset-->GcpRestApiVertexRun

  GcpRestApiVertexRun-->GcpRestApiVertexResult



```