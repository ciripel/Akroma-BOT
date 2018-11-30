#!/usr/bin/env python3.6
# Work with Python 3.6

import json
import time

from requests import get, post

with open("pool.json") as data_file:
    pools = json.load(data_file)
with open("check_time.json") as data_file:
    last_check = json.load(data_file)
with open("links.json") as data_file:
    data = json.load(data_file)

for a in range(len(pools)):
    if pools[a]["link"] == "https://comining.io/":
        with post(pools[a]["api"], json={"method": "coins_list"}) as api:
            if api.status_code == 200:
                pool_api = api.json()
                pools[a]["hash"] = int(pool_api["data"][0]["workersHashrate"])
            else:
                print(f"{pools[a]['api']} is down")
    elif pools[a]["link"] == "https://aka.fairpool.xyz/":
        with get(pools[a]["api"]) as api:
            if api.status_code == 200:
                pool_api = api.json()
                pools[a]["hash"] = int(pool_api["pool"]["hashrate"])
            else:
                print(f"{pools[a]['api']} is down")
    elif pools[a]["link"] == "https://aikapool.com/aka/":
        with get(pools[a]["api"]) as api:
            if api.status_code == 200:
                pool_api = api.json()
                pools[a]["hash"] = int(pool_api["pool_hashrate"])
            else:
                print(f"{pools[a]['api']} is down")
    else:
        with get(pools[a]["api"]) as api:
            if api.status_code == 200:
                pool_api = api.json()
                pools[a]["hash"] = int(pool_api["hashrate"])
            else:
                print(f"{pools[a]['api']} is down")

pools.sort(key=lambda x: x["hash"])
with open("pool.json", "w") as file:
    json.dump(pools, file, indent=2)

last_check["last_check"] = time.ctime() + " EET"
with open("check_time.json", "w") as file:
    json.dump(last_check, file, indent=2)
