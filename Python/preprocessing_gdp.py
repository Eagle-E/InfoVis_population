import csv
from distutils.command.clean import clean
from itertools import count
import json

from numpy import split
 
#GDP data https://data.un.org/Data.aspx?d=SNAAMA&f=grID%3A101%3BcurrID%3AUSD%3BpcFlag%3A1
#Life expectancy data https://data.un.org/Data.aspx?q=Life+expectancy&d=PopDiv&f=variableID%3a68
#GDP total https://data.un.org/Data.aspx?q=GDP&d=WDI&f=Indicator_Code%3aNY.GDP.MKTP.PP.CD
#Regional data https://unstats.un.org/unsd/methodology/m49/overview/

def convert_GDP_capita(data, csv_filename):
    # Open a csv reader called DictReader
    with open(csv_filename, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf, delimiter=';')
        # Convert each row into a dictionary
        # and add it to data
        for rows in csvReader:
            # Assuming a column named 'No' to
            # be the primary key
            country = rows['Country or Area']
            year = rows['Year']
            item = "GDP_perCapita"
            if(year not in data):
                data[year] = {}
            
            if(country not in data[year]):
                data[year][country] = {}
            
            data[year][country][item] = rows['Value']
    return data
 
def convert_life_expectancy(data, csv_filename):
    # Open a csv reader called DictReader
    with open(csv_filename, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf, delimiter=';')
        # Convert each row into a dictionary
        # and add it to data
        for rows in csvReader:
            # Assuming a column named 'No' to
            # be the primary key
            country = rows['Country or Area']
            years = rows['Year(s)']
            item = "lifeExpectancy"
            life_expectancy = rows['Value']
            #ex: START_YEAR-END_YEAR
            strings_split_years = years.split("-")
            split_years = [int(year) for year in strings_split_years]
            for year in range(split_years[0], split_years[1]):
                year_key = str(year)
                if(year_key in data):
                    if(country in data[year_key]):
                        data[year_key][country][item] = life_expectancy

    return data


def convert_GDP(data, csv_filename):
    with open(csv_filename, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf, delimiter=';')
        # Convert each row into a dictionary
        # and add it to data
        for rows in csvReader:
            # Assuming a column named 'No' to
            # be the primary key
            country = rows['Country or Area']
            year = rows['Year']
            item = "GDP"
            gdp_total = rows['Value']

            if(year not in data):
                data[year] = {}
            if(country in data[year]):
                data[year][country][item] = gdp_total
    return data


def convert_methodology(data, csv_filename):
    # Open a csv reader called DictReader
    with open(csv_filename, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf, delimiter=';')
        # Convert each row into a dictionary
        # and add it to data
        for rows in csvReader:
            for year in data.keys():
                if(not(year.isdigit())):
                    continue

                contintent_key = 'Region'
                continent_value = rows['Region Name']
                country_key = 'Country'
                country_value = rows['Country or Area']
                country_code_key = 'CountryCode'
                country_code_value = rows['ISO-alpha3 Code']
                
                year_value = int(year)
                if(country_value in data[year]):
                    data[year][country_value][contintent_key] = continent_value
                    data[year][country_value][country_key] = country_value
                    data[year][country_value][country_code_key] = country_code_value

    return data


# Decide the two file paths according to your
# computer system
#csvFilePath = r'Names.csv'
#jsonFilePath = r'Names.json'


gdp_capita_csvFilePath = "../data/UN_GDP_CAPITA.csv"
gdp_csvFilePath = "../data/UN_GDP_TOTAL.csv"
age_csvFilePath = "../data/UN_AGE.csv"
un_methodology_csvFilePath = "../data/UN_METHODOLOGY.csv"


jsonFilePath = "../data/UN_JSON.json"
 

def data_to_array():
    data = {}
    data = convert_GDP_capita(data, gdp_capita_csvFilePath)
    data = convert_life_expectancy(data, age_csvFilePath)
    data = convert_GDP(data, gdp_csvFilePath)
    data = convert_methodology(data, un_methodology_csvFilePath)
    return data


#skip incomplete entries
def clean_data(data):
    clean_data = {}
    country_key = 'Country'
    for year in data.keys():
        if(not(year.isdigit())):
            continue
        clean_data[year] = {}

        #loop through data and select only full entries
        country_list = data[year]       
        for country in country_list:
            #for some reason the keys get iterated
            country_data = country_list[country]
            if(len(country_data.keys()) == 6):
                clean_data[year][country] = country_data
    return clean_data

#"GDP": 15936784437.22,
#"GDP_perCapita": 561.2,
#"lifeExpectancy": 59.60009756


def convert_to_json(data, json_filename):
    # Open a json writer, and use the json.dumps()
    # function to dump data
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(data, indent=4))


def main():
    data = data_to_array()
    data = clean_data(data)
    convert_to_json(data, jsonFilePath)




if __name__ == "__main__":
    main()
