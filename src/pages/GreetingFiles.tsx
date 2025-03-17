import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { AudioWaveform, Trash, Upload, Play, Pause, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GreetingFile {
  id: string;
  name: string;
  description: string;
  duration: string;
  dateAdded: Date;
  url: string;
  isPlaying: boolean;
}

const GreetingFiles = () => {
  const [files, setFiles] = useState<GreetingFile[]>([
    {
      id: "1",
      name: "Welcome-Message.wav",
      description: "Main welcome greeting for all campaigns",
      duration: "0:15",
      dateAdded: new Date(2023, 5, 12),
      url: "#",
      isPlaying: false
    },
    {
      id: "2",
      name: "After-Hours.mp3",
      description: "Message for after business hours",
      duration: "0:22",
      dateAdded: new Date(2023, 6, 18),
      url: "#",
      isPlaying: false
    }
  ]);
  
  const [description, setDescription] = useState("");
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const file = selectedFiles[0];
    
    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (wav, mp3)",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new greeting file entry
    const newFile: GreetingFile = {
      id: Date.now().toString(),
      name: file.name,
      description: description || "No description provided",
      duration: "0:00", // In a real app, we would analyze the file to get the duration
      dateAdded: new Date(),
      url: URL.createObjectURL(file),
      isPlaying: false
    };
    
    setFiles([...files, newFile]);
    setDescription("");
    
    toast({
      title: "File uploaded",
      description: `${file.name} has been added to your greetings`,
    });
  };
  
  const handleDelete = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    toast({
      title: "File deleted",
      description: "The greeting file has been removed",
    });
  };
  
  const togglePlay = (id: string) => {
    setFiles(files.map(file => {
      if (file.id === id) {
        return { ...file, isPlaying: !file.isPlaying };
      }
      return file;
    }));
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <DashboardNav />
            </div>
            <div className="md:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Greeting Files</h1>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload New Greeting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Audio File</Label>
                      <Input 
                        id="file-upload" 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleFileUpload}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Enter a description for this greeting"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AudioWaveform className="mr-2 h-5 w-5" />
                    Your Greeting Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {files.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No greeting files yet. Upload your first audio file.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Date Added</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">{file.name}</TableCell>
                            <TableCell>{file.description}</TableCell>
                            <TableCell>{file.duration}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDistanceToNow(file.dateAdded, { addSuffix: true })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => togglePlay(file.id)}>
                                  {file.isPlaying ? 
                                    <Pause className="h-4 w-4" /> : 
                                    <Play className="h-4 w-4" />
                                  }
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)}>
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GreetingFiles;
