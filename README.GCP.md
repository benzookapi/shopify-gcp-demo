```mermaid

graph TD

  ShopifyOrders("Shopify Order Data")

  ShopifyApi("Shopify Admin GraphQL for Order reading")

  GcpRestApiBigQueryDataSet("GCP REST API for BigQuery Dataset creation")

  GcpRestApiBigQueryTable("GCP REST API for BigQuery Dataset Table creation")

  GcpRestApiBigQueryInsert("GCP REST API for BigQuery Dataset Table insertion")

  GcpRestApiVertexDataset("GCP REST API for Vertex AI Dataset creation")

  GcpRestApiVertexRun("GCP REST API for Vertex AI Pineline running")

  GcpRestApiVertexResult("Vertex ML Analysis")

  ShopifyOrders-->ShopifyApi

  GcpRestApiBigQueryDataSet-->GcpRestApiBigQueryTable

  GcpRestApiBigQueryTable-->GcpRestApiBigQueryInsert

  ShopifyApi-->|Order Data JSON|GcpRestApiBigQueryInsert

  GcpRestApiBigQueryInsert-->GcpRestApiVertexDataset

  GcpRestApiVertexDataset-->GcpRestApiVertexRun

  GcpRestApiVertexRun-->GcpRestApiVertexResult


  classDef start fill:#696969,color:white,font-weight:bold
  class ShopifyOrders start

  classDef shopify fill:#006400,color:white
  class ShopifyApi,GcpRestApiBigQueryDataSet,GcpRestApiBigQueryTable,GcpRestApiBigQueryInsert,GcpRestApiVertexDataset,GcpRestApiVertexRun shopify

  classDef gcp fill:#FFA500,color:white
  class ShopifyApi,GcpRestApiBigQueryDataSet,GcpRestApiBigQueryTable,GcpRestApiBigQueryInsert,GcpRestApiVertexDataset,GcpRestApiVertexRun gcp

  classDef end fill:#696969,color:white,font-weight:bold
  class GcpRestApiVertexResult end







```