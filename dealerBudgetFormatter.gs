function onStart() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = ss.getSheetByName("Raw");
  const outputSheetName = "Output";

  if (!inputSheet) {
    SpreadsheetApp.getUi().alert("❌ Sheet named 'Raw' not found.");
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt("Enter Total Budget", "Please enter the total budget in dollars (e.g., $100000 or 100000.50):", ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  // Parse and clean input
  const rawBudgetInput = response.getResponseText().replace(/[^\d.]/g, '');
  const totalBudget = parseFloat(rawBudgetInput);
  if (isNaN(totalBudget) || totalBudget <= 0) {
    ui.alert("❌ Please enter a valid numeric budget amount.");
    return;
  }

  const rawDataRange = inputSheet.getRange("A1:A" + inputSheet.getLastRow());
  const rawData = rawDataRange ? rawDataRange.getValues().flat() : [];
  if (!rawData.length || rawData.every(line => line.trim() === "")) {
    ui.alert("⚠️ No valid data found in 'Raw' sheet.");
    return;
  }

  // Prepare Output sheet
  let outputSheet = ss.getSheetByName(outputSheetName);
  if (outputSheet) {
    outputSheet.clear();
  } else {
    outputSheet = ss.insertSheet(outputSheetName);
  }

  // Row 1: Budget Label and Value
  outputSheet.getRange("E1").setValue("Amount Entered by User:");
  outputSheet.getRange("F1").setValue(totalBudget)
    .setFontWeight("bold")
    .setNumberFormat("$#,##0.00")
    .setFontColor("#333")
    .setFontSize(10)
    .setHorizontalAlignment("center");

  // Row 2: Column headers
  const headers = ["Dealer Name", "BAC Code", "%", "Budget"];
  outputSheet.getRange("A2:D2").setValues([headers]);

  // Formatting headers
  const headerRange = outputSheet.getRange("A2:D2");
  headerRange.setFontWeight("bold")
    .setBackground("#3c78d8")
    .setFontColor("white")
    .setHorizontalAlignment("center")
    .setFontSize(10);

  const dealerRegex = /^(.+?)\s+(\d{6})\s+(\d{1,2}\.\d{1,2})%$/;
  let outputRows = [];
  let errorRows = [];

  rawData.forEach((line) => {
    if (line.trim() === "" || line.startsWith("Page")) return;

    const match = line.match(dealerRegex);
    if (match) {
      const name = match[1].trim();
      const bac = match[2];
      const percent = parseFloat(match[3]) / 100;
      outputRows.push([name, bac, percent, ""]); // Budget formula later
    } else {
      errorRows.push([line]);
    }
  });

  // Data starts from row 3
  const dataStartRow = 3;
  const dataEndRow = dataStartRow + outputRows.length - 1;

  if (outputRows.length) {
    outputSheet.getRange(dataStartRow, 1, outputRows.length, 4).setValues(outputRows);
  }

  // Apply formulas for budget calculation
  for (let i = 0; i < outputRows.length; i++) {
    const row = dataStartRow + i;
    outputSheet.getRange(row, 4).setFormula(`=C${row}*$F$1`);
  }

  // Totals row
  const totalRow = dataEndRow + 1;
  outputSheet.getRange(totalRow, 1).setValue("Totals");
  outputSheet.getRange(totalRow, 3).setFormula(`=SUM(C${dataStartRow}:C${dataEndRow})`);
  outputSheet.getRange(totalRow, 4).setFormula(`=SUM(D${dataStartRow}:D${dataEndRow})`);

  // Center align totals
  outputSheet.getRange(totalRow, 3, 1, 2).setHorizontalAlignment("center");

  // Error log
  if (errorRows.length) {
    const errorTitleRow = totalRow + 2;
    outputSheet.getRange(errorTitleRow, 1).setValue("⚠️ Unmatched Entries (Check Formatting Below):")
      .setFontWeight("bold").setFontColor("red");
    outputSheet.getRange(errorTitleRow + 1, 1, errorRows.length, 1).setValues(errorRows);
    outputSheet.getRange(errorTitleRow + 1, 1, errorRows.length, 1)
      .setBorder(true, true, true, true, true, true, "#f00", SpreadsheetApp.BorderStyle.DASHED);
  }

  // Format columns
  outputSheet.getRange(`C${dataStartRow}:C${dataEndRow}`).setNumberFormat("0.00%");
  outputSheet.getRange(`D${dataStartRow}:D${dataEndRow}`).setNumberFormat("$#,##0.00");
  outputSheet.getRange(totalRow, 3).setNumberFormat("0.00%");
  outputSheet.getRange(totalRow, 4).setNumberFormat("$#,##0.00");
  outputSheet.getRange(`B${dataStartRow}:D${dataEndRow}`).setHorizontalAlignment("center");

  outputSheet.setColumnWidths(1, 1, 320);
  outputSheet.setColumnWidths(2, 1, 120);
  outputSheet.setColumnWidths(3, 1, 120);
  outputSheet.setColumnWidths(4, 1, 160);
  outputSheet.setColumnWidths(5, 1, 200);
  outputSheet.setColumnWidths(6, 1, 180);

  // Borders
  const totalDataRows = outputSheet.getLastRow();
  outputSheet.getRange(2, 1, totalDataRows - 1, 4)
    .setBorder(true, true, true, true, true, true, "#999", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // Conditional formatting
  const rules = [];
  const percentTotalCell = outputSheet.getRange(totalRow, 3);
  const budgetTotalCell = outputSheet.getRange(totalRow, 4);

  // Highlight total % green/red
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=ABS(C${totalRow} - 1) < 0.01`)
    .setBackground("#d9ead3")
    .setFontColor("#000")
    .setRanges([percentTotalCell])
    .build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=ABS(C${totalRow} - 1) >= 0.01`)
    .setBackground("#f4cccc")
    .setFontColor("#000")
    .setRanges([percentTotalCell])
    .build());

  // Highlight total budget match
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=ABS(D${totalRow} - F1) < 1`)
    .setBackground("#d9ead3")
    .setFontColor("#000")
    .setRanges([budgetTotalCell])
    .build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=ABS(D${totalRow} - F1) >= 1`)
    .setBackground("#f4cccc")
    .setFontColor("#000")
    .setRanges([budgetTotalCell])
    .build());

  // Red if any dealer budget is strictly less than $100
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=D3<100`)
    .setBackground("#fce5cd")
    .setFontColor("#cc0000")
    .setRanges([outputSheet.getRange(`D${dataStartRow}:D${dataEndRow}`)])
    .build());

  outputSheet.setConditionalFormatRules(rules);

  // Switch to Output sheet
  ss.setActiveSheet(outputSheet);
  SpreadsheetApp.flush();
}