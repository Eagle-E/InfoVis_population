import csv
from typing import FrozenSet
import json

def get_data():
    data = {}
    try:
        pathMale = "D:/SCHOOL/master/information_visualization/project/InfoVis_population/data/RAW/Nation_Age_Men.csv"
        pathFemale = "D:/SCHOOL/master/information_visualization/project/InfoVis_population/data/RAW/Nation_Age_Women.csv"
        
        with open(pathMale) as csvMale, open(pathFemale) as csvFemale:
            # get row data
            strM = csvMale.read()
            strF = csvFemale.read()
            MRows = strM.split('\n')
            FRows = strF.split('\n')
            MRows = [i.split(';') for i in MRows]
            FRows = [i.split(';') for i in FRows]
            ages = MRows[0][2:]

            for i in range(1, len(MRows)):
                mrow = MRows[i]
                frow = FRows[i]
                region = mrow[0]
                year = mrow[1]

                regionType = type(data.get(region, 0))
                if regionType == int:
                    data[region] = {}
                data[region][year] = {}

                populationM = mrow[2:]
                populationF = frow[2:]
                for j in range(len(populationM)):
                    nMen = 0
                    nWomen = 0
                    try:
                        nMen = int(populationM[j].replace(' ', ''))
                        nWomen = int(populationF[j].replace(' ', ''))
                    except Exception:
                        pass
                    data[region][year][ages[j]] = {}
                    data[region][year][ages[j]]["men"] = nMen
                    data[region][year][ages[j]]["women"] = nWomen
                    data[region][year][ages[j]]["total"] = nMen + nWomen
                    
            # also add total of all age groups together
            for region in data.keys():
                for year in data[region].keys():
                    total = 0
                    for _, d in data[region][year].items():
                        total += d['total']
                    data[region][year]['total'] = total
                    


    except EnvironmentError:
        return {}


    return data

if __name__ == "__main__":
    data = get_data()

    path = "D:/SCHOOL/master/information_visualization/project/InfoVis_population/data/population.json"
    with open(path, 'w') as f:
        json.dump(data, f)
