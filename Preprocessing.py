import pandas as pd
import numpy as np

def main():
    df_male = pd.read_csv('./data/Nation_Age_Men.csv', delimiter=';')
    df_female = pd.read_csv('./data/Nation_Age_Men.csv', delimiter=';')

    years = df_male['Date'].unique()
    countries = df_male['Region'].unique()
    ages = df_male.columns[2:].to_numpy()

    #C = 'France' #Temp fixed later itereren

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
                sdata.append(str(df_y_male.iloc[0][A]).strip())
                sdata.append(str(df_y_female.iloc[0][A]).strip())
                data.append(sdata)

            
            newC = C.translate({ord(ch): "_" for ch in "/"})
            f_name = './data/popCountries/'+str(newC)+'_'+str(Y)+'.csv'
            d = pd.DataFrame(data, columns=['Age', 'M', 'F'])
            d.to_csv(f_name, index=False, sep=',')

def build_cvs(age_array, df_country_male, df_country_female):
    data = []

    for i in range(len(age_array)):
        sub_data = []
        sub_data.append(age_array[i])
        sub_data.append(df_country_male[age_array[i]])
        sub_data.append(df_country_female[age_array[i]])
        
        data.append(sub_data)

    df = pd.DataFrame(data, columns = ['Age', 'M', 'F'])
    print(df.head)

if __name__ == "__main__":
    main()