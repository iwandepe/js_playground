const AWS = require('aws-sdk');
const https = require('https');
const constants = require('./constants');
require('dotenv').config();

AWS.config.update({ region: "us-east-1" });

const agent = new https.Agent({
    maxSockets: 5000,
});

writeClient = new AWS.TimestreamWrite({
    maxRetries: 10,
    httpOptions: {
        timeout: 20000,
        agent: agent
    }
});

queryClient = new AWS.TimestreamQuery();

async function createDatabase() {
    console.log("Creating Database");
    const params = {
        DatabaseName: constants.DATABASE_NAME
    };

    const promise = writeClient.createDatabase(params).promise();

    await promise.then(
        (data) => {
            console.log(`Database ${data.Database.DatabaseName} created successfully`);
        },
        (err) => {
            if (err.code === 'ConflictException') {
                console.log(`Database ${params.DatabaseName} already exists. Skipping creation.`);
            } else {
                console.log("Error creating database", err);
            }
        }
    );
}

async function createTable() {
    console.log("Creating Table");
    const params = {
        DatabaseName: constants.DATABASE_NAME,
        TableName: constants.TABLE_NAME,
        RetentionProperties: {
            MemoryStoreRetentionPeriodInHours: constants.HT_TTL_HOURS,
            MagneticStoreRetentionPeriodInDays: constants.CT_TTL_DAYS
        }
    };

    const promise = writeClient.createTable(params).promise();

    await promise.then(
        (data) => {
            console.log(`Table ${data.Table.TableName} created successfully`);
        },
        (err) => {
            if (err.code === 'ConflictException') {
                console.log(`Table ${params.TableName} already exists on db ${params.DatabaseName}. Skipping creation.`);
            } else {
                console.log("Error creating table. ", err);
                throw err;
            }
        }
    );
}

async function writeRecords() {
    console.log("Writing records");
    const currentTime = Date.now().toString();

    const dimensions = [
        { 'Name': 'region', 'Value': 'us-east-1' },
        { 'Name': 'nama_host', 'Value': 'host1' }
    ];

    const cpuUtilization = {
        'Dimensions': dimensions,
        'MeasureName': 'penggunaan_cpu',
        'MeasureValue': '20.0',
        'MeasureValueType': 'DOUBLE',
        'Time': currentTime.toString()
    };

    const memoryUtilization = {
        'Dimensions': dimensions,
        'MeasureName': 'pengunaan_memori',
        'MeasureValue': '40.0',
        'MeasureValueType': 'DOUBLE',
        'Time': currentTime.toString()
    };

    const records = [cpuUtilization, memoryUtilization];

    const params = {
        DatabaseName: constants.DATABASE_NAME,
        TableName: constants.TABLE_NAME,
        Records: records
    };

    const request = writeClient.writeRecords(params);

    await request.promise().then(
        (data) => {
            console.log("Write records successful");
        },
        (err) => {
            console.log("Error writing records:", err);
            if (err.code === 'RejectedRecordsException') {
                printRejectedRecordsException(request);
            }
        }
    );
}

const SELECT_ALL_QUERY = "SELECT * FROM " + constants.DATABASE_NAME + "." + constants.TABLE_NAME;

async function getAllRows(query, nextToken = undefined) {
    let response;
    try {
        response = await queryClient.query(params = {
            QueryString: query,
            NextToken: nextToken,
        }).promise();
    } catch (err) {
        console.error("Error while querying:", err);
        throw err;
    }

    console.log(response);

    if (response.NextToken) {
        await getAllRows(query, response.NextToken);
    }
}

async function callService() {
    await createDatabase();
    await createTable();
    await writeRecords();
    await getAllRows(SELECT_ALL_QUERY, null);
}

callService();
