```mermaid

graph LR

  ShopifyApi("Shopify Admin GraphQL")

  GcpRestApiBigQueryDataSet("GCP REST API - BigQuery Dataset")

  ShopifyApi-->|Order Data JSON|GcpRestApiBigQueryDataSet



```