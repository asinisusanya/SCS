// Google Sheets utility functions for fetching data

const GOOGLE_SHEETS_ID = "1mgQ-JDTQfkRxHwaQiYq2AEjIv7XduD0WNdu6XnKNJk4";

// Function to fetch data from a specific sheet tab as CSV
export const fetchGoogleSheetAsCSV = async (sheetName: string): Promise<string> => {
  try {
    // Use the public CSV export URL format for Google Sheets
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    
    console.log(`Fetching data from Google Sheet: ${sheetName}`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    if (!csvText.trim()) {
      throw new Error(`No data found in sheet: ${sheetName}`);
    }
    
    console.log(`Successfully fetched ${csvText.length} characters from ${sheetName}`);
    return csvText;
  } catch (error) {
    console.error(`Error fetching Google Sheet ${sheetName}:`, error);
    throw error;
  }
};

// Function to parse CSV data with proper quote handling
export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  console.log("CSV Headers:", headers);

  const rows = lines.slice(1).map((line, index) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/"/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/"/g, ""));

    const row: any = {};
    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] || "";
    });

    return row;
  });

  return rows.filter((row) => Object.values(row).some(value => value && value.toString().trim()));
};

// Function to fetch course schedule data
export const fetchCourseSchedule = async () => {
  try {
    const csvText = await fetchGoogleSheetAsCSV("course-schedule");
    const data = parseCSV(csvText);
    
    // Filter out empty rows and validate required fields
    const validData = data.filter((row) => 
      row.courseCode && row.Day && row.timeSlot && row.hall
    );
    
    console.log(`Fetched ${validData.length} course schedule entries`);
    return validData;
  } catch (error) {
    console.error("Error fetching course schedule:", error);
    throw error;
  }
};

// Function to fetch notices data
export const fetchNotices = async () => {
  try {
    const csvText = await fetchGoogleSheetAsCSV("notices");
    const data = parseCSV(csvText);
    
    // Filter out empty rows and validate required fields
    const validData = data.filter((row) => 
      row.id && row.title && row.message
    );
    
    console.log(`Fetched ${validData.length} notices`);
    return validData;
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};



// Function to fetch images data
export const fetchImages = async () => {
  try {
    const csvText = await fetchGoogleSheetAsCSV("images");
    const data = parseCSV(csvText);
    console.log("Raw image data from Google Sheet:", data);
    
    // Filter out empty rows and validate required fields
    const validData = data.filter((row) => 
      row["image link"] && row.Title && row.Descrition
    ).map(row => ({
      imageUrl: row["image link"],
      title: row.Title,
      description: row.Descrition,
    }));
    
    console.log(`Fetched ${validData.length} valid images`);
    return validData;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

