import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Users, Building2, Calendar, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MultiSelect } from '@/components/MultiSelect';
import { FileUpload } from '@/components/FileUpload';
import { useToast } from '@/components/ui/use-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const ManpowerDashboard = () => {
  const dashboardRef = useRef(null);
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    executiveType: [] as string[],
    ageGroup: [] as string[],
    gender: [] as string[],
    department: [] as string[]
  });

  // State for uploaded data
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [isDataUploaded, setIsDataUploaded] = useState(false);

  // Static data (will be dynamic later)
  const [metrics, setMetrics] = useState({
    totalEmployees: 736,
    executives: 225,
    departments: 5,
    avgAge: 32.5
  });

  const [filterOptions, setFilterOptions] = useState({
    executiveType: ['Executive', 'Non-Executive'],
    ageGroup: ['35-40', '40-45', '45-50', '50+'],
    gender: ['Male', 'Female'],
    department: ['BSP', 'DSP', 'RSP', 'BSL', 'ISP']
  });

  // Handle uploaded data
  const handleDataLoaded = (data: any) => {
    console.log('Received manpower data:', data);
    setUploadedData(data);
    setIsDataUploaded(true);
    
    // Update metrics with uploaded data
    setMetrics({
      totalEmployees: data.totalEmployees,
      executives: data.executives,
      departments: data.departments,
      avgAge: data.avgAge
    });

    // Update filter options if available
    if (data.filterOptions) {
      setFilterOptions(data.filterOptions);
    }
  };

  // Chart data - updated to use uploaded data when available
  const getDepartmentData = () => {
    if (isDataUploaded && uploadedData?.departmentData) {
      const labels = uploadedData.departmentData.map((item: any) => item.department);
      const data = uploadedData.departmentData.map((item: any) => item.count);
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6'];
      
      return {
        labels,
        datasets: [{
          label: 'Total Manpower',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      };
    }
    
    // Default static data
    return {
      labels: ['IT', 'HR', 'Finance', 'Marketing', 'Operations'],
      datasets: [{
        label: 'Number of Employees',
        data: [185, 120, 95, 168, 168],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderColor: ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'],
        borderWidth: 1
      }]
    };
  };

  const getGenderData = () => {
    if (isDataUploaded && uploadedData?.genderData) {
      const labels = uploadedData.genderData.map((item: any) => item.gender);
      const data = uploadedData.genderData.map((item: any) => item.count);
      const colors = ['#3b82f6', '#ec4899', '#6b7280'];
      
      return {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2
        }]
      };
    }
    
    // Default static data
    return {
      labels: ['Male', 'Female', 'Other'],
      datasets: [{
        data: [420, 298, 18],
        backgroundColor: ['#3b82f6', '#ec4899', '#6b7280'],
        borderColor: ['#2563eb', '#db2777', '#4b5563'],
        borderWidth: 2
      }]
    };
  };

  // Chart data
  const departmentData = getDepartmentData();
  const genderData = getGenderData();

  const ageGroupTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: '20-30',
        data: [45, 52, 48, 61, 58, 65],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: '31-40',
        data: [38, 42, 45, 48, 52, 55],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: '41+',
        data: [22, 25, 28, 26, 30, 32],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  };

  const handleFilterChange = (filterType: keyof typeof filters, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const generateReport = () => {
    const hasFilters = Object.values(filters).some(arr => arr.length > 0);
    
    if (!hasFilters) {
      toast({
        title: "Error",
        description: "Please select at least one filter before generating the report.",
        variant: "destructive"
      });
      return;
    }

    console.log('Generating report with filters:', filters);
    toast({
      title: "Report Generated",
      description: "Charts have been updated based on selected filters.",
    });
  };

  const exportToPDF = async () => {
    if (dashboardRef.current) {
      try {
        toast({
          title: "Exporting...",
          description: "Generating PDF export, please wait.",
        });

        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 30;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save('manpower-dashboard.pdf');

        toast({
          title: "Export Successful",
          description: "Dashboard has been exported to PDF.",
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          title: "Export Failed",
          description: "There was an error exporting the dashboard.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div ref={dashboardRef} className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manpower Overview Dashboard</h1>
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* File Upload Section */}
        <FileUpload onDataLoaded={handleDataLoaded} />

        {/* Data Source Indicator */}
        {isDataUploaded && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Data Source: Uploaded Manpower Excel File
                </Badge>
                <span className="text-sm text-green-700">
                  Dashboard is now showing data from your uploaded manpower file
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Manpower</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.totalEmployees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active workforce
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executives</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.executives.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Executive cadre
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plants/Units</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.departments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Operating units
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Age</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.avgAge}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Years old
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Cadre Type</label>
                <MultiSelect
                  options={filterOptions.executiveType}
                  value={filters.executiveType}
                  onChange={(values) => handleFilterChange('executiveType', values)}
                  placeholder="Select cadre types"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Age Group</label>
                <MultiSelect
                  options={filterOptions.ageGroup}
                  value={filters.ageGroup}
                  onChange={(values) => handleFilterChange('ageGroup', values)}
                  placeholder="Select age groups"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Gender</label>
                <MultiSelect
                  options={filterOptions.gender}
                  value={filters.gender}
                  onChange={(values) => handleFilterChange('gender', values)}
                  placeholder="Select genders"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Plant/Unit</label>
                <MultiSelect
                  options={filterOptions.department}
                  value={filters.department}
                  onChange={(values) => handleFilterChange('department', values)}
                  placeholder="Select plants/units"
                />
              </div>
            </div>

            <Button onClick={generateReport} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Manpower by Plant/Unit */}
          <Card>
            <CardHeader>
              <CardTitle>Manpower by Plant/Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={departmentData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut data={genderData} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Age Group Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Age Group Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={ageGroupTrendsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManpowerDashboard;
