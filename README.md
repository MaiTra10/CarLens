# CarLens

## Overview
The AI-Powered Listing Management System automates the extraction, parsing, storage, and presentation of car listings. It leverages the AI Models of Deepseek and Jira to web scrape listing data, map the extracted values to predefined variables, store the information in a AWS SQL database, and dynamically generate frontend cards that display the listing details along with a summary evaluation of whether the listing is a good deal.

## How To Use
1. **Register, login, or continue as guest.**
    Registering and logging in will save your query requests to the database and will be stored on your account.
    <br>**Sample Login:**
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Email: test@sample.com
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Password: SampleTest123!
2. **Input a URL or manually enter the information of the request you want to make.**
    Let the AI generate a response and create a card with all the convenient information.
3. **Keep track of your requests and easily view and compare your selected vehicle listings.**

## Key Features
- **AI Data Extraction**  
  The system uses an AI model to process raw listing data (from URLs or manual inputs) and extract key details such as:
  - Title
  - Price
  - Dealer Information and Dealer Rating
  - Odometer, Transmission, and Drivetrain
  - VIN, Condition, and Insurance Status
  - Description, Specifications, Creation Date, and Free Carfax availability

- **Variable Mapping**  
  The extracted values are mapped to a predefined structure with variables that correspond to the database table columns. This mapping ensures that every piece of information is stored in the correct field.

- **Database Integration**  
  The parsed data is saved to a SQL database (postgres), making it easy to retrieve and display the listing information later.

- **Dynamic Frontend Card Rendering**  
  The frontend dynamically generates cards for each listing. These cards display all the relevant data pulled from the database, with each variable neatly arranged and labeled.

- **AI-Generated Summary**  
  In addition to extracting listing details, the AI also generates a concise summary that evaluates whether the listing represents a good deal. This summary is displayed at the bottom of each card, offering a quick, data-driven insight.

## How It Works
1. **Input Processing**  
   The system accepts raw listing data. This can include direct text input, scraped data from URLs, or other semi-structured data sources.

2. **AI Analysis**  
   The AI processes the input and extracts all the relevant fields. You can configure the AI to return data either as structured JSON or as text that is later parsed using regex-based functions.

3. **Data Mapping**  
   Once the AI response is received, it is parsed and mapped to the corresponding variables in a predefined structure (e.g., a Listing struct). This step ensures that the data aligns with the database schema.

4. **Database Storage**  
   The mapped data is inserted into a SQL database. This persistent storage allows for subsequent retrieval and display on the frontend.

5. **Frontend Card Generation**  
   The frontend retrieves the stored data from the database and renders it as cards. Each card includes detailed listing information along with an AI-generated summary indicating whether the listing is a good deal.

## Setup & Configuration
- **Backend**:  
  Built with Go, the backend handles API requests, AI integration, and database interactions. It includes secure handling of API keys and uses environment variables for configuration.

- **Database**:  
  A SQL database on Supabase (AWS) is used to store listing data. The schema matches the predefined structure with fields such as title, price, dealer, etc.

- **Frontend**:  
  A web interface that communicates with the backend to fetch and display listing cards. The design can be customized to highlight key variables and the summary evaluation.

- **AI Integration**:  
  The system integrates with an AI API to perform data extraction and generate summaries. Prompts are configured to ensure that the AI returns data in a structured format.

## Conclusion
This project leverages AI to automate the process of data extraction, organization, and presentation for used car listings. It is designed to provide a seamless workflow from raw input to a polished frontend display, allowing users to quickly assess and act upon the listings that matter to them.
