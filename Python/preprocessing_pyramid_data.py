import pandas as pd
import numpy as np

def build_cvs():
    df_male = pd.read_csv('./data/Nation_Age_Men.csv', delimiter=';')
    df_female = pd.read_csv('./data/Nation_Age_Men.csv', delimiter=';')

    years = df_male['Date'].unique()
    countries = df_male['Region'].unique()
    ages = df_male.columns[2:].to_numpy()

    #C = 'France' #Temp fixed later itereren
    # print(years)
    # print(countries)

    for C in countries:
        df_country_male = df_male.loc[df_male['Region'] == C]
        df_country_female = df_male.loc[df_female['Region'] == C]

        for Y in years:
            df_y_male = df_country_male.loc[df_country_male['Date'] == Y]
            df_y_female = df_country_female.loc[df_country_female['Date'] == Y]

            data = []
            for A in ages:
                sdata = []
                sdata.append(A)
                sdata.append(str(df_y_male.iloc[0][A]).replace(" ", ""))
                sdata.append(str(df_y_female.iloc[0][A]).replace(" ", ""))
                data.append(sdata)

            
            newC = C.translate({ord(ch): "_" for ch in "/"})
            f_name = './data/popCountries/'+str(newC)+'_'+str(Y)+'.csv'
            d = pd.DataFrame(data, columns=['Age', 'M', 'F'])
            d.to_csv(f_name, index=False, sep=',')

if __name__ == "__main__":
    build_cvs()