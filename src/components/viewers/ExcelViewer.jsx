import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const ExcelViewer = ({ file, setError }) => {
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        
        const sheets = workbook.SheetNames.map(name => {
          const sheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          return {
            name,
            data: jsonData
          };
        });

        setExcelData(sheets);
      } catch (error) {
        console.error('Error loading Excel:', error);
        setError('Failed to load Excel file. Please make sure it\'s a valid spreadsheet.');
      }
    };

    if (file) {
      loadExcel();
    }
  }, [file, setError]);

  const renderSheet = (sheet) => {
    if (!sheet || !sheet.data || sheet.data.length === 0) {
      return <div className="excel-empty">No data in this sheet</div>;
    }

    return (
      <div className="excel-container">
        <table className="excel-table">
          <thead>
            <tr>
              {sheet.data[0].map((cell, index) => (
                <th key={index}>{cell || ''}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!excelData) return null;

  return (
    <div className="excel-viewer">
      <div className="excel-tabs">
        {excelData.map((sheet, index) => (
          <button
            key={sheet.name}
            className={`excel-tab ${index === activeSheet ? 'active' : ''}`}
            onClick={() => setActiveSheet(index)}
          >
            {sheet.name}
          </button>
        ))}
      </div>
      {renderSheet(excelData[activeSheet])}
    </div>
  );
};

export default ExcelViewer;
