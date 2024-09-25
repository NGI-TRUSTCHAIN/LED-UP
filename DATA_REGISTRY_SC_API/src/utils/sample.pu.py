import requests
import json
from azure.identity import ClientSecretCredential
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, BooleanType, TimestampType, IntegerType, DateType, TimestampType, IntegerType

# Hardcoded environment variables
tenant_id = ''
client_id = ''
client_secret = ''
fhir_url = ''
lakehouse_path = ''


# Function to fetch new token with the correct scope
def fetch_new_token():
    try:
        # Create a credential object
        credential = ClientSecretCredential(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret
        )

        # Get the access token for the FHIR server
        token = credential.get_token('')
        return token.token
    except Exception as e:
        raise Exception(f"Failed to fetch a new token: {str(e)}")

def fetch_patient_resources(fhir_url, token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/fhir+json"
    }
    
    resources = []
    url = fhir_url
    
    while url:
        response = requests.get(url, headers=headers)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            resources.extend(data.get('entry', []))
            # Check if there is a next page
            url = None
            for link in data.get('link', []):
                if link['relation'] == 'next':
                    url = link['url']
                    break
        else:
            print(f"Failed to fetch data: {response.status_code}")
            print(f"Response content: {response.content}")
            break
    
    return resources
    
if __name__ == "__main__":
    # Fetch the token
    token = fetch_new_token()
    print(f"Access Token: {token}")

    # Fetch patient resources (limited to 20)
    patient_resources = fetch_patient_resources(fhir_url, token)
    print(f"Total patients fetched: {len(patient_resources)}")

    # Convert the fetched resources to JSON
    patient_data = [json.dumps(resource['resource']) for resource in patient_resources]

    # Create Spark session
    spark = SparkSession.builder.appName("FHIRDataIngestion").getOrCreate()

    # Define schema for the JSON data
    schema = StructType([
        StructField("resourceType", StringType(), True),
        StructField("id", StringType(), True),
        StructField("meta", StructType([
            StructField("extension", StringType(), True),
            StructField("id", StringType(), True),
            StructField("versionId", StringType(), True),
            StructField("lastUpdated", TimestampType(), True),
            StructField("source", StringType(), True),
            StructField("profile", ArrayType(StringType(), True), True),
            StructField("security", ArrayType(StructType([
                StructField("extension", StringType(), True),
                StructField("id", StringType(), True),
                StructField("system", StringType(), True),
                StructField("version", StringType(), True),
                StructField("code", StringType(), True),
                StructField("display", StringType(), True),
                StructField("userSelected", BooleanType(), True)
            ]), True), True),
            StructField("tag", ArrayType(StructType([
                StructField("extension", StringType(), True),
                StructField("id", StringType(), True),
                StructField("system", StringType(), True),
                StructField("version", StringType(), True),
                StructField("code", StringType(), True),
                StructField("display", StringType(), True),
                StructField("userSelected", BooleanType(), True)
            ]), True), True)
        ]), True),
        StructField("implicitRules", StringType(), True),
        StructField("language", StringType(), True),
        StructField("text", StructType([
            StructField("extension", StringType(), True),
            StructField("id", StringType(), True),
            StructField("status", StringType(), True),
            StructField("div", StringType(), True)
        ]), True),
        StructField("contained", ArrayType(StringType(), True), True),
        StructField("extension", StringType(), True),
        StructField("modifierExtension", StringType(), True),
        StructField("identifier", ArrayType(StructType([
            StructField("extension", StringType(), True),
            StructField("use", StringType(), True),
            StructField("value", StringType(), True),
            StructField("system", StringType(), True),
            StructField("type", StructType([
                StructField("extension", StringType(), True),
                StructField("id", StringType(), True),
                StructField("coding", ArrayType(StructType([
                    StructField("extension", StringType(), True),
                    StructField("id", StringType(), True),
                    StructField("system", StringType(), True),
                    StructField("version", StringType(), True),
                    StructField("code", StringType(), True),
                    StructField("display", StringType(), True),
                    StructField("userSelected", BooleanType(), True)
                ]), True), True),
                StructField("text", StringType(), True)
            ]), True),
            StructField("period", StructType([
                StructField("extension", StringType(), True),
                StructField("id", StringType(), True),
                StructField("start", TimestampType(), True),
                StructField("end", TimestampType(), True)
            ]), True),
            StructField("assigner", StructType([
                StructField("extension", StringType(), True),
                StructField("id", StringType(), True),
                StructField("reference", StringType(), True),
                StructField("type", StringType(), True),
                StructField("identifier", StructType([
                    StructField("extension", StringType(), True),
                    StructField("use", StringType(), True),
                    StructField("type", StringType(), True),
                    StructField("value", StringType(), True),
                    StructField("system", StringType(), True),
                    StructField("period", StringType(), True),
                    StructField("assigner", StringType(), True)
                ]), True),
                StructField("display", StringType(), True)
            ]), True)
        ])), True),
        StructField("active", BooleanType(), True),
        StructField("name", ArrayType(StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("use", StringType(), True),
        StructField("text", StringType(), True),
        StructField("family", StringType(), True),
        StructField("given", ArrayType(StringType(), True), True),
        StructField("prefix", ArrayType(StringType(), True), True),
        StructField("suffix", ArrayType(StringType(), True), True),
        StructField("period", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("start", TimestampType(), True),
        StructField("end", TimestampType(), True)
    ]), True)
])), True),
        StructField("telecom", ArrayType(StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("system", StringType(), True),
        StructField("value", StringType(), True),
        StructField("use", StringType(), True),
        StructField("rank", IntegerType(), True),
        StructField("period", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("start", TimestampType(), True),
        StructField("end", TimestampType(), True)
    ]), True)
])), True),
        StructField("gender", StringType(), True),
    StructField("birthDate", DateType(), True),
    StructField("deceasedBoolean", BooleanType(), True),
    StructField("deceasedDateTime", TimestampType(), True),
    StructField("address", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("use", StringType(), True),
    StructField("type", StringType(), True),
    StructField("text", StringType(), True),
    StructField("line", ArrayType(StringType(), True), True),
    StructField("city", StringType(), True),
    StructField("district", StringType(), True),
    StructField("state", StringType(), True),
    StructField("postalCode", StringType(), True),
    StructField("country", StringType(), True),
    StructField("period", StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("start", TimestampType(), True),
    StructField("end", TimestampType(), True)
    ]), True)
])), True),
StructField("maritalStatus", StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("coding", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("system", StringType(), True),
    StructField("version", StringType(), True),
    StructField("code", StringType(), True),
    StructField("display", StringType(), True),
    StructField("userSelected", BooleanType(), True)
    ]), True), True),
    StructField("text", StringType(), True)
]), True),
    StructField("multipleBirthBoolean", BooleanType(), True),
    StructField("multipleBirthInteger", IntegerType(), True),
    StructField("photo", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("contentType", StringType(), True),
    StructField("language", StringType(), True),
    StructField("data", StringType(), True),
    StructField("url", StringType(), True),
    StructField("size", IntegerType(), True),
    StructField("hash", StringType(), True),
    StructField("title", StringType(), True),
    StructField("creation", TimestampType(), True)
])), True),
    StructField("contact", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("relationship", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("coding", ArrayType(StructType([
      StructField("extension", StringType(), True),
      StructField("id", StringType(), True),
      StructField("system", StringType(), True),
      StructField("version", StringType(), True),
      StructField("code", StringType(), True),
      StructField("display", StringType(), True),
      StructField("userSelected", BooleanType(), True)
        ]), True), True),
    StructField("text", StringType(), True)
    ]), True), True),
    StructField("name", StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("use", StringType(), True),
    StructField("text", StringType(), True),
    StructField("family", StringType(), True),
    StructField("given", ArrayType(StringType(), True), True),
    StructField("prefix", ArrayType(StringType(), True), True),
    StructField("suffix", ArrayType(StringType(), True), True),
    StructField("period", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("start", TimestampType(), True),
        StructField("end", TimestampType(), True)
    ]), True)
    ]), True),
    StructField("telecom", ArrayType(StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("system", StringType(), True),
        StructField("value", StringType(), True),
        StructField("use", StringType(), True),
        StructField("rank", IntegerType(), True),
        StructField("period", StructType([
            StructField("extension", StringType(), True),
            StructField("id", StringType(), True),
            StructField("start", TimestampType(), True),
            StructField("end", TimestampType(), True)
        ]), True)
    ]), True), True),
    StructField("address", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("use", StringType(), True),
        StructField("type", StringType(), True),
        StructField("text", StringType(), True),
        StructField("line", ArrayType(StringType(), True), True),
        StructField("city", StringType(), True),
        StructField("district", StringType(), True),
        StructField("state", StringType(), True),
        StructField("postalCode", StringType(), True),
        StructField("country", StringType(), True),
        StructField("period", StructType([
            StructField("extension", StringType(), True),
            StructField("id", StringType(), True),
            StructField("start", TimestampType(), True),
            StructField("end", TimestampType(), True)
        ]), True)
    ]), True),
    StructField("gender", StringType(), True),
    StructField("organization", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("reference", StringType(), True),
        StructField("type", StringType(), True),
        StructField("identifier", StructType([
            StructField("extension", StringType(), True),
            StructField("use", StringType(), True),
            StructField("type", StringType(), True),
            StructField("value", StringType(), True),
            StructField("system", StringType(), True),
            StructField("period", StringType(), True),
            StructField("assigner", StringType(), True)
        ]), True),
        StructField("display", StringType(), True)
    ]), True),
    StructField("period", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("start", TimestampType(), True),
        StructField("end", TimestampType(), True)
    ]), True)
])), True),
StructField("communication", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("language", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("coding", ArrayType(StructType([
            StructField("extension", StringType(), True),
            StructField("id", StringType(), True),
            StructField("system", StringType(), True),
            StructField("version", StringType(), True),
            StructField("code", StringType(), True),
            StructField("display", StringType(), True),
            StructField("userSelected", BooleanType(), True)
        ]), True), True),
        StructField("text", StringType(), True)
    ]), True),
    StructField("preferred", BooleanType(), True)
])), True),
StructField("generalPractitioner", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("reference", StringType(), True),
    StructField("type", StringType(), True),
    StructField("identifier", StructType([
        StructField("extension", StringType(), True),
        StructField("use", StringType(), True),
        StructField("type", StringType(), True),
        StructField("value", StringType(), True),
        StructField("system", StringType(), True),
        StructField("period", StringType(), True),
        StructField("assigner", StringType(), True)
    ]), True),
    StructField("display", StringType(), True)
])), True),
StructField("managingOrganization", StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("reference", StringType(), True),
    StructField("type", StringType(), True),
    StructField("identifier", StructType([
        StructField("extension", StringType(), True),
        StructField("use", StringType(), True),
        StructField("type", StringType(), True),
        StructField("value", StringType(), True),
        StructField("system", StringType(), True),
        StructField("period", StringType(), True),
        StructField("assigner", StringType(), True)
    ]), True),
    StructField("display", StringType(), True)
]), True),
StructField("link", ArrayType(StructType([
    StructField("extension", StringType(), True),
    StructField("id", StringType(), True),
    StructField("other", StructType([
        StructField("extension", StringType(), True),
        StructField("id", StringType(), True),
        StructField("reference", StringType(), True),
        StructField("type", StringType(), True),
        StructField("identifier", StructType([
            StructField("extension", StringType(), True),
            StructField("use", StringType(), True),
            StructField("type", StringType(), True),
            StructField("value", StringType(), True),
            StructField("system", StringType(), True),
            StructField("period", StringType(), True),
            StructField("assigner", StringType(), True)
        ]), True),
        StructField("display", StringType(), True)
    ]), True),
    StructField("type", StringType(), True)
])), True),
    ])

    # Create DataFrame from JSON data
    df = spark.read.json(spark.sparkContext.parallelize(patient_data), schema=schema)

    # Debug: Print DataFrame schema and count
    df.printSchema()
    print(f"DataFrame count: {df.count()}")

    # Write DataFrame to Lakehouse
    try:
        df.write.format("delta").option("mergeSchema", "true").mode("overwrite").save(lakehouse_path)
        print(f"Patient resources stored in Lakehouse at {lakehouse_path}")
    except Exception as e:
        print(f"Failed to write DataFrame to Lakehouse: {e}")
