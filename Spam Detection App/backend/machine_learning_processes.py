import joblib
from pathlib import Path

import numpy as np
import pandas as pd
import sklearn.preprocessing
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import DBSCAN
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt


BASE = Path(__file__).resolve().parent
X = None
y = None
spam_df = None
model = None
scaler = None
cluster_info = None

def checkModelHealth():
    global model
    if model is None:
        return False
    return True

def checkScalerHealth():
    global scaler
    if scaler is None:
        return False
    return True

def checkClusterInfoHealth():
    global cluster_info
    if cluster_info is None:
        return False
    return True

def initModel():
    global model
    with open(BASE / "pickles" / "model.pkl", "rb") as file:
        model = joblib.load(file)

def initScaler():
    global scaler
    with open(BASE / "pickles" / "scaler.pkl", "rb") as file:
        scaler = joblib.load(file)
def initClusterFiles():
    global spam_df, X, y, cluster_info
    spam_df = pd.read_csv("data/micro_clusters.csv")
    X = spam_df[['urls', 'non_alphanumeric_punctuation_coefficient',
                 'email_in_name', 'contains_sexual_word',
                 'capital_coefficient', 'email_length',
                 'whitespace_coefficient', 'contains_currency']]
    y = spam_df['avg_spam']
    cluster_info = pd.read_csv("data/cluster_info.csv")

def scale(input_array):
    global scaler
    return scaler.transform(input_array)

def predict_label(input_df):
    global model
    output = model.predict(input_df)
    return int(output[0])

def predict_probability(input_df):
    global model
    output = model.predict_proba(input_df)
    return float(output[0][1])

def initialise():
    initScaler()
    initModel()
    initClusterFiles()
def predict_dbscan(input_array, label):
    global X,y, cluster_info

    input_array = np.delete(input_array,  [9, 6], axis=1)



    input_df = pd.DataFrame(input_array, columns = X.columns)
    input_df = input_df.astype(float)

    input_y = pd.Series(1)

    X_train, X_test, y_train, y_test = train_test_split(
        pd.concat([X, input_df], ignore_index=True), pd.concat([y, input_y], ignore_index=True), test_size=0.2, random_state=42
    )

    dbscan = DBSCAN(eps=0.5, min_samples=7)
    clusters = dbscan.fit_predict(X_train)

    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_train)

    input_point = X_pca[len(X_train) - 1]
    distances = np.linalg.norm(X_pca - input_point, axis=1)
    closest_index = np.argmin(distances)

    cluster_data = []
    sorted_clusters = sorted(set(clusters))

    for cluster_id in sorted_clusters:
        if cluster_id == -1:
            continue  # skip this iteration
        mask_cluster_id = (clusters == cluster_id) & (cluster_id != -1)
        points_pca = X_pca[mask_cluster_id]

        mask_range = (X_pca[:, 0] <= 2) & (X_pca[:, 1] <= 3)
        # filtered_points = points_pca[mask_range]

        cluster_labels = y_train[mask_cluster_id]

        points_list = [
            {"x": float(xy[0]),
             "y": float(xy[1]),
             "spamChance": float(cluster_labels.iloc[i])
             }
            for i, xy in enumerate(points_pca)
        ]

        cluster_df = cluster_info[cluster_info['cluster_id'] == cluster_id].iloc[0]

        cluster_data.append({
            "clusterId": int(cluster_id),
            "avgSpam": float(cluster_df["avg_spam"]),
            "avgUrls": float(cluster_df["urls"]),
            "avgNAPC": float(cluster_df["non_alphanumeric_punctuation_coefficient"]),
            "avgEmailInName": float(cluster_df["email_in_name"]),
            "avgContainsSexualWord": float(cluster_df["contains_sexual_word"]),
            "avgCapital": float(cluster_df["capital_coefficient"]),
            "avgEmailLength": float(cluster_df["email_length"]),
            "avgWhitespace": float(cluster_df["whitespace_coefficient"]),
            "avgContainsCurrency": float(cluster_df["contains_currency"]),
            "points": points_list
        })

    output_json = {"clusters": cluster_data}
    return output_json

