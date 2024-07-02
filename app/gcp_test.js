import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const aiplatform = require('@google-cloud/aiplatform');
const {DatasetServiceClient, PipelineServiceClient} = aiplatform.v1;

const project = 'my-project-1-399622';
const location = 'us-central1';
const modelDisplayName = 'my_model';
const trainingPipelineDisplayName = 'my_training_pipeline';
const targetColumn = 'country';

// BigQuery source details
const bqProject = 'my-project-1-399622';
const bqDataset = 'my_shopify_gcp_dataset';
const bqTable = 'my_orders';

const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

async function createDatasetAndTrainingPipeline() {
  const datasetServiceClient = new DatasetServiceClient(clientOptions);

  // Create dataset
  const createDatasetRequest = {
    parent: `projects/${project}/locations/${location}`,
    dataset: {
      displayName: 'Automatically created dataset222',
      metadataSchemaUri: 'gs://google-cloud-aiplatform/schema/dataset/metadata/tabular_1.0.0.yaml',
    }
  };

  let datasetResponse;
  try {
    [datasetResponse] = await datasetServiceClient.createDataset(createDatasetRequest);
    console.log('Created dataset:', datasetResponse.name);
  } catch (error) {
    console.error('Error creating dataset:', error);
    return;
  }

  // Extract dataset ID from the response
  const datasetId = datasetResponse.name.split('/').pop();

  // Import data into the dataset
  const importDataRequest = {
    name: datasetResponse.name,
    importDataConfig: {
      gcsSource: {
        uris: [`bq://${bqProject}.${bqDataset}.${bqTable}`]
      },
      importSchemaUri: 'gs://google-cloud-aiplatform/schema/dataset/ioformat/bigquery_1.0.0.yaml'
    }
  };

  try {
    const [importOperation] = await datasetServiceClient.importData(importDataRequest);
    console.log('Data import started...');

    // Wait for the import operation to complete
    const [importResult] = await importOperation.promise();
    console.log('Data import completed:', importResult);
  } catch (error) {
    console.error('Error importing data:', error);
    return;
  }

  // Now proceed with creating the training pipeline
  const pipelineServiceClient = new PipelineServiceClient(clientOptions);

  // ... (rest of your existing code for creating training pipeline)

  const trainingPipeline = {
    displayName: trainingPipelineDisplayName,
    trainingTaskDefinition: 'gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_tables_1.0.0.yaml',
    trainingTaskInputs,
    inputDataConfig: {
      datasetId: datasetId,
      fractionSplit: {
        trainingFraction: 0.8,
        validationFraction: 0.1,
        testFraction: 0.1,
      },
    },
    modelToUpload: {displayName: modelDisplayName},
  };

  const request = {
    parent: `projects/${project}/locations/${location}`,
    trainingPipeline,
  };

  try {
    const [response] = await pipelineServiceClient.createTrainingPipeline(request);
    console.log('Created training pipeline:', response.name);
  } catch (error) {
    console.error('Error creating training pipeline:', error);
  }
}

createDatasetAndTrainingPipeline();