from fastapi import FastAPI, HTTPException, Query, Depends, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd   # <--- add this import

# Local package modules — use relative imports so Python finds them when running backend.main
import process_input, machine_learning_processes, models, db_connection

app = FastAPI()

# Development: explicitly allow local frontend origins (don't use "*" with allow_credentials=True)
origins = [
    "http://127.0.0.1:8001",   # backend origin if serving frontend from API host
    "http://127.0.0.1:5500",   # frontend static server origin
    "http://localhost:5500",
    "*" # for testing purposes all origins are allowed for now
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def app_startup():
    machine_learning_processes.initialise()
    db_connection.initialise()
    print("Application startup successful")

class GetSpamChanceRequest(BaseModel):
    email: str
    body: str
    subject: str
    advanced: int
feature_names = ['urls', 'non_alphanumeric_punctuation_coefficient', 'email_in_name', 'contains_sexual_word', "capital_coefficient",
     "email_length", "domain_match", "whitespace_coefficient", "contains_currency",
     "contains_obfuscated_word"]

class MLInput:
    def __init__(self, urls, non_alphanumeric_punctuation_coefficient, email_in_name, contains_sexual_word,
                 capital_coefficient, email_length, domain_match, whitespace_coefficient, contains_currency,
                 contains_obfuscated_word):
        self.urls = urls
        self.non_alphanumeric_punctuation_coefficient = non_alphanumeric_punctuation_coefficient
        self.email_in_name = email_in_name
        self.contains_sexual_word = contains_sexual_word
        self.capital_coefficient = capital_coefficient
        self.email_length = email_length
        self.domain_match = domain_match
        self.whitespace_coefficient = whitespace_coefficient
        self.contains_currency = contains_currency
        self.contains_obfuscated_word = contains_obfuscated_word

    def to_dataframe(self, feature_names):
        """
        Convert the object's attributes to a single-row DataFrame
        with columns named according to feature_names.
        """
        data = [[
            self.urls,
            self.non_alphanumeric_punctuation_coefficient,
            self.email_in_name,
            self.contains_sexual_word,
            self.capital_coefficient,
            self.email_length,
            self.domain_match,
            self.whitespace_coefficient,
            self.contains_currency,
            self.contains_obfuscated_word
        ]]

        # Create DataFrame
        df = pd.DataFrame(data, columns=feature_names)
        return df
@app.get("/health")
async def root():
    modelHealth = machine_learning_processes.checkModelHealth()
    scalerHealth = machine_learning_processes.checkScalerHealth()
    cluster_info_health = machine_learning_processes.checkClusterInfoHealth()
    db_health = db_connection.check_health()
    healthy = all([modelHealth, scalerHealth, cluster_info_health, db_health])


    return {
        "healthy": healthy,
        "model": modelHealth,
        "scaler": scalerHealth,
        "cluster_info": cluster_info_health,
        "db": db_health
    }

@app.get("/api/getpage")
async def get_page_results(page_number: int):
    results = db_connection.get_page(page_number)
    if results == "sql_error":
        raise HTTPException(status_code=422)
    return results
@app.get("/api/getresult")
async def get_result(result_id: int):
    results = db_connection.get_result(result_id)
    return results
@app.post("/api/saveresult")
async def save_result(request: Request):
    try:
        # Read the raw JSON body as a Python dict
        data = await request.json()
        spam_chance = data.get("spamChance")
        if not spam_chance:
            raise HTTPException(status_code=422, detail="No spam chance")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")


    success = db_connection.insert_result(data, spam_chance)
    if not success:
        raise HTTPException(status_code=500, detail="Database error while saving result")

    return {"status": "ok"}


def get_spam_chance_params(
    email: str = Query(...),
    body: str = Query(...),
    subject: str = Query(...),
    advanced: int = Query(...)
):
    return GetSpamChanceRequest(email=email, body=body, subject=subject, advanced=advanced)

@app.get("/api/prediction")
def get_spam_chance(request: GetSpamChanceRequest = Depends(get_spam_chance_params)):
    # validate email parsing and return 400 instead of letting a 500 bubble up
    try:
        email_name, name = process_input.get_email_and_name(request.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    email_in_name = (
        process_input.get_email_in_name(email_name, name))

    non_alphanumeric_punctuation_coefficient = (
        process_input.get_non_alphanumeric_punctuation_coefficient(request.body, request.subject))

    capital_coefficient = (
        process_input.get_capital_coefficient(request.body, request.subject))


    email_length = (
        len(request.body))

    whitespace_coefficient = (
        process_input.get_whitespace_coefficient(request.body))

    contains_sexual_word = (
        process_input.get_contains_sexual_word(request.body, request.subject))


    links = (
        process_input.get_links(request.body))

    if links == 0:
        urls = 0
    else:
        urls = len(links)


    domain_matches = (
        process_input.get_domain_matches(links, request.email))

    contains_currency = (
        process_input.get_contains_currency(request.subject, request.body))

    contains_obfuscated_word = (
        process_input.get_contains_obfuscated_word(request.subject, request.body))

    output_class = MLInput(urls, non_alphanumeric_punctuation_coefficient, email_in_name, contains_sexual_word,
                capital_coefficient, email_length, domain_matches, whitespace_coefficient,
                contains_currency, contains_obfuscated_word)


    output_as_df = output_class.to_dataframe(feature_names)

    output_scaled = machine_learning_processes.scale(output_as_df)



    label = machine_learning_processes.predict_label(output_scaled)
    spam_probability = machine_learning_processes.predict_probability(output_scaled)


    cluster_json = machine_learning_processes.predict_dbscan(output_scaled, label)

    if request.advanced == 1:
        return {"label": label, "spamChance": spam_probability, "visualisations": {
            "features":{
                "urls": urls,
                "non_alphanumeric_punctuation_coefficient": non_alphanumeric_punctuation_coefficient,
                "email_in_name": email_in_name,
                "contains_sexual_word": contains_sexual_word,
                "capital_coefficient": capital_coefficient,
                "email_length": email_length,
                "domain_matches": domain_matches,
                "whitespace_coefficient": whitespace_coefficient,
                "contains_currency": contains_currency,
                "contains_obfuscated_word": contains_obfuscated_word
            },
            "mini_clusters": cluster_json
        }}
    else:
        return {"label": label, "spamChance": spam_probability}
