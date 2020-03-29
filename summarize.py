import json
import os
import csv

import pandas as pd

DATA_DIR = "data/"

columns = ["municipalityGeoLevelnummer", "municipalityGeoLevelname", "cantonGeoLevelnummer", "cantonGeoLevelname", "yesVotesDiff"]
records = []

def read_file(path):
  file = open(path, "r")
  return json.load(file)

files = []

for i in os.listdir(DATA_DIR):
    if i.endswith('.json'):
        files.append(DATA_DIR + i)

for file in files:
  file = read_file(file)
  tablings = file.get("schweiz").get("vorlagen")

  for tabling in tablings:
    result = tabling.get("resultat")
    overallYesVotes = result.get("jaStimmenInProzent")

    for canton in tabling.get("kantone"):

      canton_geo_level_name = canton["geoLevelname"]
      canton_geo_level_nummer = canton["geoLevelnummer"]

      for municipality in canton.get("gemeinden"):
        result = municipality.get("resultat")
        yesVotes = result.get("jaStimmenInProzent")
        name = municipality.get("geoLevelname")
        number = municipality.get("geoLevelnummer")

        if yesVotes:
          records.append([number, name, canton_geo_level_nummer, canton_geo_level_name, round(overallYesVotes - yesVotes, 5)])


vote_diffs = pd.DataFrame(records, columns=columns)
vote_diffs_mean = vote_diffs.groupby(["municipalityGeoLevelnummer", "municipalityGeoLevelname", "cantonGeoLevelnummer", "cantonGeoLevelname"]).mean()

vote_diffs_mean.to_csv(DATA_DIR + "vote_diffs_mean.csv", quoting=csv.QUOTE_NONNUMERIC)