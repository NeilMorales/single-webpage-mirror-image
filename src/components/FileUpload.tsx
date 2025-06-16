
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
        const processedData = processManpowerData(jsonData);
        onDataLoaded(processedData);

        toast({
          title: "File Uploaded Successfully",
          description: `Loaded ${jsonData.length} rows of manpower data from ${file.name}`,
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

  const processManpowerData = (data: any[]) => {
    // Process the manpower data based on your structure
    const plants = [...new Set(data.map(row => row['Plant/Unit'] || row.Plant || row.Unit).filter(Boolean))];
    const cadres = [...new Set(data.map(row => row.Cadre).filter(Boolean))];
    const years = [...new Set(data.map(row => {
      const dateStr = row['Year/Date'] || row.Year || row.Date;
      if (dateStr) {
        return new Date(dateStr).getFullYear().toString();
      }
      return null;
    }).filter(Boolean))];

    // Calculate totals
    const totalManpower = data.reduce((sum, row) => sum + (Number(row['Manpower Count']) || 0), 0);
    const totalExecutives = data.filter(row => row.Cadre === 'Executive').reduce((sum, row) => sum + (Number(row['Manpower Count']) || 0), 0);
    const uniquePlants = plants.length;

    // Calculate average age (weighted by manpower count)
    const totalAgeWeight = data.reduce((sum, row) => {
      const manpower = Number(row['Manpower Count']) || 0;
      const avgAge = Number(row['Average Age']) || 0;
      return sum + (manpower * avgAge);
    }, 0);
    const avgAge = totalManpower > 0 ? totalAgeWeight / totalManpower : 0;

    // Department/Plant data for charts
    const departmentData = plants.map(plant => ({
      department: plant,
      count: data.filter(row => (row['Plant/Unit'] || row.Plant || row.Unit) === plant)
        .reduce((sum, row) => sum + (Number(row['Manpower Count']) || 0), 0)
    }));

    // Gender data
    const genderData = [
      {
        gender: 'Male',
        count: data.reduce((sum, row) => sum + (Number(row['Male Manpower']) || 0), 0)
      },
      {
        gender: 'Female',
        count: data.reduce((sum, row) => sum + (Number(row['Female Manpower']) || 0), 0)
      }
    ];

    // Age groups based on average age ranges
    const ageGroups = ['35-40', '40-45', '45-50', '50+'];
    const cadreTypes = ['Executive', 'Non-Executive'];

    return {
      totalEmployees: totalManpower,
      departments: uniquePlants,
      executives: totalExecutives,
      avgAge: Math.round(avgAge * 10) / 10,
      departmentData,
      genderData,
      filterOptions: {
        executiveType: cadreTypes,
        ageGroup: ageGroups,
        gender: ['Male', 'Female'],
        department: plants
      },
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
          Upload Manpower Data (Excel)
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
            Upload an Excel file (.xlsx or .xls) containing manpower data.<br />
            Expected columns: Plant/Unit, Year/Date, Cadre, Manpower Count, Male Manpower, Female Manpower, Average Age
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
