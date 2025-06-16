
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onDataLoaded: (data: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Parsed Excel data:', jsonData);
        
        // Process the data to match our dashboard structure
        const processedData = processExcelData(jsonData);
        onDataLoaded(processedData);

        toast({
          title: "File Uploaded Successfully",
          description: `Loaded ${jsonData.length} rows of data from ${file.name}`,
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Upload Failed",
          description: "Error reading the Excel file. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processExcelData = (data: any[]) => {
    // Process the raw Excel data to match dashboard structure
    // This is a basic implementation - you can customize based on your Excel structure
    const departments = [...new Set(data.map(row => row.Department || row.department))].filter(Boolean);
    const genders = [...new Set(data.map(row => row.Gender || row.gender))].filter(Boolean);
    const ageGroups = [...new Set(data.map(row => row.AgeGroup || row.age_group || row['Age Group']))].filter(Boolean);
    const executiveTypes = [...new Set(data.map(row => row.ExecutiveType || row.executive_type || row['Executive Type']))].filter(Boolean);

    // Count employees by department
    const departmentCounts = departments.map(dept => ({
      department: dept,
      count: data.filter(row => (row.Department || row.department) === dept).length
    }));

    // Count by gender
    const genderCounts = genders.map(gender => ({
      gender: gender,
      count: data.filter(row => (row.Gender || row.gender) === gender).length
    }));

    return {
      totalEmployees: data.length,
      departments: departments.length,
      executives: data.filter(row => 
        (row.ExecutiveType || row.executive_type || row['Executive Type'])?.toLowerCase().includes('executive')
      ).length,
      avgAge: data.reduce((sum, row) => sum + (Number(row.Age || row.age) || 0), 0) / data.length,
      departmentData: departmentCounts,
      genderData: genderCounts,
      rawData: data
    };
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Upload Excel File
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button onClick={handleButtonClick} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Choose Excel File
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Upload an Excel file (.xlsx or .xls) containing employee data.<br />
            Expected columns: Name, Department, Gender, Age, Executive Type
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
