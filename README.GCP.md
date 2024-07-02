```mermaid

graph TD

  ShopifyApi("Shopify Admin GraphQL")

  GcpRestApiBigQueryDataSet("GCP REST API for BigQuery Dataset creation")

  GcpRestApiBigQueryTable("GCP REST API for BigQuery Dataset Table creation")

  GcpRestApiBigQueryInsert("GCP REST API for BigQuery Dataset Table insertion")

  GcpRestApiVertexDataset("GCP REST API for Vertex AI Dataset creation")

  GcpRestApiVertexRun("GCP REST API for Vertex AI Pineline running")

  GcpRestApiBigQueryDataSet-->GcpRestApiBigQueryTable

  GcpRestApiBigQueryTable-->GcpRestApiBigQueryInsert

  ShopifyApi-->|Order Data JSON|GcpRestApiBigQueryInsert



```