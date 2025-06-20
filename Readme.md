# Dealer Budget Formatter 🧾💰

A Google Sheets + Apps Script tool that transforms raw dealership budget allocations into a structured format with auto-calculated budgets, total validations, and clean presentation.

---

## ✨ Features

- Accepts raw dealer lines in `Dealer Name BAC_Code Percentage%` format  
- Prompts user for a total budget input  
- Calculates each dealer’s budget share  
- Validates:
  - Total % must be exactly 100%
  - Total budget must match user input
  - Dealer budget below $100 is flagged
- Logs unmatched or invalid entries
- Applies professional styling, borders, column widths, and colors

---

## 📋 Input Format

Paste your raw data into the **"Raw"** sheet, Column A. Each line should follow this format:

[DEALER NAME] [6-digit BAC CODE] [PERCENTAGE]%


**Example:**

ABC MOTORS 123456 2.50%

XYZ AUTO GROUP 654321 3.75%

## 🛠️ How to Use

1. **Set Up Your Google Sheet:**
   - Rename your sheets:
     - `Raw` → for raw input data
     - `Execution` → for the script button and user instructions

2. **Paste Your Data:**
   - Go to the `Raw` sheet
   - Paste raw dealer data in Column A, one entry per line

3. **Add the Script:**
   - Open Google Sheets
   - Go to `Extensions` → `Apps Script`
   - Delete any existing code
   - Paste the entire script into the editor (save as `dealerBudgetFormatter.gs`)
   - Save the script

4. **Add a Button to Run the Script:**
   - Go to the `Execution` sheet
   - Insert a Drawing: `Insert` → `Drawing` → create a shape (e.g., "Start")
   - After inserting the button:
     - Click on the shape
     - Select the 3 vertical dots (⋮) → `Assign Script`
     - Type: `onStart` and click OK

5. **Run the Script:**
   - Click the **Start** button
   - When prompted, enter your total budget (e.g., `100000`, `75000.50`, or `$120000`)
   - The script will create or refresh an `Output` sheet with clean formatted results

6. **Review Output:**
   - Budget values are auto-calculated
   - Total percentage must equal 100%
   - Dealers with budgets below $100 are highlighted
   - Any unmatched or malformed rows are listed at the bottom

## ✅ Output Example

| Dealer Name     | BAC Code | %      | Budget     |
|----------------|----------|--------|------------|
| ABC MOTORS     | 123456   | 2.50%  | $2,500.00  |
| XYZ AUTO GROUP | 654321   | 3.75%  | $3,750.00  |
| **Totals**     |          | 100.00%| $100,000.00|

- ✅ Green highlight = totals match  
- ❌ Red highlight = budget mismatch or % off  
- 🔴 Dealers with budget < $100 are flagged  
- ⚠️ Unmatched entries shown at the bottom

---

## 💡 Use Cases

- Dealership marketing budget planning  
- Fund allocation by regional sales percentage  
- Cleaning and formatting dealer data from CRM exports

---

## 👤 Author

Created by Chalapathi Revanth

MIT License © 2025