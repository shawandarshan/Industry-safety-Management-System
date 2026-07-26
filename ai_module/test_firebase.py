import requests
import json

db_url = "https://industry-management-syst-ec017-default-rtdb.firebaseio.com"
secret = "d8gxA4y3iSBHTmCQ5ZD7PwraLlDKTtKZY57nESh5"

data = {"test": "hello world"}
response = requests.post(f"{db_url}/test.json?auth={secret}", json=data)
print(response.status_code)
print(response.text)
