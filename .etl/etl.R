#' This script will generate the simulated data

{ # Setup -------------------------------------------------------------------
  
  { # Dependencies ---------------------------------------------------------------
    library(tidyverse)
    library(geojsonio)  
    library(geoarrow)
    library(glue)
    library(curl)  
  }
  
  { ## UHC seeds ----------------------------------------------------
    
    uhc_api = 'https://github.com/Drexel-UHC/data-science/raw/main/etl/clean' 
    sf_county_seed =  glue("{uhc_api}/boundaries/county.json") %>% topojson_read()
    sf_place_seed =  glue("{uhc_api}/boundaries/place.json") %>% topojson_read()
    curl_download(glue("{uhc_api}/df_demographics.parquet") , "processed/df_demographics.parquet")
    curl_download(glue("{uhc_api}/xwalk_state.parquet") , "processed/xwalk_state.parquet")
    df_demographics = arrow::read_parquet('processed/df_demographics.parquet')
    xwalk_state = arrow::read_parquet('processed/xwalk_state.parquet')
    
  }
  
}


{# US Trends ---------------------------------------------------------------
  
  df_us = read.csv("raw/NCHS_-_Death_rates_and_life_expectancy_at_birth.csv") %>% as_tibble() %>% 
    janitor::clean_names() %>% 
    filter(race == "All Races", sex == 'Both Sexes',
           year > 1980) %>% 
    select(year, 
           le = average_life_expectancy_years) %>% 
    mutate(group = 'US')
  
}


{ # Philly Simulated --------------------------------------------------------
  
  df_philly =  read.csv("raw/le_gpt_philly.csv") %>% as_tibble() %>% 
    mutate(group = "Philadelphia")
  
  df_data = bind_rows(df_philly, df_us)
  df_data %>% 
    ggplot(aes(x =year, y = le, group = group, color = group))+
    geom_line()+
    ylim(60,80)
  
  
}

{ # Export ------------------------------------------------------------------
  
  df_data %>% jsonlite::write_json("../public/data/data_trends.json")
  
}
