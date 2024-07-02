import { useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import {
    Page,
    Layout,
    TextField,
    Card,
    Button,
    BlockStack,
    FormLayout
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {

    const formData = await request.formData();

    // GCP project id
    const id = formData.get('id');
    // GCP access token
    const token = formData.get('token');
    // Data multipler to get enough data size
    const times = parseInt(formData.get('times'));
    // GCP BigQuery dataset name
    const dataset = formData.get('dataset');
    // GCP BigQuery table name
    const table = formData.get('table');
    // GCP Vertex training display name
    const display = formData.get('display');
    // GCP Vertex location
    const location = formData.get('location');

    console.log(`formData(id / token / times / dataset / table / display / location): ${id},  ${token},  ${times},  ${dataset},  ${table},  ${display}, ${location}`);

    const { admin } = await authenticate.admin(request);

    // 1. Get orders to store in BiGQuery and train in Vertex AI.
    const orderResponse = await admin.graphql(
        `#graphql
        {
	      orders(first: 100) {
	       edges {
            node {
             id
             name
             totalPriceSet {
              presentmentMoney {
                amount
                currencyCode
              }
             }
             shippingAddress {
              country
             }
            }
           }
	      }
        }`,
        null,
    );
    const orders = await orderResponse.json();
    const orderArray = orders.data.orders.edges.map((e) => {
        return {
            "json": {
                "id": e.node.id,
                "name": e.node.name,
                "amount": e.node.totalPriceSet.presentmentMoney.amount,
                "country": e.node.shippingAddress == null ? "No Country" : e.node.shippingAddress.country
            }
        };
    });
    // To make enough size, do copy the specified times.
    const orderData = Array(times).fill(orderArray).flat();
    console.log(`--- 1. Data size (orders x ${times}): ${JSON.stringify(orderData.length)} ---`);

    // GCP REST API wrapper
    const callGcpApi = async (url, body, dump = true) => {
        const data = JSON.stringify(body);
        console.log(`Calling GCP REST API... ${url}`);
        if (dump) console.log(`Body dump: ${data}`);
        return await (await fetch(url, {
            "method": "POST",
            "headers": {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            "body": data
        })).json();
    };

    // 2. Create dataset in BigQuery.
    let gcpResponse = await callGcpApi(`https://bigquery.googleapis.com/bigquery/v2/projects/${id}/datasets`, {
        "datasetReference": {
            "datasetId": dataset,
            "projectId": id
        }
    });
    console.log(`--- 2. Dataset created: ${JSON.stringify(gcpResponse)} ---`);

    // 3. Create table in BigQuery.
    gcpResponse = await callGcpApi(`https://bigquery.googleapis.com/bigquery/v2/projects/${id}/datasets/${dataset}/tables`, {
        "tableReference": {
            "projectId": id,
            "datasetId": dataset,
            "tableId": table
        },
        "schema": {
            "fields": [
                { name: 'id', type: 'STRING', mode: 'REQUIRED' },
                { name: 'name', type: 'STRING', mode: 'REQUIRED' },
                { name: 'amount', type: 'FLOAT64', mode: 'REQUIRED' },
                { name: 'country', type: 'STRING', mode: 'REQUIRED' }
            ]
        }
    });
    console.log(`--- 3. Table created: ${JSON.stringify(gcpResponse)} ---`);

    // New table creation has some delay, so this demo use dummy delay process (DO NOT THIS FOR REAL PRODUCTION APPS!)
    const delay = () => { return new Promise((r) => { setTimeout(r, 3 * 1000) }) };
    console.log(`--- Starting a dummy delay... ---`);
    await delay();

    // 4. Insert data into BigQuery.
    gcpResponse = await callGcpApi(`https://bigquery.googleapis.com/bigquery/v2/projects/${id}/datasets/${dataset}/tables/${table}/insertAll`, {
        "kind": "bigquery#tableDataInsertAllRequest",
        "rows": orderData
    }, false);
    console.log(`--- 4. Data inserted: ${JSON.stringify(gcpResponse)} ---`);

    // 5. Create dataset for Vertex pipeline.
    gcpResponse = await callGcpApi(`https://us-central1-aiplatform.googleapis.com/v1/projects/${id}/locations/${location}/datasets`, {
        "displayName": display,
        "metadataSchemaUri": "gs://google-cloud-aiplatform/schema/dataset/metadata/tabular_1.0.0.yaml",
        "metadata": {
            "inputConfig": {
                "bigquerySource": {
                    "uri": `bq://${id}.${dataset}.${table}`
                }
            }
        }
    });
    console.log(`--- 5. Pipeline dataset created: ${JSON.stringify(gcpResponse)} ---`);

    const datasetId = gcpResponse.name.split('/')[5];
    console.log(`datasetId: ${datasetId}`);

    // New pipeline dataset creation has some delay, so this demo use dummy delay process (DO NOT THIS FOR REAL PRODUCTION APPS!)
    console.log(`--- Starting a dummy delay... ---`);
    await delay();

    // 6. Create Vertex pipeline run.
    gcpResponse = await callGcpApi(`https://us-central1-aiplatform.googleapis.com/v1/projects/${id}/locations/${location}/trainingPipelines`, {
        "displayName": display,
        "trainingTaskDefinition": "gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_tabular_1.0.0.yaml",
        "trainingTaskInputs": {
            "targetColumn": "country",
            "predictionType": "classification",
            "transformations": [
                { "auto": { "column_name": "id" } },
                { "auto": { "column_name": "name" } },
                { "auto": { "column_name": "amount" } },
                { "auto": { "column_name": "country" } }
            ]
        },
        "modelToUpload": { "displayName": display },
        "inputDataConfig": {
            "datasetId": datasetId
        }
    });
    console.log(`--- 6. Pipeline run created: ${JSON.stringify(gcpResponse)} ---`);

    const pipelineId = gcpResponse.name.split('/').slice(-1);
    console.log(`pipelineId: ${pipelineId}`);

    // Return clickable UI link.
    const response = {
        "gcp_link": `https://console.cloud.google.com/vertex-ai/locations/${location}/training/${pipelineId}?project=${id}`
    };
    console.log(`response: ${JSON.stringify(response)}`);

    return json(response);
};

export default function RunGCPConnect() {
    const actionData = useActionData();
    const [id, setId] = useState('');
    const [token, setToken] = useState('');
    const [times, setTimes] = useState(1);
    const [dataset, setDataset] = useState('my_shopify_dataset');
    const [table, setTable] = useState('my_shopify_table');
    const [display, setDisplay] = useState('my_training');
    const [location, setLocation] = useState('us-central1');
    return (<Page>
        <TitleBar title="Connect Order data to GCP Vertex AI through BigQuery" />
        <Layout>
            <Layout.Section>
                <Card>
                    <BlockStack gap="300">
                        <Form method="POST">
                            <FormLayout>
                                <TextField name="id" onChange={setId} value={id} label="GCP Project ID" placeholder="my-project-1-*****">
                                </TextField>
                                <TextField name="token" onChange={setToken} value={token} label="GCP Access Token (the value of `gcloud auth print-access-token` output in your local PC)" placeholder="ya29.a0AXo************0178">
                                </TextField>
                                <TextField name="times" onChange={setTimes} value={times} label="How many times you extend your order data to reach 1,000 records in GCP" placeholder="1">
                                </TextField>
                                <TextField name="dataset" onChange={setDataset} value={dataset} label="BigQuery Dataset Name" placeholder="my_shopify_dataset">
                                </TextField>
                                <TextField name="table" onChange={setTable} value={table} label="BigQuery Dataset Table Name" placeholder="my_shopify_table">
                                </TextField>
                                <TextField name="display" onChange={setDisplay} value={display} label="Vertex Training Display Name" placeholder="my_training">
                                </TextField>
                                <TextField name="location" onChange={setLocation} value={location} label="Vertex Location" placeholder="us-central1">
                                </TextField>
                                <Button variant="primary" submit>
                                    Sync my order data to GCP Vertex pipeline
                                </Button>
                            </FormLayout>
                        </Form>
                    </BlockStack>
                </Card>
            </Layout.Section>
        </Layout>
    </Page>)
};
