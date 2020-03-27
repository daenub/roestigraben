import requests
import json

DATA_DIR = "data/"


def request_data(resource):
  print("Download " + resource.get("download_url"))
  response = requests.get(resource.get("download_url"))
  write_file(response.text, resource.get("coverage"))


def write_file(data, name):
  path = "{path}{name}.json".format(path=DATA_DIR, name=name)
  file = open(path, "w")
  file.write(data)
  file.close()


response = requests.get("https://opendata.swiss/api/3/action/package_show?id=echtzeitdaten-am-abstimmungstag-zu-eidgenoessischen-abstimmungsvorlagen")
meta_info = json.loads(response.text)
resources = meta_info.get("result").get("resources")

for r in resources:
  request_data(r)
