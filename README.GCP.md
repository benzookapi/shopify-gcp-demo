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

  ShopifyApi-->|Order Data JSON Array -> needs 1000 records|GcpRestApiBigQueryInsert

  GcpRestApiBigQueryInsert-->|BigQuery URI|GcpRestApiVertexDataset

  GcpRestApiVertexDataset-->|Dataset Id + Target Column -> 'amount' or 'country'|GcpRestApiVertexRun

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
1. Get your GCP project ID from [GCP dashboard](https://console.cloud.google.com/).
2. Get your GCP REST API access token using [the command](https://cloud.google.com/sdk/docs/install) of [gcloud auth print-access-token](https://cloud.google.com/sdk/gcloud/reference/auth/print-access-token) (note that this token gets expired soon, if you see the error of authentication in your severside console, run the command again to get the latest token). 
3. Run this app with `shopify app dev` or starting in your hosted server (for more details, read [README.md](./README.GCP.md) or [Shopify.dev](https://shopify.dev/docs/apps/build/scaffold-app)).
4. Go to the menu on the app navigation named `GCP Vertex AI Demo`.
5. Input the project id, access token above and other items and click the button on the bottom.
6. After a while, you will see the result link below the button to navigate you to the GCP training detail page.


# Check the code
You can read the all code in [This file](./app/routes/app.gcp.jsx).

# Notes
- You need more than 1,000 records (orders) at least to run the AI training.
- Training takes a hour or longer, and not guranteed to get finished successfully.

# TODO
- Currently, the order items are afew and the training is hardcoded as `classification` only. For more effective AI training, more data items and other type and paramaters like forecasting are required. 